"""
Feature Engineering Module
Creates new features and transforms existing ones for better model performance
"""

import pandas as pd
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FeatureEngineer:
    """Handles feature engineering operations"""
    
    def __init__(self):
        self.feature_names = []
    
    def create_npk_ratio_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create NPK ratio features
        These ratios are important for crop recommendations
        """
        df_new = df.copy()
        
        # NPK ratios
        df_new['N_P_ratio'] = df_new['N'] / (df_new['P'] + 1)  # +1 to avoid division by zero
        df_new['N_K_ratio'] = df_new['N'] / (df_new['K'] + 1)
        df_new['P_K_ratio'] = df_new['P'] / (df_new['K'] + 1)
        
        # Total NPK
        df_new['total_NPK'] = df_new['N'] + df_new['P'] + df_new['K']
        
        # NPK balance score
        df_new['NPK_balance'] = np.sqrt(
            (df_new['N'] - df_new['P'])**2 + 
            (df_new['P'] - df_new['K'])**2 + 
            (df_new['N'] - df_new['K'])**2
        )
        
        logger.info("Created NPK ratio features")
        return df_new
    
    def create_environmental_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create environmental interaction features
        """
        df_new = df.copy()
        
        # Temperature-Humidity interaction
        df_new['temp_humidity_interaction'] = df_new['temperature'] * df_new['humidity']
        
        # Rainfall-Humidity interaction
        df_new['rainfall_humidity_interaction'] = df_new['rainfall'] * df_new['humidity']
        
        # Temperature categories
        df_new['temp_category'] = pd.cut(
            df_new['temperature'], 
            bins=[0, 15, 25, 35, 50], 
            labels=['cold', 'moderate', 'warm', 'hot']
        )
        
        # Humidity categories
        df_new['humidity_category'] = pd.cut(
            df_new['humidity'], 
            bins=[0, 40, 60, 80, 100], 
            labels=['low', 'moderate', 'high', 'very_high']
        )
        
        # Rainfall categories
        df_new['rainfall_category'] = pd.cut(
            df_new['rainfall'], 
            bins=[0, 100, 200, 300, 400], 
            labels=['low', 'moderate', 'high', 'very_high']
        )
        
        logger.info("Created environmental features")
        return df_new
    
    def create_ph_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create pH-related features
        """
        df_new = df.copy()
        
        # pH categories (acidic, neutral, alkaline)
        df_new['ph_category'] = pd.cut(
            df_new['ph'], 
            bins=[0, 6.5, 7.5, 14], 
            labels=['acidic', 'neutral', 'alkaline']
        )
        
        # Distance from neutral pH
        df_new['ph_deviation'] = np.abs(df_new['ph'] - 7.0)
        
        # pH-Nutrient interactions (pH affects nutrient availability)
        df_new['ph_N_interaction'] = df_new['ph'] * df_new['N']
        df_new['ph_P_interaction'] = df_new['ph'] * df_new['P']
        df_new['ph_K_interaction'] = df_new['ph'] * df_new['K']
        
        logger.info("Created pH features")
        return df_new
    
    def create_polynomial_features(self, df: pd.DataFrame, columns: list, degree: int = 2) -> pd.DataFrame:
        """
        Create polynomial features for specified columns
        """
        df_new = df.copy()
        
        for col in columns:
            if col in df_new.columns:
                for d in range(2, degree + 1):
                    df_new[f'{col}_power_{d}'] = df_new[col] ** d
        
        logger.info(f"Created polynomial features of degree {degree}")
        return df_new
    
    def create_nutrient_sufficiency_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create features indicating nutrient sufficiency levels
        """
        df_new = df.copy()
        
        # Nutrient sufficiency scores (normalized to 0-1)
        # Based on typical crop requirements
        df_new['N_sufficiency'] = np.clip(df_new['N'] / 140, 0, 1)  # 140 is high N
        df_new['P_sufficiency'] = np.clip(df_new['P'] / 145, 0, 1)  # 145 is high P
        df_new['K_sufficiency'] = np.clip(df_new['K'] / 205, 0, 1)  # 205 is high K
        
        # Overall nutrient sufficiency
        df_new['overall_nutrient_sufficiency'] = (
            df_new['N_sufficiency'] + 
            df_new['P_sufficiency'] + 
            df_new['K_sufficiency']
        ) / 3
        
        logger.info("Created nutrient sufficiency features")
        return df_new
    
    def create_growing_condition_score(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create a composite growing condition score
        """
        df_new = df.copy()
        
        # Normalize features to 0-1 scale
        temp_norm = (df_new['temperature'] - df_new['temperature'].min()) / (
            df_new['temperature'].max() - df_new['temperature'].min()
        )
        humidity_norm = df_new['humidity'] / 100
        rainfall_norm = (df_new['rainfall'] - df_new['rainfall'].min()) / (
            df_new['rainfall'].max() - df_new['rainfall'].min()
        )
        
        # Composite score
        df_new['growing_condition_score'] = (
            temp_norm * 0.3 + 
            humidity_norm * 0.3 + 
            rainfall_norm * 0.4
        )
        
        logger.info("Created growing condition score")
        return df_new
    
    def apply_all_features(self, df: pd.DataFrame, include_categorical: bool = False) -> pd.DataFrame:
        """
        Apply all feature engineering transformations
        
        Args:
            df: Input dataframe
            include_categorical: Whether to include categorical features
        """
        logger.info("Starting comprehensive feature engineering...")
        
        df_engineered = df.copy()
        
        # Apply all feature engineering methods
        df_engineered = self.create_npk_ratio_features(df_engineered)
        df_engineered = self.create_environmental_features(df_engineered)
        df_engineered = self.create_ph_features(df_engineered)
        df_engineered = self.create_nutrient_sufficiency_features(df_engineered)
        df_engineered = self.create_growing_condition_score(df_engineered)
        
        # Remove categorical columns if not needed
        if not include_categorical:
            categorical_cols = df_engineered.select_dtypes(include=['object', 'category']).columns
            df_engineered = df_engineered.drop(columns=categorical_cols)
            logger.info(f"Removed {len(categorical_cols)} categorical columns")
        
        # Store feature names
        self.feature_names = df_engineered.columns.tolist()
        
        logger.info(f"Feature engineering completed. Total features: {len(self.feature_names)}")
        return df_engineered
    
    def get_feature_importance_names(self) -> list:
        """Return list of engineered feature names"""
        return self.feature_names
    
    def select_top_features(self, df: pd.DataFrame, feature_importance: dict, top_n: int = 20) -> pd.DataFrame:
        """
        Select top N features based on importance scores
        
        Args:
            df: Input dataframe
            feature_importance: Dictionary of feature names and their importance scores
            top_n: Number of top features to select
        """
        # Sort features by importance
        sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
        top_features = [feat[0] for feat in sorted_features[:top_n]]
        
        # Select only top features
        df_selected = df[top_features]
        
        logger.info(f"Selected top {top_n} features")
        return df_selected, top_features
