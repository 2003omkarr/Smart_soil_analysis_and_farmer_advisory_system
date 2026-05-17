"""
Crop Prediction Service
Handles crop recommendation predictions using trained ML model
"""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path
import logging
from typing import Dict, List

from app.ml.preprocessing import DataPreprocessor
from app.ml.feature_engineering import FeatureEngineer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CropPredictor:
    """
    Crop prediction service using trained Random Forest model
    """
    
    def __init__(self, model_dir: str = "models"):
        self.model_dir = Path(model_dir)
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.feature_names = None
        self.preprocessor = DataPreprocessor()
        self.feature_engineer = FeatureEngineer()
        self.load_models()
    
    def load_models(self):
        """Load trained models and artifacts"""
        try:
            logger.info("Loading crop prediction models...")
            
            self.model = joblib.load(self.model_dir / 'crop_model.pkl')
            self.scaler = joblib.load(self.model_dir / 'scaler.pkl')
            self.label_encoder = joblib.load(self.model_dir / 'label_encoder.pkl')
            self.feature_names = joblib.load(self.model_dir / 'feature_names.pkl')
            
            logger.info(f"Models loaded successfully. Features: {len(self.feature_names)}")
            
        except FileNotFoundError as e:
            logger.error(f"Model files not found: {str(e)}")
            logger.error("Please run train_model.py first to generate model files")
            raise
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            raise
    
    def prepare_features(self, soil_data: Dict[str, float]) -> np.ndarray:
        """
        Prepare features for prediction
        
        Args:
            soil_data: Dictionary with soil parameters
            
        Returns:
            Scaled feature array
        """
        # Create DataFrame
        df = pd.DataFrame([soil_data])
        
        # Apply feature engineering if model uses engineered features
        if len(self.feature_names) > 7:  # More than base features
            df = self.feature_engineer.apply_all_features(df, include_categorical=False)
        
        # Ensure all required features are present
        for feature in self.feature_names:
            if feature not in df.columns:
                df[feature] = 0
        
        # Select and order features
        df = df[self.feature_names]
        
        # Scale features
        X_scaled = self.scaler.transform(df)
        
        return X_scaled
    
    def predict(self, soil_data: Dict[str, float]) -> Dict:
        """
        Predict best crop for given soil conditions
        
        Args:
            soil_data: Dictionary with soil parameters
                {
                    'N': float,
                    'P': float,
                    'K': float,
                    'temperature': float,
                    'humidity': float,
                    'ph': float,
                    'rainfall': float
                }
        
        Returns:
            Prediction result with confidence scores
        """
        logger.info("Making crop prediction...")
        
        try:
            # Prepare features
            X = self.prepare_features(soil_data)
            
            # Make prediction
            prediction = self.model.predict(X)[0]
            probabilities = self.model.predict_proba(X)[0]
            
            # Decode prediction
            crop_name = self.label_encoder.inverse_transform([prediction])[0]
            confidence = float(probabilities[prediction])
            
            # Get top 5 predictions
            top_5_indices = np.argsort(probabilities)[::-1][:5]
            top_5_crops = self.label_encoder.inverse_transform(top_5_indices)
            top_5_probs = probabilities[top_5_indices]
            
            top_predictions = [
                {
                    'crop': crop,
                    'confidence': float(prob),
                    'confidence_percentage': round(float(prob) * 100, 2)
                }
                for crop, prob in zip(top_5_crops, top_5_probs)
            ]
            
            result = {
                'recommended_crop': crop_name,
                'confidence': confidence,
                'confidence_percentage': round(confidence * 100, 2),
                'top_5_predictions': top_predictions,
                'soil_conditions': soil_data,
                'explanation': self._generate_explanation(crop_name, soil_data, confidence)
            }
            
            logger.info(f"Prediction: {crop_name} (confidence: {confidence:.2%})")
            return result
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            raise
    
    def predict_multiple(self, soil_data_list: List[Dict[str, float]]) -> List[Dict]:
        """
        Predict crops for multiple soil samples
        
        Args:
            soil_data_list: List of soil parameter dictionaries
            
        Returns:
            List of prediction results
        """
        logger.info(f"Making predictions for {len(soil_data_list)} samples...")
        
        results = []
        for i, soil_data in enumerate(soil_data_list):
            try:
                result = self.predict(soil_data)
                result['sample_id'] = i
                results.append(result)
            except Exception as e:
                logger.error(f"Error predicting sample {i}: {str(e)}")
                results.append({
                    'sample_id': i,
                    'error': str(e)
                })
        
        return results
    
    def _generate_explanation(
        self,
        crop: str,
        soil_data: Dict[str, float],
        confidence: float
    ) -> str:
        """Generate human-readable explanation"""
        explanation_parts = []
        
        # Confidence explanation
        if confidence > 0.8:
            explanation_parts.append(
                f"{crop.capitalize()} is highly recommended for your soil conditions."
            )
        elif confidence > 0.6:
            explanation_parts.append(
                f"{crop.capitalize()} is a good choice for your soil conditions."
            )
        else:
            explanation_parts.append(
                f"{crop.capitalize()} may be suitable, but consider alternatives."
            )
        
        # Soil condition analysis
        conditions = []
        
        # NPK analysis
        npk_sum = soil_data.get('N', 0) + soil_data.get('P', 0) + soil_data.get('K', 0)
        if npk_sum > 200:
            conditions.append("high nutrient content")
        elif npk_sum > 120:
            conditions.append("moderate nutrient content")
        else:
            conditions.append("low nutrient content")
        
        # pH analysis
        ph = soil_data.get('ph', 7.0)
        if 6.0 <= ph <= 7.5:
            conditions.append("optimal pH")
        elif ph < 6.0:
            conditions.append("acidic pH")
        else:
            conditions.append("alkaline pH")
        
        # Climate analysis
        temp = soil_data.get('temperature', 25)
        if temp > 30:
            conditions.append("warm climate")
        elif temp < 20:
            conditions.append("cool climate")
        else:
            conditions.append("moderate climate")
        
        explanation_parts.append(
            f"Your soil has {', '.join(conditions)}."
        )
        
        return " ".join(explanation_parts)
    
    def get_model_info(self) -> Dict:
        """Get information about loaded model"""
        return {
            'model_type': type(self.model).__name__,
            'n_features': len(self.feature_names),
            'n_classes': len(self.label_encoder.classes_),
            'classes': self.label_encoder.classes_.tolist(),
            'feature_names': self.feature_names
        }


# Convenience function
def predict_crop(soil_data: Dict[str, float]) -> Dict:
    """
    Convenience function to predict crop
    
    Args:
        soil_data: Dictionary with soil parameters
        
    Returns:
        Prediction result
    """
    predictor = CropPredictor()
    return predictor.predict(soil_data)


# Create global instance
crop_predictor = CropPredictor()
