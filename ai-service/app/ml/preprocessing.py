"""
Data Preprocessing Module
Handles data cleaning, missing values, duplicates, and basic transformations
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataPreprocessor:
    """Handles all data preprocessing operations"""
    
    def __init__(self):
        self.label_encoder = LabelEncoder()
        self.scaler = StandardScaler()
        
    def load_data(self, filepath: str) -> pd.DataFrame:
        """Load dataset from CSV file"""
        try:
            df = pd.read_csv(filepath)
            logger.info(f"Dataset loaded successfully. Shape: {df.shape}")
            return df
        except Exception as e:
            logger.error(f"Error loading dataset: {str(e)}")
            raise
    
    def check_missing_values(self, df: pd.DataFrame) -> dict:
        """Check for missing values in dataset"""
        missing = df.isnull().sum()
        missing_percent = (missing / len(df)) * 100
        missing_info = {
            'total_missing': missing.sum(),
            'missing_by_column': missing[missing > 0].to_dict(),
            'missing_percent': missing_percent[missing_percent > 0].to_dict()
        }
        logger.info(f"Missing values check: {missing_info['total_missing']} total missing")
        return missing_info
    
    def handle_missing_values(self, df: pd.DataFrame, strategy: str = 'mean') -> pd.DataFrame:
        """
        Handle missing values using specified strategy
        
        Args:
            df: Input dataframe
            strategy: 'mean', 'median', 'mode', or 'drop'
        """
        df_clean = df.copy()
        
        if strategy == 'drop':
            df_clean = df_clean.dropna()
            logger.info(f"Dropped rows with missing values. New shape: {df_clean.shape}")
        else:
            numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
            
            for col in numeric_cols:
                if df_clean[col].isnull().sum() > 0:
                    if strategy == 'mean':
                        df_clean[col].fillna(df_clean[col].mean(), inplace=True)
                    elif strategy == 'median':
                        df_clean[col].fillna(df_clean[col].median(), inplace=True)
                    elif strategy == 'mode':
                        df_clean[col].fillna(df_clean[col].mode()[0], inplace=True)
            
            logger.info(f"Missing values handled using {strategy} strategy")
        
        return df_clean
    
    def remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove duplicate rows from dataset"""
        initial_shape = df.shape
        df_clean = df.drop_duplicates()
        duplicates_removed = initial_shape[0] - df_clean.shape[0]
        
        logger.info(f"Removed {duplicates_removed} duplicate rows. New shape: {df_clean.shape}")
        return df_clean
    
    def detect_outliers(self, df: pd.DataFrame, columns: list = None) -> dict:
        """
        Detect outliers using IQR method
        
        Args:
            df: Input dataframe
            columns: List of columns to check (default: all numeric)
        """
        if columns is None:
            columns = df.select_dtypes(include=[np.number]).columns.tolist()
        
        outliers_info = {}
        
        for col in columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
            outliers_info[col] = {
                'count': len(outliers),
                'percentage': (len(outliers) / len(df)) * 100,
                'lower_bound': lower_bound,
                'upper_bound': upper_bound
            }
        
        logger.info(f"Outlier detection completed for {len(columns)} columns")
        return outliers_info
    
    def encode_labels(self, y: pd.Series, fit: bool = True) -> np.ndarray:
        """
        Encode categorical labels to numeric values
        
        Args:
            y: Target labels
            fit: Whether to fit the encoder (True for training, False for inference)
        """
        if fit:
            encoded = self.label_encoder.fit_transform(y)
            logger.info(f"Labels encoded. Classes: {self.label_encoder.classes_}")
        else:
            encoded = self.label_encoder.transform(y)
        
        return encoded
    
    def decode_labels(self, y_encoded: np.ndarray) -> np.ndarray:
        """Decode numeric labels back to original categories"""
        return self.label_encoder.inverse_transform(y_encoded)
    
    def scale_features(self, X: pd.DataFrame, fit: bool = True) -> np.ndarray:
        """
        Scale features using StandardScaler
        
        Args:
            X: Feature matrix
            fit: Whether to fit the scaler (True for training, False for inference)
        """
        if fit:
            scaled = self.scaler.fit_transform(X)
            logger.info(f"Features scaled. Shape: {scaled.shape}")
        else:
            scaled = self.scaler.transform(X)
        
        return scaled
    
    def get_data_summary(self, df: pd.DataFrame) -> dict:
        """Generate comprehensive data summary"""
        summary = {
            'shape': df.shape,
            'columns': df.columns.tolist(),
            'dtypes': df.dtypes.to_dict(),
            'missing_values': self.check_missing_values(df),
            'numeric_summary': df.describe().to_dict(),
            'categorical_columns': df.select_dtypes(include=['object']).columns.tolist(),
            'numeric_columns': df.select_dtypes(include=[np.number]).columns.tolist()
        }
        
        return summary
