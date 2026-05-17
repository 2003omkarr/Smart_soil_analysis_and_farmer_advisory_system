"""
FastAPI AI Service Main Application
Complete ML-powered agricultural recommendation system
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import logging
import os
from pathlib import Path

from app.services.crop_predictor import crop_predictor
from app.services.soil_analyzer import soil_analyzer
from app.services.ocr_service import OCRService
from app.services.weather_service import WeatherService, get_weather_advisory
from app.services.translator import get_translation
from app.engines.fertilizer_engine import get_fertilizer_recommendation

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Agricultural AI Service",
    description="ML-powered crop recommendation and soil analysis system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ocr_service = OCRService()
weather_service = WeatherService()

# ========================================
# PYDANTIC MODELS
# ========================================

class SoilData(BaseModel):
    """Soil parameters model"""
    N: float = Field(..., ge=0, le=200, description="Nitrogen content (kg/ha)")
    P: float = Field(..., ge=0, le=200, description="Phosphorus content (kg/ha)")
    K: float = Field(..., ge=0, le=300, description="Potassium content (kg/ha)")
    temperature: float = Field(..., ge=0, le=50, description="Temperature (°C)")
    humidity: float = Field(..., ge=0, le=100, description="Humidity (%)")
    ph: float = Field(..., ge=0, le=14, description="pH level")
    rainfall: float = Field(..., ge=0, le=1000, description="Rainfall (mm)")

class CropPredictionRequest(BaseModel):
    """Crop prediction request model"""
    soil_data: SoilData
    include_alternatives: bool = True

class SoilHealthRequest(BaseModel):
    """Soil health analysis request model"""
    soil_data: SoilData
    crop: Optional[str] = None
    area_hectares: float = 1.0
    prefer_organic: bool = False
    language: str = "en"  # Language preference: en, hi, mr, es

class FertilizerRequest(BaseModel):
    """Fertilizer recommendation request model"""
    soil_data: SoilData
    crop: str
    area_hectares: float = 1.0
    prefer_organic: bool = False
    language: str = "en"  # Language preference: en, hi, mr, es

class WeatherAdvisoryRequest(BaseModel):
    """Weather advisory request model"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    language: str = "en"  # Language preference: en, hi, mr, es
    crop: Optional[str] = None

class StandardResponse(BaseModel):
    """Standard API response model"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    message: Optional[str] = None

# ========================================
# HEALTH CHECK
# ========================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Agricultural AI Service",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "crop_prediction": "/api/v1/predict-crop",
            "soil_health": "/api/v1/soil-health",
            "fertilizer": "/api/v1/fertilizer-recommendation",
            "weather": "/api/v1/weather-advisory",
            "ocr": "/api/v1/extract-soil-report"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": True
    }

# ========================================
# CROP PREDICTION API
# ========================================

@app.post("/api/v1/predict-crop", response_model=StandardResponse)
async def predict_crop(request: CropPredictionRequest):
    """
    Predict best crop for given soil conditions
    
    Returns:
        Crop recommendation with confidence scores
    """
    try:
        logger.info("Received crop prediction request")
        
        # Convert Pydantic model to dict
        soil_data = request.soil_data.dict()
        
        # Make prediction
        prediction = crop_predictor.predict(soil_data)
        
        response_data = {
            "cropRecommendation": prediction['recommended_crop'],
            "confidence": prediction['confidence'],
            "confidencePercentage": prediction['confidence_percentage'],
            "explanation": prediction['explanation'],
            "soilConditions": prediction['soil_conditions']
        }
        
        if request.include_alternatives:
            response_data["alternatives"] = prediction['top_5_predictions'][1:4]
        
        return StandardResponse(
            success=True,
            data=response_data,
            message="Crop prediction completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Error in crop prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# SOIL HEALTH ANALYSIS API
# ========================================

@app.post("/api/v1/soil-health", response_model=StandardResponse)
async def analyze_soil_health(request: SoilHealthRequest):
    """
    Analyze soil health and provide recommendations
    
    Returns:
        Comprehensive soil health report
    """
    try:
        logger.info("Received soil health analysis request")
        
        # Convert Pydantic model to dict
        soil_data = request.soil_data.dict()
        
        # Perform analysis
        analysis = soil_analyzer.analyze(
            soil_data,
            crop=request.crop,
            area_hectares=request.area_hectares,
            prefer_organic=request.prefer_organic
        )
        
        response_data = {
            "soilHealthScore": analysis['soil_health']['overall_health_score'],
            "fertilityStatus": analysis['soil_health']['fertility_status'],
            "fertilityDescription": analysis['soil_health']['fertility_description'],
            "parameterScores": analysis['soil_health']['parameter_scores'],
            "nutrientDeficiencies": analysis['soil_health']['nutrient_analysis']['deficiencies'],
            "phAnalysis": analysis['soil_health']['ph_analysis'],
            "recommendations": analysis['soil_health']['recommendations'],
            "summary": analysis['summary']
        }
        
        if analysis['fertilizer_recommendation']:
            response_data["fertilizerRecommendation"] = analysis['fertilizer_recommendation']
        
        return StandardResponse(
            success=True,
            data=response_data,
            message="Soil health analysis completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Error in soil health analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# FERTILIZER RECOMMENDATION API
# ========================================

@app.post("/api/v1/fertilizer-recommendation", response_model=StandardResponse)
async def recommend_fertilizer(request: FertilizerRequest):
    """
    Get fertilizer recommendations for specific crop
    
    Returns:
        Detailed fertilizer recommendation
    """
    try:
        logger.info(f"Received fertilizer recommendation request for {request.crop}")
        
        # Convert Pydantic model to dict
        soil_data = request.soil_data.dict()
        
        # Get recommendation
        recommendation = get_fertilizer_recommendation(
            soil_data,
            request.crop,
            request.area_hectares,
            request.prefer_organic
        )
        
        response_data = {
            "crop": recommendation['crop'],
            "areaHectares": recommendation['area_hectares'],
            "nutrientDeficit": recommendation['nutrient_deficit'],
            "cropRequirements": recommendation['crop_requirements'],
            "primaryFertilizers": recommendation['primary_fertilizers'],
            "applicationSchedule": recommendation['application_schedule'],
            "organicAlternatives": recommendation['organic_alternatives'],
            "explanation": recommendation['explanation'],
            "estimatedCostPerHectare": recommendation['estimated_cost_per_hectare'],
            "environmentalImpact": recommendation['environmental_impact']
        }
        
        return StandardResponse(
            success=True,
            data=response_data,
            message="Fertilizer recommendation generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error in fertilizer recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# WEATHER ADVISORY API
# ========================================

@app.post("/api/v1/weather-advisory", response_model=StandardResponse)
async def get_weather_advisory_endpoint(request: WeatherAdvisoryRequest):
    """
    Get weather-based agricultural advisory
    
    Returns:
        Weather advisory with farming recommendations
    """
    try:
        logger.info(f"Received weather advisory request for ({request.latitude}, {request.longitude})")
        
        # Get weather advisory
        advisory = await get_weather_advisory(
            request.latitude,
            request.longitude,
            request.crop
        )
        
        return StandardResponse(
            success=True,
            data=advisory,
            message="Weather advisory generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error in weather advisory: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# OCR SOIL REPORT EXTRACTION API
# ========================================

@app.post("/api/v1/extract-soil-report", response_model=StandardResponse)
async def extract_soil_report(file: UploadFile = File(...)):
    """
    Extract soil data from uploaded PDF or image report
    
    Returns:
        Extracted soil parameters
    """
    try:
        logger.info(f"Received soil report file: {file.filename}")
        
        # Save uploaded file temporarily
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        
        file_path = upload_dir / file.filename
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Extract soil data
        result = ocr_service.process_soil_report(str(file_path))
        
        # Clean up
        file_path.unlink()
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Extraction failed'))
        
        response_data = {
            "extractedData": result['soil_data'],
            "validation": result['validation'],
            "source": result['source']
        }
        
        if 'soil_data_with_defaults' in result:
            response_data["dataWithDefaults"] = result['soil_data_with_defaults']
        
        return StandardResponse(
            success=True,
            data=response_data,
            message="Soil report extracted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in soil report extraction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# COMBINED ANALYSIS API
# ========================================

@app.post("/api/v1/complete-analysis", response_model=StandardResponse)
async def complete_analysis(request: SoilHealthRequest):
    """
    Perform complete agricultural analysis
    Includes crop prediction, soil health, and fertilizer recommendations
    
    Returns:
        Comprehensive analysis report
    """
    try:
        logger.info(f"Received complete analysis request (language: {request.language})")
        
        # Convert Pydantic model to dict
        soil_data = request.soil_data.dict()
        
        # Crop prediction
        crop_prediction = crop_predictor.predict(soil_data)
        
        # Use predicted crop if not specified
        crop = request.crop or crop_prediction['recommended_crop']
        
        # Soil health analysis
        soil_analysis = soil_analyzer.analyze(
            soil_data,
            crop=crop,
            area_hectares=request.area_hectares,
            prefer_organic=request.prefer_organic
        )
        
        # Prepare response data with language support
        language = request.language.lower() if request.language else "en"
        
        response_data = {
            "cropRecommendation": {
                "crop": crop_prediction['recommended_crop'],
                "confidence": crop_prediction['confidence_percentage'],
                "explanation": crop_prediction['explanation'],
                "alternatives": crop_prediction['top_5_predictions'][1:4]
            },
            "soilHealth": {
                "score": soil_analysis['soil_health']['overall_health_score'],
                "status": soil_analysis['soil_health']['fertility_status'],
                "deficiencies": soil_analysis['soil_health']['nutrient_analysis']['deficiencies'],
                "recommendations": soil_analysis['soil_health']['recommendations']
            },
            "fertilizerRecommendation": soil_analysis['fertilizer_recommendation'],
            "summary": soil_analysis['summary'],
            "language": language  # Include language in response for reference
        }
        
        return StandardResponse(
            success=True,
            data=response_data,
            message="Complete analysis finished successfully"
        )
        
    except Exception as e:
        logger.error(f"Error in complete analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# MODEL INFO API
# ========================================

@app.get("/api/v1/model-info")
async def get_model_info():
    """Get information about loaded ML models"""
    try:
        model_info = crop_predictor.get_model_info()
        return StandardResponse(
            success=True,
            data=model_info,
            message="Model information retrieved successfully"
        )
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
