/**
 * AI Service Integration
 * Handles communication with FastAPI AI service
 */

import axios from 'axios';
import FormData from 'form-data';

// AI Service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create axios instance with default config
const aiClient = axios.create({
    baseURL: AI_SERVICE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Predict best crop for given soil conditions
 * @param {Object} soilData - Soil parameters
 * @returns {Promise<Object>} Crop prediction result
 */
const predictCrop = async (soilData) => {
    try {
        console.log('Requesting crop prediction from AI service...');

        const response = await aiClient.post('/api/v1/predict-crop', {
            soil_data: soilData,
            include_alternatives: true,
            language: language
        });

        if (response.data.success) {
            console.log(`Crop predicted: ${response.data.data.cropRecommendation}`);
            return response.data.data;
        } else {
            throw new Error(response.data.error || 'Prediction failed');
        }
    } catch (error) {
        console.error('Error in crop prediction:', error.message);
        throw handleAIServiceError(error);
    }
};

/**
 * Analyze soil health
 * @param {Object} soilData - Soil parameters
 * @param {string} crop - Optional crop name
 * @param {number} areaHectares - Farm area in hectares
 * @param {boolean} preferOrganic - Prefer organic fertilizers
 * @returns {Promise<Object>} Soil health analysis
 */
const analyzeSoilHealth = async (soilData, crop = null, areaHectares = 1.0, preferOrganic = false) => {
    try {
        console.log('Requesting soil health analysis from AI service...');

        const response = await aiClient.post('/api/v1/soil-health', {
            soil_data: soilData,
            crop,
            area_hectares: areaHectares,
            prefer_organic: preferOrganic,
            language: language || 'en'
        });

        if (response.data.success) {
            console.log(`Soil health score: ${response.data.data.soilHealthScore}/100`);
            return response.data.data;
        } else {
            throw new Error(response.data.error || 'Analysis failed');
        }
    } catch (error) {
        console.error('Error in soil health analysis:', error.message);
        throw handleAIServiceError(error);
    }
};

/**
 * Get fertilizer recommendation
 * @param {Object} soilData - Soil parameters
 * @param {string} crop - Crop name
 * @param {number} areaHectares - Farm area in hectares
 * @param {boolean} preferOrganic - Prefer organic fertilizers
 * @returns {Promise<Object>} Fertilizer recommendation
 */
const getFertilizerRecommendation = async (soilData, crop, areaHectares = 1.0, preferOrganic = false) => {
    try {
        console.log(`Requesting fertilizer recommendation for ${crop}...`);

        const response = await aiClient.post('/api/v1/fertilizer-recommendation', {
            soil_data: soilData,
            crop,
            area_hectares: areaHectares,
            prefer_organic: preferOrganic,
            language: language || 'en'
        });

        if (response.data.success) {
            console.log('Fertilizer recommendation generated');
            return response.data.data;
        } else {
            throw new Error(response.data.error || 'Recommendation failed');
        }
    } catch (error) {
        console.error('Error in fertilizer recommendation:', error.message);
        throw handleAIServiceError(error);
    }
};

/**
 * Get weather advisory
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {string} crop - Optional crop name
 * @returns {Promise<Object>} Weather advisory
 */
const getWeatherAdvisory = async (latitude, longitude, crop = null) => {
    try {
        console.log(`Requesting weather advisory for (${latitude}, ${longitude})...`);

        const response = await aiClient.post('/api/v1/weather-advisory', {
            latitude,
            longitude,
            crop,
            language: language || 'en'
        });

        if (response.data.success) {
            console.log('Weather advisory generated');
            return response.data.data;
        } else {
            throw new Error(response.data.error || 'Weather advisory failed');
        }
    } catch (error) {
        console.error('Error in weather advisory:', error.message);
        throw handleAIServiceError(error);
    }
}

/**
 * Extract soil data from uploaded report
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} Extracted soil data
 */
const extractSoilReport = async (fileBuffer, filename) => {
    try {
        console.log(`Extracting soil data from ${filename}...`);

        const formData = new FormData();
        formData.append('file', fileBuffer, filename);

        const response = await aiClient.post('/api/v1/extract-soil-report', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        if (response.data.success) {
            console.log('Soil data extracted successfully');
            // Map the response to match our expected format
            return {
                soilData: response.data.data.extractedData || response.data.data.dataWithDefaults,
                validation: response.data.data.validation,
                source: response.data.data.source
            };
        } else {
            throw new Error(response.data.error || 'Extraction failed');
        }
    } catch (error) {
        console.error('Error in soil report extraction:', error.message);
        throw handleAIServiceError(error);
    }
};

/**
 * Get complete agricultural analysis
 * @param {Object} soilData - Soil parameters
 * @param {string} crop - Optional crop name
 * @param {number} areaHectares - Farm area in hectares
 * @param {boolean} preferOrganic - Prefer organic fertilizers
 * @param {string} language - User's language preference (en, hi, mr, es)
 * @returns {Promise<Object>} Complete analysis
 */
const getCompleteAnalysis = async (soilData, crop = null, areaHectares = 1.0, preferOrganic = false, language = 'en') => {
    try {
        console.log('Requesting complete agricultural analysis...');

        const response = await aiClient.post('/api/v1/complete-analysis', {
            soil_data: soilData,
            crop,
            area_hectares: areaHectares,
            prefer_organic: preferOrganic,
            language: language
        });

        if (response.data.success) {
            console.log('Complete analysis finished');
            return response.data.data;
        } else {
            throw new Error(response.data.error || 'Analysis failed');
        }
    } catch (error) {
        console.error('Error in complete analysis:', error.message);
        throw handleAIServiceError(error);
    }
};

/**
 * Check AI service health
 * @returns {Promise<boolean>} Service health status
 */
const checkHealth = async () => {
    try {
        const response = await aiClient.get('/health', { timeout: 5000 });
        return response.data.status === 'healthy';
    } catch (error) {
        console.error('AI service health check failed:', error.message);
        return false;
    }
};

/**
 * Get model information
 * @returns {Promise<Object>} Model information
 */
const getModelInfo = async () => {
    try {
        const response = await aiClient.get('/api/v1/model-info');
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error('Failed to get model info');
        }
    } catch (error) {
        console.error('Error getting model info:', error.message);
        throw handleAIServiceError(error);
    }
};

/**
 * Handle AI service errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleAIServiceError = (error) => {
    if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.detail || error.response.data?.message || 'AI service error';

        if (status === 404) {
            return new Error('AI service endpoint not found');
        } else if (status === 500) {
            return new Error(`AI service internal error: ${message}`);
        } else if (status === 422) {
            return new Error(`Invalid request data: ${message}`);
        } else {
            return new Error(`AI service error (${status}): ${message}`);
        }
    } else if (error.request) {
        // Request made but no response
        return new Error('AI service is not responding. Please check if the service is running.');
    } else {
        // Error in request setup
        return new Error(`Request error: ${error.message}`);
    }
};

/**
 * Format soil data for AI service
 * @param {Object} soilReport - Soil report from database
 * @returns {Object} Formatted soil data
 */
const formatSoilDataForAI = (soilReport) => {
    return {
        N: parseFloat(soilReport.nitrogen) || 0,
        P: parseFloat(soilReport.phosphorus) || 0,
        K: parseFloat(soilReport.potassium) || 0,
        temperature: parseFloat(soilReport.temperature) || 25,
        humidity: parseFloat(soilReport.humidity) || 70,
        ph: parseFloat(soilReport.ph) || 7.0,
        rainfall: parseFloat(soilReport.rainfall) || 150
    };
};

/**
 * Validate soil data
 * @param {Object} soilData - Soil data to validate
 * @returns {Object} Validation result
 */
const validateSoilData = (soilData) => {
    const errors = [];

    const validations = {
        N: { min: 0, max: 200, name: 'Nitrogen' },
        P: { min: 0, max: 200, name: 'Phosphorus' },
        K: { min: 0, max: 300, name: 'Potassium' },
        temperature: { min: 0, max: 50, name: 'Temperature' },
        humidity: { min: 0, max: 100, name: 'Humidity' },
        ph: { min: 0, max: 14, name: 'pH' },
        rainfall: { min: 0, max: 1000, name: 'Rainfall' }
    };

    for (const [key, validation] of Object.entries(validations)) {
        const value = soilData[key];

        if (value === undefined || value === null) {
            errors.push(`${validation.name} is required`);
        } else if (value < validation.min || value > validation.max) {
            errors.push(`${validation.name} must be between ${validation.min} and ${validation.max}`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export {
    predictCrop,
    analyzeSoilHealth,
    getFertilizerRecommendation,
    getWeatherAdvisory,
    extractSoilReport,
    getCompleteAnalysis,
    checkHealth,
    getModelInfo,
    formatSoilDataForAI,
    validateSoilData
};
