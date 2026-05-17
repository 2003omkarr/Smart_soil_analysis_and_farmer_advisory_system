from fastapi import APIRouter, HTTPException
from app.models.schemas import SoilData, CropPredictionResponse
from app.services.crop_predictor import crop_predictor

router = APIRouter()

@router.post("/predict-crop", response_model=CropPredictionResponse)
async def predict_crop(soil_data: SoilData):
    try:
        data_dict = soil_data.model_dump()
        prediction = crop_predictor.predict(data_dict)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
