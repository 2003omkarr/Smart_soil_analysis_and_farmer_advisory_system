"""
Fertilizer Recommendation Engine
Provides intelligent fertilizer recommendations based on soil analysis and crop requirements
"""

from typing import Dict, List
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FertilizerEngine:
    """
    Intelligent fertilizer recommendation system
    Considers soil health, crop requirements, and environmental factors
    """
    
    # Crop-specific NPK requirements (N-P-K ratio)
    CROP_NPK_REQUIREMENTS = {
        'rice': {'N': 120, 'P': 60, 'K': 40, 'ratio': '3:1.5:1'},
        'wheat': {'N': 120, 'P': 60, 'K': 40, 'ratio': '3:1.5:1'},
        'maize': {'N': 150, 'P': 75, 'K': 50, 'ratio': '3:1.5:1'},
        'cotton': {'N': 120, 'P': 60, 'K': 60, 'ratio': '2:1:1'},
        'sugarcane': {'N': 200, 'P': 100, 'K': 100, 'ratio': '2:1:1'},
        'jute': {'N': 80, 'P': 40, 'K': 40, 'ratio': '2:1:1'},
        'coffee': {'N': 100, 'P': 50, 'K': 100, 'ratio': '1:0.5:1'},
        'coconut': {'N': 100, 'P': 40, 'K': 140, 'ratio': '1:0.4:1.4'},
        'papaya': {'N': 200, 'P': 200, 'K': 400, 'ratio': '1:1:2'},
        'orange': {'N': 120, 'P': 60, 'K': 120, 'ratio': '1:0.5:1'},
        'apple': {'N': 100, 'P': 50, 'K': 100, 'ratio': '2:1:2'},
        'muskmelon': {'N': 100, 'P': 50, 'K': 50, 'ratio': '2:1:1'},
        'watermelon': {'N': 100, 'P': 50, 'K': 50, 'ratio': '2:1:1'},
        'grapes': {'N': 80, 'P': 40, 'K': 120, 'ratio': '2:1:3'},
        'mango': {'N': 100, 'P': 50, 'K': 100, 'ratio': '1:0.5:1'},
        'banana': {'N': 200, 'P': 60, 'K': 300, 'ratio': '2:0.6:3'},
        'pomegranate': {'N': 100, 'P': 50, 'K': 100, 'ratio': '2:1:2'},
        'lentil': {'N': 20, 'P': 60, 'K': 20, 'ratio': '1:3:1'},
        'blackgram': {'N': 20, 'P': 60, 'K': 20, 'ratio': '1:3:1'},
        'mungbean': {'N': 20, 'P': 60, 'K': 20, 'ratio': '1:3:1'},
        'mothbeans': {'N': 20, 'P': 60, 'K': 20, 'ratio': '1:3:1'},
        'pigeonpeas': {'N': 20, 'P': 60, 'K': 20, 'ratio': '1:3:1'},
        'kidneybeans': {'N': 20, 'P': 60, 'K': 20, 'ratio': '1:3:1'},
        'chickpea': {'N': 20, 'P': 60, 'K': 20, 'ratio': '1:3:1'}
    }
    
    # Fertilizer database with NPK content
    FERTILIZER_DATABASE = {
        'Urea': {'N': 46, 'P': 0, 'K': 0, 'type': 'synthetic'},
        'DAP': {'N': 18, 'P': 46, 'K': 0, 'type': 'synthetic'},
        'MOP': {'N': 0, 'P': 0, 'K': 60, 'type': 'synthetic'},
        'NPK 19:19:19': {'N': 19, 'P': 19, 'K': 19, 'type': 'synthetic'},
        'NPK 20:20:20': {'N': 20, 'P': 20, 'K': 20, 'type': 'synthetic'},
        'NPK 12:32:16': {'N': 12, 'P': 32, 'K': 16, 'type': 'synthetic'},
        'Ammonium Sulfate': {'N': 21, 'P': 0, 'K': 0, 'type': 'synthetic'},
        'SSP': {'N': 0, 'P': 16, 'K': 0, 'type': 'synthetic'},
        'SOP': {'N': 0, 'P': 0, 'K': 50, 'type': 'synthetic'},
        'Compost': {'N': 1.5, 'P': 1, 'K': 1, 'type': 'organic'},
        'Farmyard Manure': {'N': 0.5, 'P': 0.3, 'K': 0.5, 'type': 'organic'},
        'Vermicompost': {'N': 2, 'P': 1.5, 'K': 1.5, 'type': 'organic'},
        'Bone Meal': {'N': 4, 'P': 21, 'K': 0, 'type': 'organic'},
        'Blood Meal': {'N': 12, 'P': 0, 'K': 0, 'type': 'organic'},
        'Wood Ash': {'N': 0, 'P': 2, 'K': 6, 'type': 'organic'},
        'Neem Cake': {'N': 5, 'P': 1, 'K': 1, 'type': 'organic'}
    }
    
    def __init__(self):
        pass
    
    def calculate_nutrient_deficit(
        self, 
        current_soil: Dict[str, float], 
        crop: str
    ) -> Dict[str, float]:
        """
        Calculate nutrient deficit for specific crop
        
        Args:
            current_soil: Current soil NPK levels
            crop: Crop name
            
        Returns:
            Dictionary with nutrient deficits
        """
        crop_lower = crop.lower()
        
        if crop_lower not in self.CROP_NPK_REQUIREMENTS:
            logger.warning(f"Crop '{crop}' not in database. Using default requirements.")
            requirements = {'N': 100, 'P': 50, 'K': 50}
        else:
            requirements = self.CROP_NPK_REQUIREMENTS[crop_lower]
        
        deficit = {}
        for nutrient in ['N', 'P', 'K']:
            current = current_soil.get(nutrient, 0)
            required = requirements[nutrient]
            deficit[nutrient] = max(0, required - current)
        
        return deficit
    
    def recommend_fertilizer(
        self,
        soil_data: Dict[str, float],
        crop: str,
        area_hectares: float = 1.0,
        prefer_organic: bool = False
    ) -> Dict:
        """
        Recommend fertilizer based on soil analysis and crop
        
        Args:
            soil_data: Current soil parameters
            crop: Crop to be grown
            area_hectares: Farm area in hectares
            prefer_organic: Prefer organic fertilizers
            
        Returns:
            Fertilizer recommendation dictionary
        """
        logger.info(f"Generating fertilizer recommendation for {crop}...")
        
        # Calculate nutrient deficit
        deficit = self.calculate_nutrient_deficit(soil_data, crop)
        
        # Get crop requirements
        crop_lower = crop.lower()
        crop_requirements = self.CROP_NPK_REQUIREMENTS.get(
            crop_lower,
            {'N': 100, 'P': 50, 'K': 50, 'ratio': '2:1:1'}
        )
        
        # Select appropriate fertilizers
        primary_fertilizers = self._select_fertilizers(deficit, prefer_organic)
        
        # Calculate quantities
        fertilizer_quantities = self._calculate_quantities(
            deficit, primary_fertilizers, area_hectares
        )
        
        # Determine application timing
        application_schedule = self._get_application_schedule(crop)
        
        # Get organic alternatives
        organic_alternatives = self._get_organic_alternatives(deficit)
        
        # Generate explanation
        explanation = self._generate_explanation(
            crop, deficit, soil_data, crop_requirements
        )
        
        recommendation = {
            'crop': crop,
            'area_hectares': area_hectares,
            'nutrient_deficit': deficit,
            'crop_requirements': crop_requirements,
            'primary_fertilizers': fertilizer_quantities,
            'application_schedule': application_schedule,
            'organic_alternatives': organic_alternatives,
            'explanation': explanation,
            'estimated_cost_per_hectare': self._estimate_cost(fertilizer_quantities),
            'environmental_impact': self._assess_environmental_impact(
                fertilizer_quantities, prefer_organic
            )
        }
        
        return recommendation
    
    def _select_fertilizers(
        self, 
        deficit: Dict[str, float], 
        prefer_organic: bool
    ) -> List[str]:
        """Select appropriate fertilizers based on deficit"""
        selected = []
        
        fertilizer_type = 'organic' if prefer_organic else 'synthetic'
        
        # Nitrogen fertilizer
        if deficit['N'] > 0:
            if prefer_organic:
                selected.append('Blood Meal' if deficit['N'] > 50 else 'Neem Cake')
            else:
                selected.append('Urea')
        
        # Phosphorus fertilizer
        if deficit['P'] > 0:
            if prefer_organic:
                selected.append('Bone Meal')
            else:
                selected.append('DAP')
        
        # Potassium fertilizer
        if deficit['K'] > 0:
            if prefer_organic:
                selected.append('Wood Ash')
            else:
                selected.append('MOP')
        
        # If all nutrients needed, consider balanced fertilizer
        if deficit['N'] > 0 and deficit['P'] > 0 and deficit['K'] > 0:
            if not prefer_organic:
                selected = ['NPK 19:19:19']
            else:
                selected.append('Vermicompost')
        
        return selected
    
    def _calculate_quantities(
        self,
        deficit: Dict[str, float],
        fertilizers: List[str],
        area_hectares: float
    ) -> List[Dict]:
        """Calculate fertilizer quantities needed"""
        quantities = []
        
        for fertilizer in fertilizers:
            if fertilizer not in self.FERTILIZER_DATABASE:
                continue
            
            fert_data = self.FERTILIZER_DATABASE[fertilizer]
            
            # Calculate quantity based on nutrient content
            # This is a simplified calculation
            quantity_kg = 0
            
            if fert_data['N'] > 0 and deficit['N'] > 0:
                quantity_kg = max(quantity_kg, (deficit['N'] / fert_data['N']) * 100)
            if fert_data['P'] > 0 and deficit['P'] > 0:
                quantity_kg = max(quantity_kg, (deficit['P'] / fert_data['P']) * 100)
            if fert_data['K'] > 0 and deficit['K'] > 0:
                quantity_kg = max(quantity_kg, (deficit['K'] / fert_data['K']) * 100)
            
            # Adjust for area
            quantity_kg *= area_hectares
            
            if quantity_kg > 0:
                quantities.append({
                    'fertilizer': fertilizer,
                    'quantity_kg': round(quantity_kg, 2),
                    'quantity_bags': round(quantity_kg / 50, 1),  # Assuming 50kg bags
                    'npk_content': fert_data,
                    'type': fert_data['type']
                })
        
        return quantities
    
    def _get_application_schedule(self, crop: str) -> List[Dict]:
        """Get fertilizer application schedule for crop"""
        crop_lower = crop.lower()
        
        # General schedule (can be customized per crop)
        if crop_lower in ['rice', 'wheat', 'maize']:
            return [
                {
                    'stage': 'Basal (At sowing)',
                    'timing': 'Day 0',
                    'nutrients': 'Full P, K and 50% N',
                    'method': 'Broadcast and incorporate into soil'
                },
                {
                    'stage': 'Top dressing 1',
                    'timing': '20-25 days after sowing',
                    'nutrients': '25% N',
                    'method': 'Side dressing near plant rows'
                },
                {
                    'stage': 'Top dressing 2',
                    'timing': '40-45 days after sowing',
                    'nutrients': '25% N',
                    'method': 'Side dressing near plant rows'
                }
            ]
        elif crop_lower in ['cotton', 'sugarcane']:
            return [
                {
                    'stage': 'Basal',
                    'timing': 'At planting',
                    'nutrients': 'Full P, K and 30% N',
                    'method': 'Apply in furrows'
                },
                {
                    'stage': 'First top dressing',
                    'timing': '30 days after planting',
                    'nutrients': '35% N',
                    'method': 'Side dressing'
                },
                {
                    'stage': 'Second top dressing',
                    'timing': '60 days after planting',
                    'nutrients': '35% N',
                    'method': 'Side dressing'
                }
            ]
        else:
            return [
                {
                    'stage': 'Basal application',
                    'timing': 'At sowing/planting',
                    'nutrients': 'Full P, K and 50% N',
                    'method': 'Mix with soil'
                },
                {
                    'stage': 'Top dressing',
                    'timing': '30 days after sowing',
                    'nutrients': '50% N',
                    'method': 'Apply around plants'
                }
            ]
    
    def _get_organic_alternatives(self, deficit: Dict[str, float]) -> List[Dict]:
        """Get organic fertilizer alternatives"""
        alternatives = []
        
        if deficit['N'] > 0:
            alternatives.append({
                'nutrient': 'Nitrogen',
                'options': [
                    'Compost (5-10 tons/hectare)',
                    'Farmyard manure (10-15 tons/hectare)',
                    'Green manure (grow and incorporate legumes)',
                    'Blood meal (100-200 kg/hectare)',
                    'Neem cake (200-300 kg/hectare)'
                ]
            })
        
        if deficit['P'] > 0:
            alternatives.append({
                'nutrient': 'Phosphorus',
                'options': [
                    'Bone meal (150-250 kg/hectare)',
                    'Rock phosphate (300-500 kg/hectare)',
                    'Compost (5-10 tons/hectare)'
                ]
            })
        
        if deficit['K'] > 0:
            alternatives.append({
                'nutrient': 'Potassium',
                'options': [
                    'Wood ash (200-300 kg/hectare)',
                    'Banana peel compost',
                    'Kelp meal (100-150 kg/hectare)',
                    'Greensand (500-1000 kg/hectare)'
                ]
            })
        
        return alternatives
    
    def _generate_explanation(
        self,
        crop: str,
        deficit: Dict[str, float],
        soil_data: Dict[str, float],
        crop_requirements: Dict
    ) -> str:
        """Generate human-readable explanation"""
        explanation_parts = []
        
        explanation_parts.append(
            f"For growing {crop}, your soil requires additional nutrients."
        )
        
        # Deficit explanation
        deficit_items = []
        for nutrient, amount in deficit.items():
            if amount > 0:
                deficit_items.append(f"{nutrient}: {amount:.1f} kg/ha")
        
        if deficit_items:
            explanation_parts.append(
                f"Nutrient deficit: {', '.join(deficit_items)}."
            )
        else:
            explanation_parts.append(
                "Your soil has adequate nutrients for this crop."
            )
        
        # Crop requirement explanation
        explanation_parts.append(
            f"{crop.capitalize()} requires NPK in ratio {crop_requirements.get('ratio', 'balanced')}."
        )
        
        # pH consideration
        ph = soil_data.get('ph', 7.0)
        if ph < 6.0:
            explanation_parts.append(
                "Note: Acidic soil may reduce nutrient availability. Consider lime application."
            )
        elif ph > 7.5:
            explanation_parts.append(
                "Note: Alkaline soil may reduce nutrient availability. Consider sulfur application."
            )
        
        return " ".join(explanation_parts)
    
    def _estimate_cost(self, fertilizer_quantities: List[Dict]) -> float:
        """Estimate fertilizer cost (simplified)"""
        # Approximate costs per kg (in USD)
        cost_per_kg = {
            'Urea': 0.30,
            'DAP': 0.40,
            'MOP': 0.35,
            'NPK 19:19:19': 0.45,
            'NPK 20:20:20': 0.45,
            'Compost': 0.10,
            'Farmyard Manure': 0.05,
            'Vermicompost': 0.15,
            'Bone Meal': 0.50,
            'Blood Meal': 0.60,
            'Wood Ash': 0.05,
            'Neem Cake': 0.40
        }
        
        total_cost = 0
        for item in fertilizer_quantities:
            fertilizer = item['fertilizer']
            quantity = item['quantity_kg']
            cost = cost_per_kg.get(fertilizer, 0.30) * quantity
            total_cost += cost
        
        return round(total_cost, 2)
    
    def _assess_environmental_impact(
        self,
        fertilizer_quantities: List[Dict],
        prefer_organic: bool
    ) -> Dict:
        """Assess environmental impact of fertilizer use"""
        if prefer_organic:
            impact_level = 'Low'
            description = 'Organic fertilizers have minimal environmental impact and improve soil health long-term.'
        else:
            total_synthetic = sum(
                item['quantity_kg'] 
                for item in fertilizer_quantities 
                if item['type'] == 'synthetic'
            )
            
            if total_synthetic < 200:
                impact_level = 'Low'
                description = 'Moderate synthetic fertilizer use with manageable environmental impact.'
            elif total_synthetic < 400:
                impact_level = 'Moderate'
                description = 'Significant synthetic fertilizer use. Consider split applications to reduce runoff.'
            else:
                impact_level = 'High'
                description = 'High synthetic fertilizer use. Implement best management practices to minimize environmental impact.'
        
        return {
            'impact_level': impact_level,
            'description': description,
            'recommendations': [
                'Apply fertilizers in split doses',
                'Avoid application before heavy rain',
                'Use precision application methods',
                'Consider soil testing before each season'
            ]
        }


# Convenience function
def get_fertilizer_recommendation(
    soil_data: Dict[str, float],
    crop: str,
    area_hectares: float = 1.0,
    prefer_organic: bool = False
) -> Dict:
    """
    Convenience function to get fertilizer recommendation
    
    Args:
        soil_data: Current soil parameters
        crop: Crop to be grown
        area_hectares: Farm area in hectares
        prefer_organic: Prefer organic fertilizers
        
    Returns:
        Fertilizer recommendation
    """
    engine = FertilizerEngine()
    return engine.recommend_fertilizer(soil_data, crop, area_hectares, prefer_organic)
