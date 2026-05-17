"""
Model Evaluation Script
Comprehensive evaluation of trained crop recommendation model
"""

import pandas as pd
import numpy as np
import joblib
import json
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score
)
from sklearn.model_selection import cross_val_score
import logging
from pathlib import Path

from app.ml.preprocessing import DataPreprocessor
from app.ml.feature_engineering import FeatureEngineer
from app.ml.model_utils import ModelManager, MetricsCalculator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ModelEvaluator:
    """Comprehensive model evaluation"""
    
    def __init__(self, model_dir: str = "models"):
        self.model_dir = Path(model_dir)
        self.model_manager = ModelManager(model_dir=model_dir)
        
    def load_artifacts(self):
        """Load all model artifacts"""
        logger.info("Loading model artifacts...")
        
        self.model = self.model_manager.load_model('crop_model.pkl')
        self.scaler = self.model_manager.load_model('scaler.pkl')
        self.label_encoder = self.model_manager.load_model('label_encoder.pkl')
        self.feature_names = joblib.load(self.model_dir / 'feature_names.pkl')
        
        logger.info("All artifacts loaded successfully")
        
    def evaluate_on_test_data(self, X_test, y_test):
        """
        Evaluate model on test data
        
        Args:
            X_test: Test features
            y_test: Test labels (encoded)
        """
        logger.info("Evaluating model on test data...")
        
        # Make predictions
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)
        
        # Calculate metrics
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision_macro': precision_score(y_test, y_pred, average='macro', zero_division=0),
            'precision_weighted': precision_score(y_test, y_pred, average='weighted', zero_division=0),
            'recall_macro': recall_score(y_test, y_pred, average='macro', zero_division=0),
            'recall_weighted': recall_score(y_test, y_pred, average='weighted', zero_division=0),
            'f1_macro': f1_score(y_test, y_pred, average='macro', zero_division=0),
            'f1_weighted': f1_score(y_test, y_pred, average='weighted', zero_division=0)
        }
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        
        # Classification report
        report = classification_report(
            y_test, y_pred,
            target_names=self.label_encoder.classes_,
            output_dict=True,
            zero_division=0
        )
        
        logger.info(f"Test Accuracy: {metrics['accuracy']:.4f}")
        logger.info(f"Test F1 Score (weighted): {metrics['f1_weighted']:.4f}")
        
        return {
            'metrics': metrics,
            'confusion_matrix': cm,
            'classification_report': report,
            'predictions': y_pred,
            'probabilities': y_pred_proba
        }
    
    def plot_confusion_matrix(self, cm, save_path: str = "models/confusion_matrix.png"):
        """Plot and save confusion matrix"""
        plt.figure(figsize=(12, 10))
        sns.heatmap(
            cm,
            annot=True,
            fmt='d',
            cmap='Blues',
            xticklabels=self.label_encoder.classes_,
            yticklabels=self.label_encoder.classes_
        )
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        logger.info(f"Confusion matrix saved to {save_path}")
    
    def plot_feature_importance(self, top_n: int = 20, save_path: str = "models/feature_importance.png"):
        """Plot and save feature importance"""
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
            indices = np.argsort(importances)[::-1][:top_n]
            
            plt.figure(figsize=(10, 8))
            plt.title(f'Top {top_n} Feature Importances')
            plt.barh(range(top_n), importances[indices])
            plt.yticks(range(top_n), [self.feature_names[i] for i in indices])
            plt.xlabel('Importance')
            plt.tight_layout()
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            plt.close()
            logger.info(f"Feature importance plot saved to {save_path}")
    
    def plot_class_distribution(self, y_true, y_pred, save_path: str = "models/class_distribution.png"):
        """Plot true vs predicted class distribution"""
        fig, axes = plt.subplots(1, 2, figsize=(14, 6))
        
        # True distribution
        true_counts = pd.Series(y_true).value_counts().sort_index()
        true_labels = [self.label_encoder.classes_[i] for i in true_counts.index]
        axes[0].bar(range(len(true_counts)), true_counts.values)
        axes[0].set_xticks(range(len(true_counts)))
        axes[0].set_xticklabels(true_labels, rotation=45, ha='right')
        axes[0].set_title('True Class Distribution')
        axes[0].set_ylabel('Count')
        
        # Predicted distribution
        pred_counts = pd.Series(y_pred).value_counts().sort_index()
        pred_labels = [self.label_encoder.classes_[i] for i in pred_counts.index]
        axes[1].bar(range(len(pred_counts)), pred_counts.values, color='orange')
        axes[1].set_xticks(range(len(pred_counts)))
        axes[1].set_xticklabels(pred_labels, rotation=45, ha='right')
        axes[1].set_title('Predicted Class Distribution')
        axes[1].set_ylabel('Count')
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        logger.info(f"Class distribution plot saved to {save_path}")
    
    def generate_evaluation_report(self, evaluation_results: dict, save_path: str = "models/evaluation_report.json"):
        """Generate comprehensive evaluation report"""
        report = {
            'timestamp': pd.Timestamp.now().isoformat(),
            'model_type': type(self.model).__name__,
            'n_features': len(self.feature_names),
            'n_classes': len(self.label_encoder.classes_),
            'classes': self.label_encoder.classes_.tolist(),
            'metrics': evaluation_results['metrics'],
            'classification_report': evaluation_results['classification_report']
        }
        
        with open(save_path, 'w') as f:
            json.dump(report, f, indent=4)
        
        logger.info(f"Evaluation report saved to {save_path}")
        return report
    
    def test_single_prediction(self, sample_data: dict):
        """
        Test model with a single sample
        
        Args:
            sample_data: Dictionary with feature values
        """
        logger.info("Testing single prediction...")
        
        # Create DataFrame
        df = pd.DataFrame([sample_data])
        
        # Apply feature engineering if needed
        if len(self.feature_names) > 7:  # More than base features
            feature_engineer = FeatureEngineer()
            df = feature_engineer.apply_all_features(df, include_categorical=False)
        
        # Ensure all features are present
        for feature in self.feature_names:
            if feature not in df.columns:
                df[feature] = 0
        
        # Select and order features
        df = df[self.feature_names]
        
        # Scale features
        X_scaled = self.scaler.transform(df)
        
        # Predict
        prediction = self.model.predict(X_scaled)[0]
        probabilities = self.model.predict_proba(X_scaled)[0]
        
        # Decode prediction
        crop_name = self.label_encoder.inverse_transform([prediction])[0]
        
        # Get top 3 predictions
        top_3_indices = np.argsort(probabilities)[::-1][:3]
        top_3_crops = self.label_encoder.inverse_transform(top_3_indices)
        top_3_probs = probabilities[top_3_indices]
        
        result = {
            'predicted_crop': crop_name,
            'confidence': float(probabilities[prediction]),
            'top_3_predictions': [
                {'crop': crop, 'probability': float(prob)}
                for crop, prob in zip(top_3_crops, top_3_probs)
            ]
        }
        
        logger.info(f"Prediction: {crop_name} (confidence: {result['confidence']:.2%})")
        return result


def evaluate_model(data_path: str = "Crop_recommendation.csv"):
    """
    Main evaluation function
    
    Args:
        data_path: Path to the dataset
    """
    logger.info("="*80)
    logger.info("MODEL EVALUATION PIPELINE")
    logger.info("="*80)
    
    # Initialize evaluator
    evaluator = ModelEvaluator(model_dir="models")
    
    # Load artifacts
    evaluator.load_artifacts()
    
    # Load and prepare data
    logger.info("\nLoading dataset...")
    preprocessor = DataPreprocessor()
    df = preprocessor.load_data(data_path)
    
    # Prepare features
    X = df.drop('label', axis=1)
    y = df['label']
    
    # Apply feature engineering if needed
    if len(evaluator.feature_names) > 7:
        logger.info("Applying feature engineering...")
        feature_engineer = FeatureEngineer()
        X = feature_engineer.apply_all_features(X, include_categorical=False)
    
    # Encode labels
    y_encoded = evaluator.label_encoder.transform(y)
    
    # Scale features
    X_scaled = evaluator.scaler.transform(X[evaluator.feature_names])
    
    # Evaluate
    logger.info("\nEvaluating model...")
    results = evaluator.evaluate_on_test_data(X_scaled, y_encoded)
    
    # Generate visualizations
    logger.info("\nGenerating visualizations...")
    evaluator.plot_confusion_matrix(results['confusion_matrix'])
    evaluator.plot_feature_importance()
    evaluator.plot_class_distribution(y_encoded, results['predictions'])
    
    # Generate report
    logger.info("\nGenerating evaluation report...")
    report = evaluator.generate_evaluation_report(results)
    
    # Test single prediction
    logger.info("\nTesting single prediction...")
    sample = {
        'N': 90,
        'P': 42,
        'K': 43,
        'temperature': 20.87,
        'humidity': 82.00,
        'ph': 6.50,
        'rainfall': 202.93
    }
    prediction_result = evaluator.test_single_prediction(sample)
    
    logger.info("\n" + "="*80)
    logger.info("EVALUATION COMPLETED")
    logger.info("="*80)
    logger.info(f"Overall Accuracy: {results['metrics']['accuracy']:.4f}")
    logger.info(f"F1 Score (weighted): {results['metrics']['f1_weighted']:.4f}")
    logger.info("="*80)
    
    return results


if __name__ == "__main__":
    evaluate_model()
