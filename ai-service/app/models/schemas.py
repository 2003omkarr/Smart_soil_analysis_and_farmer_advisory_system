from pydantic import BaseModel, Field
from typing import List, Optional

class SoilData(BaseModel):
    N: float = Field(..., description="Nitrogen content", ge=0)
    P: float = Field(..., description="Phosphorus content", ge=0)
    K: float = Field(..., description="Potassium content", ge=0)
    pH: float = Field(..., description="pH level", ge=0, le=14)
    rainfall: float = Field(..., description="Rainfall in mm", ge=0)
    temperature: float = Field(..., description="Temperature in Celsius")

class CropPredictionResponse(BaseModel):
    crop: str
    confidence: float
    reason: str
    alternatives: List[str]

class FertilizerRecommendation(BaseModel):
    name: str
    dosage: str
    timing: str

class SoilHealthResponse(BaseModel):
    score: int
    status: str
    fertilizers: List[FertilizerRecommendation]
    irrigation: str
    weatherAdvice: str
    tips: List[str]
