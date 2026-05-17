"""
Model Utilities Module
Helper functions for model training, evaluation, and persistence
"""

import joblib
import json
import os
from pathlib import Path
import numpy as np
import pandas as pd
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelManager:
    """Manages model saving, loading, and versioning"""
    
    def __init__(self, model_dir: str = "models"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
    def save_model(self, model, filename: str, metadata: dict = None):
        """
        Save model to disk with optional metadata
        
        Args:
            model: Trained model object
            filename: Name of the file to save
            metadata: Optional metadata dictionary
        """
        filepath = self.model_dir / filename
        
        try:
            joblib.dump(model, filepath)
            logger.info(f"Model saved successfully to {filepath}")
            
            # Save metadata if provided
            if metadata:
                metadata_path = filepath.with_suffix('.json')
                metadata['saved_at'] = datetime.now().isoformat()
                metadata['filename'] = filename
                
                with open(metadata_path, 'w') as f:
                    json.dump(metadata, f, indent=4)
                logger.info(f"Metadata saved to {metadata_path}")
                
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
            raise
    
    def load_model(self, filename: str):
        """
        Load model from disk
        
        Args:
            filename: Name of the model file
        """
        filepath = self.model_dir / filename
        
        try:
            model = joblib.load(filepath)
            logger.info(f"Model loaded successfully from {filepath}")
            return model
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def load_metadata(self, filename: str) -> dict:
        """Load model metadata"""
        metadata_path = (self.model_dir / filename).with_suffix('.json')
        
        try:
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            return metadata
        except FileNotFoundError:
            logger.warning(f"Metadata file not found: {metadata_path}")
            return {}
    
    def list_models(self) -> list:
        """List all saved models"""
        models = list(self.model_dir.glob("*.pkl"))
        return [m.name for m in models]
    
    def get_model_info(self, filename: str) -> dict:
        """Get comprehensive model information"""
        filepath = self.model_dir / filename
        
        if not filepath.exists():
            return {"error": "Model not found"}
        
        info = {
            "filename": filename,
            "size_mb": filepath.stat().st_size / (1024 * 1024),
            "modified": datetime.fromtimestamp(filepath.stat().st_mtime).isoformat(),
            "metadata": self.load_metadata(filename)
        }
        
        return info


class MetricsCalculator:
    """Calculate and format model evaluation metrics"""
    
    @staticmethod
    def calculate_classification_metrics(y_true, y_pred, labels=None) -> dict:
        """
        Calculate comprehensive classification metrics
        
        Args:
            y_true: True labels
            y_pred: Predicted labels
            labels: List of label names
        """
        from sklearn.metrics import (
            accuracy_score, precision_score, recall_score, 
            f1_score, confusion_matrix, classification_report
        )
        
        metrics = {
            'accuracy': float(accuracy_score(y_true, y_pred)),
            'precision_macro': float(precision_score(y_true, y_pred, average='macro', zero_division=0)),
            'precision_weighted': float(precision_score(y_true, y_pred, average='weighted', zero_division=0)),
            'recall_macro': float(recall_score(y_true, y_pred, average='macro', zero_division=0)),
            'recall_weighted': float(recall_score(y_true, y_pred, average='weighted', zero_division=0)),
            'f1_macro': float(f1_score(y_true, y_pred, average='macro', zero_division=0)),
            'f1_weighted': float(f1_score(y_true, y_pred, average='weighted', zero_division=0)),
            'confusion_matrix': confusion_matrix(y_true, y_pred).tolist(),
        }
        
        # Add classification report
        if labels is not None:
            report = classification_report(y_true, y_pred, target_names=labels, output_dict=True, zero_division=0)
            metrics['classification_report'] = report
        
        return metrics
    
    @staticmethod
    def calculate_cross_validation_metrics(cv_scores: dict) -> dict:
        """
        Calculate statistics from cross-validation scores
        
        Args:
            cv_scores: Dictionary of cross-validation scores
        """
        metrics = {}
        
        for metric_name, scores in cv_scores.items():
            metrics[metric_name] = {
                'mean': float(np.mean(scores)),
                'std': float(np.std(scores)),
                'min': float(np.min(scores)),
                'max': float(np.max(scores)),
                'scores': [float(s) for s in scores]
            }
        
        return metrics
    
    @staticmethod
    def format_confusion_matrix(cm: np.ndarray, labels: list) -> pd.DataFrame:
        """
        Format confusion matrix as a pandas DataFrame
        
        Args:
            cm: Confusion matrix array
            labels: List of class labels
        """
        df_cm = pd.DataFrame(
            cm,
            index=[f'True_{label}' for label in labels],
            columns=[f'Pred_{label}' for label in labels]
        )
        return df_cm
    
    @staticmethod
    def calculate_per_class_accuracy(y_true, y_pred, labels) -> dict:
        """Calculate accuracy for each class"""
        per_class_acc = {}
        
        for label in np.unique(labels):
            mask = y_true == label
            if mask.sum() > 0:
                acc = accuracy_score(y_true[mask], y_pred[mask])
                per_class_acc[str(label)] = float(acc)
        
        return per_class_acc


class FeatureImportanceAnalyzer:
    """Analyze and visualize feature importance"""
    
    @staticmethod
    def get_feature_importance(model, feature_names: list) -> dict:
        """
        Extract feature importance from model
        
        Args:
            model: Trained model with feature_importances_ attribute
            feature_names: List of feature names
        """
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            
            # Create dictionary of feature importance
            importance_dict = {
                name: float(importance) 
                for name, importance in zip(feature_names, importances)
            }
            
            # Sort by importance
            importance_dict = dict(
                sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)
            )
            
            return importance_dict
        else:
            logger.warning("Model does not have feature_importances_ attribute")
            return {}
    
    @staticmethod
    def get_top_features(importance_dict: dict, top_n: int = 10) -> dict:
        """Get top N most important features"""
        return dict(list(importance_dict.items())[:top_n])
    
    @staticmethod
    def format_importance_dataframe(importance_dict: dict) -> pd.DataFrame:
        """Format feature importance as DataFrame"""
        df = pd.DataFrame([
            {'feature': k, 'importance': v} 
            for k, v in importance_dict.items()
        ])
        df = df.sort_values('importance', ascending=False).reset_index(drop=True)
        return df


class DataSplitter:
    """Handle train-test splitting with various strategies"""
    
    @staticmethod
    def train_test_split(X, y, test_size=0.2, random_state=42, stratify=True):
        """
        Split data into train and test sets
        
        Args:
            X: Features
            y: Target
            test_size: Proportion of test set
            random_state: Random seed
            stratify: Whether to stratify split
        """
        from sklearn.model_selection import train_test_split
        
        stratify_param = y if stratify else None
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, 
            test_size=test_size, 
            random_state=random_state,
            stratify=stratify_param
        )
        
        logger.info(f"Data split - Train: {X_train.shape}, Test: {X_test.shape}")
        
        return X_train, X_test, y_train, y_test
    
    @staticmethod
    def get_split_info(X_train, X_test, y_train, y_test) -> dict:
        """Get information about data split"""
        info = {
            'train_samples': len(X_train),
            'test_samples': len(X_test),
            'train_percentage': len(X_train) / (len(X_train) + len(X_test)) * 100,
            'test_percentage': len(X_test) / (len(X_train) + len(X_test)) * 100,
            'n_features': X_train.shape[1] if len(X_train.shape) > 1 else 1,
            'train_class_distribution': pd.Series(y_train).value_counts().to_dict(),
            'test_class_distribution': pd.Series(y_test).value_counts().to_dict()
        }
        
        return info


def create_training_report(
    model_name: str,
    metrics: dict,
    feature_importance: dict,
    training_time: float,
    hyperparameters: dict = None
) -> dict:
    """
    Create comprehensive training report
    
    Args:
        model_name: Name of the model
        metrics: Dictionary of evaluation metrics
        feature_importance: Dictionary of feature importance scores
        training_time: Time taken to train (seconds)
        hyperparameters: Model hyperparameters
    """
    report = {
        'model_name': model_name,
        'training_timestamp': datetime.now().isoformat(),
        'training_time_seconds': training_time,
        'metrics': metrics,
        'top_10_features': dict(list(feature_importance.items())[:10]),
        'hyperparameters': hyperparameters or {}
    }
    
    return report
