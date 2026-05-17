from fastapi import APIRouter, HTTPException
from app.models.schemas import SoilData, SoilHealthResponse
from app.services.soil_analyzer import soil_analyzer

router = APIRouter()

@router.post("/soil-health", response_model=SoilHealthResponse)
async def analyze_soil_health(soil_data: SoilData):
    try:
        data_dict = soil_data.model_dump()
        analysis = soil_analyzer.analyze(data_dict)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
