"""
Soil Analysis Service
Comprehensive soil health analysis and recommendations
"""

import logging
from typing import Dict

from app.engines.soil_health_engine import SoilHealthEngine
from app.engines.fertilizer_engine import FertilizerEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SoilAnalyzer:
    """
    Comprehensive soil analysis service
    Integrates soil health scoring and fertilizer recommendations
    """
    
    def __init__(self):
        self.health_engine = SoilHealthEngine()
        self.fertilizer_engine = FertilizerEngine()
    
    def analyze(
        self,
        soil_data: Dict[str, float],
        crop: str = None,
        area_hectares: float = 1.0,
        prefer_organic: bool = False
    ) -> Dict:
        """
        Perform comprehensive soil analysis
        
        Args:
            soil_data: Dictionary with soil parameters
            crop: Optional crop for fertilizer recommendations
            area_hectares: Farm area in hectares
            prefer_organic: Prefer organic fertilizers
            
        Returns:
            Complete soil analysis report
        """
        logger.info("Performing comprehensive soil analysis...")
        
        # Generate soil health report
        health_report = self.health_engine.generate_soil_health_report(soil_data)
        
        # Generate fertilizer recommendation if crop is specified
        fertilizer_recommendation = None
        if crop:
            fertilizer_recommendation = self.fertilizer_engine.recommend_fertilizer(
                soil_data,
                crop,
                area_hectares,
                prefer_organic
            )
        
        # Compile complete analysis
        analysis = {
            'soil_health': health_report,
            'fertilizer_recommendation': fertilizer_recommendation,
            'summary': self._generate_summary(health_report, fertilizer_recommendation)
        }
        
        logger.info(f"Analysis complete. Health score: {health_report['overall_health_score']}/100")
        return analysis
    
    def _generate_summary(
        self,
        health_report: Dict,
        fertilizer_recommendation: Dict = None
    ) -> Dict:
        """Generate executive summary"""
        summary = {
            'overall_status': health_report['fertility_status'],
            'health_score': health_report['overall_health_score'],
            'critical_issues': len([
                d for d in health_report['nutrient_analysis']['deficiencies']
                if d['severity'] == 'critical'
            ]),
            'key_recommendations': health_report['recommendations'][:3]
        }
        
        if fertilizer_recommendation:
            summary['fertilizer_needed'] = len(
                fertilizer_recommendation['primary_fertilizers']
            ) > 0
            summary['estimated_cost'] = fertilizer_recommendation['estimated_cost_per_hectare']
        
        return summary


# Create global instance
soil_analyzer = SoilAnalyzer()
