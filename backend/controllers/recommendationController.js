import asyncHandler from 'express-async-handler'
import Recommendation from '../models/Recommendation.js'
import SoilReport from '../models/SoilReport.js'
import {
    getCompleteAnalysis,
    formatSoilDataForAI,
    validateSoilData
} from '../services/aiService.js'
import { getTranslation } from '../utils/translations.js'

const normalizeAlternatives = (alternatives = []) => {
    if (!Array.isArray(alternatives)) return []

    return alternatives
        .map((alternative) => {
            if (typeof alternative === 'string') return alternative
            if (!alternative || typeof alternative !== 'object') return ''
            return alternative.crop || alternative.name || alternative.label || ''
        })
        .filter(Boolean)
}

const buildRecommendationFromStoredAnalysis = (soilReport, userLanguage = 'en') => {
    const aiAnalysis = soilReport.aiAnalysis || {}
    const cropRecommendation = aiAnalysis.cropRecommendation || soilReport.recommendation || {}
    const fertilizerRecommendation = aiAnalysis.fertilizerRecommendation || soilReport.fertilizerRecommendation || {}
    const soilHealth = aiAnalysis.soilHealth || {}

    return {
        soilReport: soilReport._id,
        user: soilReport.user,
        crop: cropRecommendation.crop || soilReport.recommendedCrop,
        cropReason: cropRecommendation.explanation || soilReport.recommendation?.explanation || '',
        alternatives: normalizeAlternatives(cropRecommendation.alternatives || soilReport.recommendation?.alternatives || []),
        soilHealthScore: soilHealth.score || soilReport.soilHealthScore,
        soilHealthStatus: soilHealth.status || soilReport.soilHealthGrade,
        fertilizers: (fertilizerRecommendation.primary_fertilizers || []).map(f => ({
            name: f.fertilizer,
            dosage: `${f.quantity_kg} kg/ha`,
            timing: fertilizerRecommendation.application_schedule?.[0]?.timing || 'Follow general schedule'
        })),
        tips: soilHealth.recommendations || [],
        irrigation: getTranslation('irrigation', userLanguage),
        weatherAdvice: getTranslation('weather', userLanguage),
        language: userLanguage
    }
}

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
    // If a Recommendation exists but the SoilReport was updated more recently,
    // rebuild and update the Recommendation so the API returns the latest data.
    if (recommendation) {
        try {
            const soilUpdated = soilReport.updatedAt ? new Date(soilReport.updatedAt).getTime() : 0
            const recUpdated = recommendation.updatedAt ? new Date(recommendation.updatedAt).getTime() : 0
            if (soilUpdated > recUpdated) {
                const userLanguage = req.user.language || 'en'
                recommendation = await Recommendation.findOneAndUpdate(
                    { soilReport: soilReport._id },
                    buildRecommendationFromStoredAnalysis(soilReport, userLanguage),
                    {
                        new: true,
                        upsert: true,
                        runValidators: true,
                        setDefaultsOnInsert: true,
                    }
                )
            }
        } catch (err) {
            console.error('Failed to refresh recommendation from updated soil report:', err)
            // don't block returning existing recommendation if update fails
        }
    }

    if (!recommendation) {
        try {
            const userLanguage = req.user.language || 'en'

            if (soilReport.aiAnalysis || soilReport.recommendation || soilReport.fertilizerRecommendation) {
                recommendation = await Recommendation.findOneAndUpdate(
                    { soilReport: soilReport._id },
                    buildRecommendationFromStoredAnalysis(soilReport, userLanguage),
                    {
                        new: true,
                        upsert: true,
                        runValidators: true,
                        setDefaultsOnInsert: true
                    }
                )
            } else {
                // Format soil data for AI service only when nothing is stored on the report yet
                const soilData = formatSoilDataForAI(soilReport)

                // Validate soil data
                const validation = validateSoilData(soilData)
                if (!validation.isValid) {
                    throw new Error(`Invalid soil data: ${validation.errors.join(', ')}`)
                }

                // Get complete AI analysis with language preference
                const aiAnalysis = await getCompleteAnalysis(soilData, null, 1.0, false, userLanguage)

                // Map the Python AI response correctly to the MongoDB Schema
                recommendation = await Recommendation.create({
                    soilReport: soilReport._id,
                    user: req.user._id,
                    crop: aiAnalysis.cropRecommendation.crop,
                    cropReason: aiAnalysis.cropRecommendation.explanation,
                    alternatives: normalizeAlternatives(aiAnalysis.cropRecommendation.alternatives || []),
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
            }
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
