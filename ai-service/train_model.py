"""
Machine Learning Model Training Script
Complete production-ready training pipeline for crop recommendation
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score, GridSearchCV
import joblib
import os
import time
import logging
from pathlib import Path

# Import custom modules
from app.ml.preprocessing import DataPreprocessor
from app.ml.feature_engineering import FeatureEngineer
from app.ml.model_utils import (
    ModelManager, MetricsCalculator, 
    FeatureImportanceAnalyzer, DataSplitter,
    create_training_report
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def train_crop_model(
    data_path: str = "Crop_recommendation.csv",
    test_size: float = 0.2,
    random_state: int = 42,
    perform_tuning: bool = True,
    use_feature_engineering: bool = True
):
    """
    Train the crop recommendation model with complete pipeline
    
    Args:
        data_path: Path to the dataset
        test_size: Proportion of test set
        random_state: Random seed for reproducibility
        perform_tuning: Whether to perform hyperparameter tuning
        use_feature_engineering: Whether to apply feature engineering
    """
    logger.info("="*80)
    logger.info("CROP RECOMMENDATION MODEL TRAINING PIPELINE")
    logger.info("="*80)
    
    start_time = time.time()
    
    # Initialize components
    preprocessor = DataPreprocessor()
    feature_engineer = FeatureEngineer()
    model_manager = ModelManager(model_dir="models")
    
    # ========================================
    # STEP 1: DATA LOADING
    # ========================================
    logger.info("\n[STEP 1] Loading dataset...")
    df = preprocessor.load_data(data_path)
    logger.info(f"Dataset shape: {df.shape}")
    logger.info(f"Columns: {df.columns.tolist()}")
    
    # ========================================
    # STEP 2: DATA EXPLORATION
    # ========================================
    logger.info("\n[STEP 2] Data exploration...")
    data_summary = preprocessor.get_data_summary(df)
    logger.info(f"Number of crops: {df['label'].nunique()}")
    logger.info(f"Crop distribution:\n{df['label'].value_counts()}")
    
    # ========================================
    # STEP 3: DATA CLEANING
    # ========================================
    logger.info("\n[STEP 3] Data cleaning...")
    
    # Check missing values
    missing_info = preprocessor.check_missing_values(df)
    if missing_info['total_missing'] > 0:
        logger.warning(f"Found {missing_info['total_missing']} missing values")
        df = preprocessor.handle_missing_values(df, strategy='mean')
    else:
        logger.info("No missing values found")
    
    # Remove duplicates
    df = preprocessor.remove_duplicates(df)
    
    # Detect outliers
    numeric_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    outliers_info = preprocessor.detect_outliers(df, columns=numeric_cols)
    for col, info in outliers_info.items():
        logger.info(f"{col}: {info['count']} outliers ({info['percentage']:.2f}%)")
    
    # ========================================
    # STEP 4: FEATURE ENGINEERING
    # ========================================
    if use_feature_engineering:
        logger.info("\n[STEP 4] Feature engineering...")
        
        # Separate features and target
        X = df.drop('label', axis=1)
        y = df['label']
        
        # Apply feature engineering
        X_engineered = feature_engineer.apply_all_features(X, include_categorical=False)
        logger.info(f"Features after engineering: {X_engineered.shape[1]}")
        logger.info(f"New features: {X_engineered.columns.tolist()}")
    else:
        logger.info("\n[STEP 4] Skipping feature engineering...")
        X = df.drop('label', axis=1)
        y = df['label']
    
    # ========================================
    # STEP 5: LABEL ENCODING
    # ========================================
    logger.info("\n[STEP 5] Encoding labels...")
    y_encoded = preprocessor.encode_labels(y, fit=True)
    label_mapping = {i: label for i, label in enumerate(preprocessor.label_encoder.classes_)}
    logger.info(f"Label mapping: {label_mapping}")
    
    # ========================================
    # STEP 6: TRAIN-TEST SPLIT
    # ========================================
    logger.info("\n[STEP 6] Splitting data...")
    X_train, X_test, y_train, y_test = DataSplitter.train_test_split(
        X_engineered if use_feature_engineering else X,
        y_encoded,
        test_size=test_size,
        random_state=random_state,
        stratify=True
    )
    
    split_info = DataSplitter.get_split_info(X_train, X_test, y_train, y_test)
    logger.info(f"Train samples: {split_info['train_samples']}")
    logger.info(f"Test samples: {split_info['test_samples']}")
    
    # ========================================
    # STEP 7: FEATURE SCALING
    # ========================================
    logger.info("\n[STEP 7] Scaling features...")
    X_train_scaled = preprocessor.scale_features(X_train, fit=True)
    X_test_scaled = preprocessor.scale_features(X_test, fit=False)
    
    # ========================================
    # STEP 8: MODEL TRAINING
    # ========================================
    logger.info("\n[STEP 8] Training Random Forest model...")
    
    if perform_tuning:
        logger.info("Performing hyperparameter tuning...")
        
        # Define parameter grid
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [10, 20, 30, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4],
            'max_features': ['sqrt', 'log2']
        }
        
        # Initialize base model
        rf_base = RandomForestClassifier(random_state=random_state)
        
        # Grid search with cross-validation
        grid_search = GridSearchCV(
            rf_base,
            param_grid,
            cv=5,
            scoring='accuracy',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(X_train_scaled, y_train)
        
        # Best model
        model = grid_search.best_estimator_
        best_params = grid_search.best_params_
        logger.info(f"Best parameters: {best_params}")
        logger.info(f"Best CV score: {grid_search.best_score_:.4f}")
    else:
        # Train with default parameters
        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features='sqrt',
            random_state=random_state,
            n_jobs=-1
        )
        model.fit(X_train_scaled, y_train)
        best_params = model.get_params()
    
    training_time = time.time() - start_time
    logger.info(f"Training completed in {training_time:.2f} seconds")
    
    # ========================================
    # STEP 9: CROSS-VALIDATION
    # ========================================
    logger.info("\n[STEP 9] Performing cross-validation...")
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='accuracy')
    cv_metrics = MetricsCalculator.calculate_cross_validation_metrics({'accuracy': cv_scores})
    logger.info(f"CV Accuracy: {cv_metrics['accuracy']['mean']:.4f} (+/- {cv_metrics['accuracy']['std']:.4f})")
    
    # ========================================
    # STEP 10: MODEL EVALUATION
    # ========================================
    logger.info("\n[STEP 10] Evaluating model...")
    
    # Predictions
    y_train_pred = model.predict(X_train_scaled)
    y_test_pred = model.predict(X_test_scaled)
    
    # Calculate metrics
    train_metrics = MetricsCalculator.calculate_classification_metrics(
        y_train, y_train_pred, labels=preprocessor.label_encoder.classes_
    )
    test_metrics = MetricsCalculator.calculate_classification_metrics(
        y_test, y_test_pred, labels=preprocessor.label_encoder.classes_
    )
    
    logger.info(f"Train Accuracy: {train_metrics['accuracy']:.4f}")
    logger.info(f"Test Accuracy: {test_metrics['accuracy']:.4f}")
    logger.info(f"Test Precision (weighted): {test_metrics['precision_weighted']:.4f}")
    logger.info(f"Test Recall (weighted): {test_metrics['recall_weighted']:.4f}")
    logger.info(f"Test F1 Score (weighted): {test_metrics['f1_weighted']:.4f}")
    
    # Per-class accuracy
    per_class_acc = MetricsCalculator.calculate_per_class_accuracy(
        y_test, y_test_pred, preprocessor.label_encoder.classes_
    )
    logger.info("\nPer-class accuracy:")
    for crop, acc in per_class_acc.items():
        logger.info(f"  {crop}: {acc:.4f}")
    
    # ========================================
    # STEP 11: FEATURE IMPORTANCE
    # ========================================
    logger.info("\n[STEP 11] Analyzing feature importance...")
    feature_names = X_engineered.columns.tolist() if use_feature_engineering else X.columns.tolist()
    feature_importance = FeatureImportanceAnalyzer.get_feature_importance(model, feature_names)
    top_features = FeatureImportanceAnalyzer.get_top_features(feature_importance, top_n=10)
    
    logger.info("Top 10 most important features:")
    for i, (feature, importance) in enumerate(top_features.items(), 1):
        logger.info(f"  {i}. {feature}: {importance:.4f}")
    
    # ========================================
    # STEP 12: MODEL SERIALIZATION
    # ========================================
    logger.info("\n[STEP 12] Saving models and artifacts...")
    
    # Create models directory
    os.makedirs("models", exist_ok=True)
    
    # Save model
    model_metadata = {
        'model_type': 'RandomForestClassifier',
        'accuracy': test_metrics['accuracy'],
        'n_features': len(feature_names),
        'n_classes': len(preprocessor.label_encoder.classes_),
        'classes': preprocessor.label_encoder.classes_.tolist(),
        'hyperparameters': best_params,
        'feature_engineering': use_feature_engineering,
        'training_samples': len(X_train),
        'test_samples': len(X_test)
    }
    model_manager.save_model(model, 'crop_model.pkl', metadata=model_metadata)
    
    # Save scaler
    model_manager.save_model(preprocessor.scaler, 'scaler.pkl')
    
    # Save label encoder
    model_manager.save_model(preprocessor.label_encoder, 'label_encoder.pkl')
    
    # Save feature names
    joblib.dump(feature_names, 'models/feature_names.pkl')
    
    # ========================================
    # STEP 13: GENERATE TRAINING REPORT
    # ========================================
    logger.info("\n[STEP 13] Generating training report...")
    
    report = create_training_report(
        model_name='RandomForestClassifier',
        metrics={
            'train': train_metrics,
            'test': test_metrics,
            'cross_validation': cv_metrics,
            'per_class_accuracy': per_class_acc
        },
        feature_importance=feature_importance,
        training_time=training_time,
        hyperparameters=best_params
    )
    
    # Save report
    import json
    with open('models/training_report.json', 'w') as f:
        json.dump(report, f, indent=4)
    
    logger.info("Training report saved to models/training_report.json")
    
    # ========================================
    # TRAINING COMPLETE
    # ========================================
    total_time = time.time() - start_time
    logger.info("\n" + "="*80)
    logger.info("TRAINING PIPELINE COMPLETED SUCCESSFULLY")
    logger.info("="*80)
    logger.info(f"Total time: {total_time:.2f} seconds")
    logger.info(f"Final test accuracy: {test_metrics['accuracy']:.4f}")
    logger.info(f"Models saved in: models/")
    logger.info("="*80)
    
    return {
        'model': model,
        'preprocessor': preprocessor,
        'metrics': test_metrics,
        'feature_importance': feature_importance
    }


if __name__ == "__main__":
    # Train the model with full pipeline
    results = train_crop_model(
        data_path="../Crop_recommendation.csv",
        test_size=0.2,
        random_state=42,
        perform_tuning=False,  # Set to True for hyperparameter tuning (takes longer)
        use_feature_engineering=True
    )
