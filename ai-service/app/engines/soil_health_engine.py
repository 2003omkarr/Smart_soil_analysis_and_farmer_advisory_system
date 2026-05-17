"""
Soil Health Scoring Engine
Analyzes soil parameters and generates health scores with recommendations
"""

import numpy as np
from typing import Dict, List, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SoilHealthEngine:
    """
    Comprehensive soil health analysis engine
    Evaluates soil parameters and provides actionable insights
    """
    
    # Optimal ranges for soil parameters
    OPTIMAL_RANGES = {
        'N': (40, 80),      # Nitrogen (kg/ha)
        'P': (30, 60),      # Phosphorus (kg/ha)
        'K': (40, 80),      # Potassium (kg/ha)
        'ph': (6.0, 7.5),   # pH level
        'humidity': (60, 80),  # Humidity (%)
        'rainfall': (100, 250)  # Rainfall (mm)
    }
    
    # Critical thresholds
    CRITICAL_LOW = {
        'N': 20,
        'P': 15,
        'K': 20,
        'ph': 5.0,
        'humidity': 40,
        'rainfall': 50
    }
    
    CRITICAL_HIGH = {
        'N': 140,
        'P': 145,
        'K': 205,
        'ph': 8.5,
        'humidity': 95,
        'rainfall': 400
    }
    
    def __init__(self):
        self.weights = {
            'N': 0.20,
            'P': 0.20,
            'K': 0.20,
            'ph': 0.15,
            'humidity': 0.15,
            'rainfall': 0.10
        }
    
    def calculate_parameter_score(self, value: float, param_name: str) -> float:
        """
        Calculate score for individual parameter (0-100)
        
        Args:
            value: Parameter value
            param_name: Name of the parameter
            
        Returns:
            Score between 0 and 100
        """
        optimal_min, optimal_max = self.OPTIMAL_RANGES[param_name]
        critical_low = self.CRITICAL_LOW[param_name]
        critical_high = self.CRITICAL_HIGH[param_name]
        
        # Perfect score if within optimal range
        if optimal_min <= value <= optimal_max:
            return 100.0
        
        # Below optimal range
        elif value < optimal_min:
            if value <= critical_low:
                return 0.0
            # Linear interpolation between critical_low and optimal_min
            score = ((value - critical_low) / (optimal_min - critical_low)) * 100
            return max(0.0, min(100.0, score))
        
        # Above optimal range
        else:
            if value >= critical_high:
                return 0.0
            # Linear interpolation between optimal_max and critical_high
            score = ((critical_high - value) / (critical_high - optimal_max)) * 100
            return max(0.0, min(100.0, score))
    
    def calculate_overall_health_score(self, soil_data: Dict[str, float]) -> float:
        """
        Calculate overall soil health score (0-100)
        
        Args:
            soil_data: Dictionary with soil parameters
            
        Returns:
            Overall health score
        """
        total_score = 0.0
        
        for param, weight in self.weights.items():
            if param in soil_data:
                param_score = self.calculate_parameter_score(soil_data[param], param)
                total_score += param_score * weight
        
        return round(total_score, 2)
    
    def detect_nutrient_deficiencies(self, soil_data: Dict[str, float]) -> List[Dict]:
        """
        Detect nutrient deficiencies and excesses
        
        Args:
            soil_data: Dictionary with soil parameters
            
        Returns:
            List of deficiency/excess information
        """
        deficiencies = []
        
        for param in ['N', 'P', 'K']:
            if param not in soil_data:
                continue
                
            value = soil_data[param]
            optimal_min, optimal_max = self.OPTIMAL_RANGES[param]
            critical_low = self.CRITICAL_LOW[param]
            critical_high = self.CRITICAL_HIGH[param]
            
            if value < optimal_min:
                severity = 'critical' if value <= critical_low else 'moderate'
                deficit = optimal_min - value
                
                deficiencies.append({
                    'nutrient': param,
                    'type': 'deficiency',
                    'severity': severity,
                    'current_value': value,
                    'optimal_range': f"{optimal_min}-{optimal_max}",
                    'deficit': round(deficit, 2),
                    'recommendation': self._get_deficiency_recommendation(param, severity)
                })
            
            elif value > optimal_max:
                severity = 'critical' if value >= critical_high else 'moderate'
                excess = value - optimal_max
                
                deficiencies.append({
                    'nutrient': param,
                    'type': 'excess',
                    'severity': severity,
                    'current_value': value,
                    'optimal_range': f"{optimal_min}-{optimal_max}",
                    'excess': round(excess, 2),
                    'recommendation': self._get_excess_recommendation(param, severity)
                })
        
        return deficiencies
    
    def _get_deficiency_recommendation(self, nutrient: str, severity: str) -> str:
        """Get recommendation for nutrient deficiency"""
        recommendations = {
            'N': {
                'critical': 'Apply nitrogen-rich fertilizers immediately (urea, ammonium nitrate). Consider organic options like compost or manure.',
                'moderate': 'Apply balanced NPK fertilizer. Add organic matter to improve nitrogen retention.'
            },
            'P': {
                'critical': 'Apply phosphate fertilizers (DAP, SSP) immediately. Consider bone meal for organic option.',
                'moderate': 'Apply phosphorus-rich fertilizer. Add rock phosphate for long-term availability.'
            },
            'K': {
                'critical': 'Apply potassium fertilizers (MOP, SOP) immediately. Consider wood ash for organic option.',
                'moderate': 'Apply potassium-rich fertilizer. Add compost to improve potassium levels.'
            }
        }
        return recommendations.get(nutrient, {}).get(severity, 'Consult agricultural expert')
    
    def _get_excess_recommendation(self, nutrient: str, severity: str) -> str:
        """Get recommendation for nutrient excess"""
        recommendations = {
            'N': {
                'critical': 'Stop nitrogen fertilization. Plant nitrogen-fixing crops. Increase irrigation to leach excess.',
                'moderate': 'Reduce nitrogen fertilizer application. Monitor soil regularly.'
            },
            'P': {
                'critical': 'Stop phosphate fertilization. Plant phosphorus-accumulating crops. Improve drainage.',
                'moderate': 'Reduce phosphorus fertilizer application. Use balanced fertilizers.'
            },
            'K': {
                'critical': 'Stop potassium fertilization. Increase calcium and magnesium application to balance.',
                'moderate': 'Reduce potassium fertilizer application. Monitor soil balance.'
            }
        }
        return recommendations.get(nutrient, {}).get(severity, 'Consult agricultural expert')
    
    def analyze_ph_level(self, ph: float) -> Dict:
        """
        Analyze soil pH and provide recommendations
        
        Args:
            ph: Soil pH value
            
        Returns:
            pH analysis dictionary
        """
        if ph < 5.0:
            category = 'Strongly Acidic'
            status = 'critical'
            recommendation = 'Apply lime (calcium carbonate) to raise pH. Test soil after 3 months.'
        elif ph < 6.0:
            category = 'Moderately Acidic'
            status = 'moderate'
            recommendation = 'Apply lime in smaller quantities. Add organic matter to buffer pH.'
        elif ph <= 7.5:
            category = 'Optimal'
            status = 'good'
            recommendation = 'Maintain current pH levels. Monitor regularly.'
        elif ph <= 8.5:
            category = 'Moderately Alkaline'
            status = 'moderate'
            recommendation = 'Apply sulfur or organic matter to lower pH. Avoid alkaline fertilizers.'
        else:
            category = 'Strongly Alkaline'
            status = 'critical'
            recommendation = 'Apply elemental sulfur or acidifying fertilizers. Consider gypsum application.'
        
        return {
            'value': ph,
            'category': category,
            'status': status,
            'recommendation': recommendation,
            'nutrient_availability': self._get_nutrient_availability_by_ph(ph)
        }
    
    def _get_nutrient_availability_by_ph(self, ph: float) -> str:
        """Describe nutrient availability based on pH"""
        if 6.0 <= ph <= 7.5:
            return 'Optimal - All nutrients readily available'
        elif ph < 6.0:
            return 'Reduced - Nitrogen, phosphorus, potassium less available. Increased aluminum toxicity risk.'
        else:
            return 'Reduced - Iron, manganese, zinc less available. Phosphorus fixation may occur.'
    
    def classify_soil_fertility(self, health_score: float) -> Tuple[str, str]:
        """
        Classify soil fertility based on health score
        
        Args:
            health_score: Overall health score (0-100)
            
        Returns:
            Tuple of (status, description)
        """
        if health_score >= 80:
            return 'Excellent', 'Soil is in excellent condition. Maintain current practices.'
        elif health_score >= 65:
            return 'Healthy', 'Soil is healthy. Minor improvements recommended.'
        elif health_score >= 50:
            return 'Moderate', 'Soil needs attention. Follow recommendations to improve.'
        elif health_score >= 35:
            return 'Poor', 'Soil is in poor condition. Immediate action required.'
        else:
            return 'Critical', 'Soil is in critical condition. Urgent intervention needed.'
    
    def generate_soil_health_report(self, soil_data: Dict[str, float]) -> Dict:
        """
        Generate comprehensive soil health report
        
        Args:
            soil_data: Dictionary with soil parameters
                {
                    'N': float,
                    'P': float,
                    'K': float,
                    'ph': float,
                    'humidity': float,
                    'rainfall': float
                }
        
        Returns:
            Comprehensive soil health report
        """
        logger.info("Generating soil health report...")
        
        # Calculate overall health score
        health_score = self.calculate_overall_health_score(soil_data)
        
        # Classify fertility
        fertility_status, fertility_description = self.classify_soil_fertility(health_score)
        
        # Detect deficiencies
        deficiencies = self.detect_nutrient_deficiencies(soil_data)
        
        # Analyze pH
        ph_analysis = self.analyze_ph_level(soil_data.get('ph', 7.0))
        
        # Calculate individual parameter scores
        parameter_scores = {}
        for param in self.weights.keys():
            if param in soil_data:
                parameter_scores[param] = self.calculate_parameter_score(
                    soil_data[param], param
                )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            health_score, deficiencies, ph_analysis
        )
        
        report = {
            'overall_health_score': health_score,
            'fertility_status': fertility_status,
            'fertility_description': fertility_description,
            'parameter_scores': parameter_scores,
            'nutrient_analysis': {
                'deficiencies': deficiencies,
                'total_issues': len(deficiencies)
            },
            'ph_analysis': ph_analysis,
            'recommendations': recommendations,
            'soil_data': soil_data
        }
        
        logger.info(f"Soil health score: {health_score}/100 ({fertility_status})")
        return report
    
    def _generate_recommendations(
        self, 
        health_score: float, 
        deficiencies: List[Dict],
        ph_analysis: Dict
    ) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Priority recommendations based on deficiencies
        critical_deficiencies = [d for d in deficiencies if d['severity'] == 'critical']
        if critical_deficiencies:
            recommendations.append(
                f"URGENT: Address {len(critical_deficiencies)} critical nutrient issue(s) immediately."
            )
            for deficiency in critical_deficiencies:
                recommendations.append(deficiency['recommendation'])
        
        # pH recommendations
        if ph_analysis['status'] in ['critical', 'moderate']:
            recommendations.append(ph_analysis['recommendation'])
        
        # General recommendations based on health score
        if health_score < 50:
            recommendations.append(
                "Consider soil testing every 3 months to monitor improvements."
            )
            recommendations.append(
                "Add organic matter (compost, manure) to improve soil structure and fertility."
            )
        elif health_score < 80:
            recommendations.append(
                "Maintain regular soil testing (every 6 months)."
            )
            recommendations.append(
                "Continue balanced fertilization practices."
            )
        else:
            recommendations.append(
                "Excellent soil health! Maintain current practices."
            )
            recommendations.append(
                "Annual soil testing recommended to ensure continued health."
            )
        
        return recommendations


# Convenience function
def analyze_soil_health(soil_data: Dict[str, float]) -> Dict:
    """
    Convenience function to analyze soil health
    
    Args:
        soil_data: Dictionary with soil parameters
        
    Returns:
        Soil health report
    """
    engine = SoilHealthEngine()
    return engine.generate_soil_health_report(soil_data)
