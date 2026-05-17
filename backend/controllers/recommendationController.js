import asyncHandler from 'express-async-handler'
import Recommendation from '../models/Recommendation.js'
import SoilReport from '../models/SoilReport.js'
import {
    getCompleteAnalysis,
    formatSoilDataForAI,
    validateSoilData
} from '../services/aiService.js'
import { getTranslation } from '../utils/translations.js'

export const getRecommendations = asyncHandler(async (req, res) => {
    const soilReport = await SoilReport.findById(req.params.reportId)

    if (!soilReport) {
        res.status(404)
        throw new Error('Soil report not found')
    }

    if (soilReport.user.toString() !== req.user._id.toString()) {
        res.status(401)
        throw new Error('Not authorized')
    }

    let recommendation = await Recommendation.findOne({ soilReport: req.params.reportId })

    if (!recommendation) {
        try {
            // Format soil data for AI service
            const soilData = formatSoilDataForAI(soilReport)

            // Validate soil data
            const validation = validateSoilData(soilData)
            if (!validation.isValid) {
                throw new Error(`Invalid soil data: ${validation.errors.join(', ')}`)
            }

            // Get user's language preference (default to 'en')
            const userLanguage = req.user.language || 'en'

            // Get complete AI analysis with language preference
            const aiAnalysis = await getCompleteAnalysis(soilData, null, 1.0, false, userLanguage)

            // Map the Python AI response correctly to the MongoDB Schema
            recommendation = await Recommendation.create({
                soilReport: soilReport._id,
                user: req.user._id,
                crop: aiAnalysis.cropRecommendation.crop,
                cropReason: aiAnalysis.cropRecommendation.explanation,
                soilHealthScore: aiAnalysis.soilHealth.score,
                soilHealthStatus: aiAnalysis.soilHealth.status,
                fertilizers: aiAnalysis.fertilizerRecommendation?.primary_fertilizers?.map(f => ({
                    name: f.fertilizer,
                    dosage: `${f.quantity_kg} kg/ha`,
                    timing: aiAnalysis.fertilizerRecommendation.application_schedule?.[0]?.timing || 'Follow general schedule'
                })) || [],
                tips: aiAnalysis.soilHealth.recommendations || [],
                irrigation: getTranslation('irrigation', userLanguage),
                weatherAdvice: getTranslation('weather', userLanguage),
                language: userLanguage
            })
        } catch (error) {
            console.error('Failed to generate recommendations:', error)
            res.status(500)
            throw new Error('Failed to generate recommendations: ' + error.message)
        }
    }

    res.json(recommendation)
})

export const getAllRecommendations = asyncHandler(async (req, res) => {
    const recommendations = await Recommendation.find({ user: req.user._id })
        .populate('soilReport')
        .sort({ createdAt: -1 })

    res.json(recommendations)
})
