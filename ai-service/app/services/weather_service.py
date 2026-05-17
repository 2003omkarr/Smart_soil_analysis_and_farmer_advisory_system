"""
Weather Service Integration
Fetches weather data and provides agricultural advisories
"""

import os
import logging
from typing import Dict, Optional
from datetime import datetime, timedelta
import aiohttp
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class WeatherService:
    """
    Weather service for agricultural recommendations
    Integrates with OpenWeatherMap API
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('OPENWEATHER_API_KEY', '')
        self.base_url = "https://api.openweathermap.org/data/2.5"
        
    async def get_current_weather(self, lat: float, lon: float) -> Dict:
        """
        Get current weather data
        
        Args:
            lat: Latitude
            lon: Longitude
            
        Returns:
            Current weather data
        """
        if not self.api_key:
            logger.warning("OpenWeatherMap API key not configured")
            return self._get_mock_weather()
        
        url = f"{self.base_url}/weather"
        params = {
            'lat': lat,
            'lon': lon,
            'appid': self.api_key,
            'units': 'metric'
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_current_weather(data)
                    else:
                        logger.error(f"Weather API error: {response.status}")
                        return self._get_mock_weather()
        except Exception as e:
            logger.error(f"Error fetching weather: {str(e)}")
            return self._get_mock_weather()
    
    async def get_forecast(self, lat: float, lon: float, days: int = 5) -> Dict:
        """
        Get weather forecast
        
        Args:
            lat: Latitude
            lon: Longitude
            days: Number of days to forecast
            
        Returns:
            Weather forecast data
        """
        if not self.api_key:
            logger.warning("OpenWeatherMap API key not configured")
            return self._get_mock_forecast()
        
        url = f"{self.base_url}/forecast"
        params = {
            'lat': lat,
            'lon': lon,
            'appid': self.api_key,
            'units': 'metric',
            'cnt': days * 8  # 8 forecasts per day (3-hour intervals)
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_forecast(data)
                    else:
                        logger.error(f"Forecast API error: {response.status}")
                        return self._get_mock_forecast()
        except Exception as e:
            logger.error(f"Error fetching forecast: {str(e)}")
            return self._get_mock_forecast()
    
    def _parse_current_weather(self, data: Dict) -> Dict:
        """Parse current weather API response"""
        return {
            'temperature': data['main']['temp'],
            'feels_like': data['main']['feels_like'],
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'wind_speed': data['wind']['speed'],
            'description': data['weather'][0]['description'],
            'clouds': data['clouds']['all'],
            'rain_1h': data.get('rain', {}).get('1h', 0),
            'timestamp': datetime.fromtimestamp(data['dt']).isoformat()
        }
    
    def _parse_forecast(self, data: Dict) -> Dict:
        """Parse forecast API response"""
        forecasts = []
        
        for item in data['list']:
            forecasts.append({
                'timestamp': datetime.fromtimestamp(item['dt']).isoformat(),
                'temperature': item['main']['temp'],
                'humidity': item['main']['humidity'],
                'rain_probability': item.get('pop', 0) * 100,
                'rain_volume': item.get('rain', {}).get('3h', 0),
                'description': item['weather'][0]['description']
            })
        
        return {
            'forecasts': forecasts,
            'summary': self._generate_forecast_summary(forecasts)
        }
    
    def _generate_forecast_summary(self, forecasts: list) -> Dict:
        """Generate summary from forecast data"""
        total_rain = sum(f['rain_volume'] for f in forecasts)
        avg_temp = sum(f['temperature'] for f in forecasts) / len(forecasts)
        avg_humidity = sum(f['humidity'] for f in forecasts) / len(forecasts)
        max_rain_prob = max(f['rain_probability'] for f in forecasts)
        
        return {
            'total_expected_rain_mm': round(total_rain, 2),
            'average_temperature': round(avg_temp, 1),
            'average_humidity': round(avg_humidity, 1),
            'max_rain_probability': round(max_rain_prob, 1)
        }
    
    def _get_mock_weather(self) -> Dict:
        """Return mock weather data when API is unavailable"""
        return {
            'temperature': 25.0,
            'feels_like': 26.0,
            'humidity': 70,
            'pressure': 1013,
            'wind_speed': 3.5,
            'description': 'partly cloudy',
            'clouds': 40,
            'rain_1h': 0,
            'timestamp': datetime.now().isoformat(),
            'mock_data': True
        }
    
    def _get_mock_forecast(self) -> Dict:
        """Return mock forecast data when API is unavailable"""
        forecasts = []
        for i in range(40):  # 5 days * 8 forecasts per day
            forecasts.append({
                'timestamp': (datetime.now() + timedelta(hours=i*3)).isoformat(),
                'temperature': 25.0 + (i % 8 - 4) * 2,
                'humidity': 70,
                'rain_probability': 30,
                'rain_volume': 0.5 if i % 8 == 4 else 0,
                'description': 'partly cloudy'
            })
        
        return {
            'forecasts': forecasts,
            'summary': {
                'total_expected_rain_mm': 2.5,
                'average_temperature': 25.0,
                'average_humidity': 70.0,
                'max_rain_probability': 30.0
            },
            'mock_data': True
        }
    
    def generate_agricultural_advisory(
        self,
        current_weather: Dict,
        forecast: Dict,
        crop: Optional[str] = None
    ) -> Dict:
        """
        Generate agricultural advisory based on weather
        
        Args:
            current_weather: Current weather data
            forecast: Forecast data
            crop: Optional crop name for specific advice
            
        Returns:
            Agricultural advisory
        """
        logger.info("Generating agricultural advisory...")
        
        advisories = []
        irrigation_advice = self._get_irrigation_advice(current_weather, forecast)
        fertilizer_timing = self._get_fertilizer_timing_advice(forecast)
        pest_disease_risk = self._assess_pest_disease_risk(current_weather, forecast)
        planting_conditions = self._assess_planting_conditions(current_weather, forecast)
        
        # Compile advisory
        advisory = {
            'timestamp': datetime.now().isoformat(),
            'current_conditions': {
                'temperature': current_weather['temperature'],
                'humidity': current_weather['humidity'],
                'description': current_weather['description']
            },
            'irrigation_advisory': irrigation_advice,
            'fertilizer_timing': fertilizer_timing,
            'pest_disease_risk': pest_disease_risk,
            'planting_conditions': planting_conditions,
            'general_recommendations': self._get_general_recommendations(
                current_weather, forecast, crop
            )
        }
        
        return advisory
    
    def _get_irrigation_advice(self, current: Dict, forecast: Dict) -> Dict:
        """Generate irrigation advice"""
        expected_rain = forecast['summary']['total_expected_rain_mm']
        current_humidity = current['humidity']
        
        if expected_rain > 20:
            recommendation = 'Postpone irrigation. Significant rainfall expected.'
            priority = 'low'
        elif expected_rain > 5:
            recommendation = 'Light irrigation if needed. Some rainfall expected.'
            priority = 'medium'
        elif current_humidity < 50:
            recommendation = 'Irrigate immediately. Low humidity and no rain expected.'
            priority = 'high'
        elif current_humidity < 70:
            recommendation = 'Plan irrigation within 24-48 hours.'
            priority = 'medium'
        else:
            recommendation = 'Monitor soil moisture. Irrigation may not be immediately needed.'
            priority = 'low'
        
        return {
            'recommendation': recommendation,
            'priority': priority,
            'expected_rainfall_mm': expected_rain,
            'current_humidity': current_humidity
        }
    
    def _get_fertilizer_timing_advice(self, forecast: Dict) -> Dict:
        """Generate fertilizer application timing advice"""
        expected_rain = forecast['summary']['total_expected_rain_mm']
        max_rain_prob = forecast['summary']['max_rain_probability']
        
        if max_rain_prob > 70:
            recommendation = 'Avoid fertilizer application. High chance of heavy rain may cause runoff.'
            timing = 'postpone'
        elif expected_rain > 10 and expected_rain < 30:
            recommendation = 'Good time for fertilizer application. Moderate rain will help incorporation.'
            timing = 'optimal'
        elif expected_rain < 5:
            recommendation = 'Apply fertilizer with irrigation. Insufficient rain expected.'
            timing = 'with_irrigation'
        else:
            recommendation = 'Monitor weather closely before application.'
            timing = 'monitor'
        
        return {
            'recommendation': recommendation,
            'timing': timing,
            'expected_rainfall_mm': expected_rain
        }
    
    def _assess_pest_disease_risk(self, current: Dict, forecast: Dict) -> Dict:
        """Assess pest and disease risk based on weather"""
        temp = current['temperature']
        humidity = current['humidity']
        rain = forecast['summary']['total_expected_rain_mm']
        
        risk_level = 'low'
        risks = []
        
        # High humidity + moderate temperature = fungal disease risk
        if humidity > 80 and 20 <= temp <= 30:
            risk_level = 'high'
            risks.append('Fungal diseases (leaf spot, blight)')
        
        # Warm + humid = bacterial disease risk
        if temp > 25 and humidity > 70:
            if risk_level != 'high':
                risk_level = 'medium'
            risks.append('Bacterial diseases')
        
        # Continuous rain = increased disease pressure
        if rain > 50:
            risk_level = 'high'
            risks.append('Waterlogging and root diseases')
        
        # Warm + dry = insect pest activity
        if temp > 28 and humidity < 60:
            if risk_level == 'low':
                risk_level = 'medium'
            risks.append('Increased insect pest activity')
        
        recommendations = []
        if risk_level == 'high':
            recommendations.append('Monitor crops closely for disease symptoms')
            recommendations.append('Consider preventive fungicide application')
            recommendations.append('Ensure good drainage')
        elif risk_level == 'medium':
            recommendations.append('Regular crop monitoring recommended')
            recommendations.append('Maintain field hygiene')
        else:
            recommendations.append('Continue routine monitoring')
        
        return {
            'risk_level': risk_level,
            'potential_risks': risks,
            'recommendations': recommendations
        }
    
    def _assess_planting_conditions(self, current: Dict, forecast: Dict) -> Dict:
        """Assess conditions for planting"""
        temp = current['temperature']
        humidity = current['humidity']
        rain = forecast['summary']['total_expected_rain_mm']
        
        if 20 <= temp <= 30 and 60 <= humidity <= 80 and 10 <= rain <= 50:
            suitability = 'excellent'
            recommendation = 'Excellent conditions for planting. Proceed with sowing.'
        elif 15 <= temp <= 35 and 50 <= humidity <= 90:
            suitability = 'good'
            recommendation = 'Good conditions for planting. Monitor weather.'
        elif temp < 15 or temp > 35:
            suitability = 'poor'
            recommendation = 'Temperature not optimal for planting. Wait for better conditions.'
        elif rain > 100:
            suitability = 'poor'
            recommendation = 'Excessive rain expected. Postpone planting to avoid waterlogging.'
        else:
            suitability = 'moderate'
            recommendation = 'Moderate conditions. Planting possible with proper care.'
        
        return {
            'suitability': suitability,
            'recommendation': recommendation,
            'temperature': temp,
            'humidity': humidity,
            'expected_rain': rain
        }
    
    def _get_general_recommendations(
        self,
        current: Dict,
        forecast: Dict,
        crop: Optional[str]
    ) -> list:
        """Generate general recommendations"""
        recommendations = []
        
        temp = current['temperature']
        humidity = current['humidity']
        rain = forecast['summary']['total_expected_rain_mm']
        
        # Temperature-based
        if temp > 35:
            recommendations.append('Provide shade or mulching to protect crops from heat stress')
        elif temp < 15:
            recommendations.append('Consider frost protection measures if temperature drops further')
        
        # Humidity-based
        if humidity > 85:
            recommendations.append('Ensure good air circulation to prevent fungal growth')
        elif humidity < 40:
            recommendations.append('Increase irrigation frequency due to low humidity')
        
        # Rain-based
        if rain > 100:
            recommendations.append('Ensure proper drainage systems are functional')
            recommendations.append('Avoid field operations during heavy rain')
        elif rain < 10:
            recommendations.append('Plan supplemental irrigation')
        
        # Crop-specific (if provided)
        if crop:
            recommendations.append(f'Monitor {crop} specific requirements based on growth stage')
        
        return recommendations


# Convenience functions
async def get_weather_advisory(
    lat: float,
    lon: float,
    crop: Optional[str] = None,
    api_key: Optional[str] = None
) -> Dict:
    """
    Get complete weather advisory
    
    Args:
        lat: Latitude
        lon: Longitude
        crop: Optional crop name
        api_key: Optional OpenWeatherMap API key
        
    Returns:
        Weather advisory
    """
    service = WeatherService(api_key=api_key)
    
    current = await service.get_current_weather(lat, lon)
    forecast = await service.get_forecast(lat, lon)
    advisory = service.generate_agricultural_advisory(current, forecast, crop)
    
    return advisory
