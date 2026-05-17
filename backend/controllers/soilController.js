import asyncHandler from 'express-async-handler'
import SoilReport from '../models/SoilReport.js'
import {
    getCompleteAnalysis,
    formatSoilDataForAI,
    validateSoilData
} from '../services/aiService.js'
import { extractDataWithGemini } from '../services/geminiService.js'

export const uploadSoilReport = asyncHandler(async (req, res) => {
    // Check if file was uploaded
    if (!req.file) {
        res.status(400)
        throw new Error('Please upload a soil report file (PDF or Image)')
    }

    try {
        // Extract data from uploaded file using AI service OCR
        console.log('Extracting soil data from uploaded file...')
        const fs = await import('fs')
        const fileBuffer = fs.readFileSync(req.file.path)

        let extractedData = {}
        try {
            const geminiResult = await extractDataWithGemini(fileBuffer, req.file.mimetype)

            if (geminiResult) {
                // Map Gemini JSON result to our format
                extractedData = {
                    nitrogen: geminiResult.N !== null ? geminiResult.N : '',
                    phosphorus: geminiResult.P !== null ? geminiResult.P : '',
                    potassium: geminiResult.K !== null ? geminiResult.K : '',
                    ph: geminiResult.ph !== null ? geminiResult.ph : '',
                    temperature: geminiResult.temperature !== null ? geminiResult.temperature : '',
                    humidity: geminiResult.humidity !== null ? geminiResult.humidity : '',
                    rainfall: geminiResult.rainfall !== null ? geminiResult.rainfall : ''
                }
                console.log('Gemini extraction successful:', extractedData)
            }
        } catch (extractionError) {
            console.warn('AI extraction failed:', extractionError.message)
        }

        // Return extracted data for user to review
        res.status(200).json({
            success: true,
            extractedData,
            message: 'File processed. Please review the extracted data.'
        })
    } catch (error) {
        console.error('Upload and extraction failed:', error)
        res.status(500).json({
            success: false,
            message: 'Upload and extraction failed',
            error: error.message
        })
    }
})

export const getSoilReports = asyncHandler(async (req, res) => {
    const reports = await SoilReport.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(reports)
})

export const getSoilReportById = asyncHandler(async (req, res) => {
    const report = await SoilReport.findById(req.params.id)

    if (!report) {
        res.status(404)
        throw new Error('Report not found')
    }

    if (report.user.toString() !== req.user._id.toString()) {
        res.status(401)
        throw new Error('Not authorized')
    }

    res.json(report)
})

export const deleteSoilReport = asyncHandler(async (req, res) => {
    const report = await SoilReport.findById(req.params.id)

    if (!report) {
        res.status(404)
        throw new Error('Report not found')
    }

    if (report.user.toString() !== req.user._id.toString()) {
        res.status(401)
        throw new Error('Not authorized')
    }

    await report.deleteOne()
    res.json({ message: 'Report removed' })
})

// Manual soil data entry
export const createManualReport = asyncHandler(async (req, res) => {
    const { nitrogen, phosphorus, potassium, ph, temperature, humidity, rainfall } = req.body

    if (nitrogen === undefined || phosphorus === undefined || potassium === undefined || ph === undefined) {
        res.status(400)
        throw new Error('Please provide N, P, K, and pH values')
    }

    // Create soil report with manual data
    const soilReport = await SoilReport.create({
        user: req.user._id,
        farmName: 'Manual Entry',
        location: req.user.location || 'Not specified',
        area: 1,
        soilType: 'Manual Entry',
        nitrogen: parseFloat(nitrogen),
        phosphorus: parseFloat(phosphorus),
        potassium: parseFloat(potassium),
        ph: parseFloat(ph),
        temperature: parseFloat(temperature) || 25,
        humidity: parseFloat(humidity) || 70,
        rainfall: parseFloat(rainfall) || 150,
        status: 'processing'
    })

    try {
        // Format soil data for AI service
        const soilData = formatSoilDataForAI(soilReport)

        // Validate soil data
        const validation = validateSoilData(soilData)
        if (!validation.isValid) {
            throw new Error(`Invalid soil data: ${validation.errors.join(', ')}`)
        }

        // Get complete AI analysis
        const aiAnalysis = await getCompleteAnalysis(soilData)

        // Update soil report with AI analysis
        soilReport.recommendation = {
            crop: aiAnalysis.cropRecommendation.crop,
            confidence: aiAnalysis.cropRecommendation.confidence,
            explanation: aiAnalysis.cropRecommendation.explanation,
            alternatives: aiAnalysis.cropRecommendation.alternatives
        }

        soilReport.soilHealthScore = aiAnalysis.soilHealth.score
        soilReport.soilHealthGrade = aiAnalysis.soilHealth.grade
        soilReport.recommendedCrop = aiAnalysis.cropRecommendation.crop
        soilReport.fertilizerRecommendation = aiAnalysis.fertilizerRecommendation
        soilReport.aiAnalysis = aiAnalysis
        soilReport.status = 'completed'

        await soilReport.save()

        res.status(201).json({
            success: true,
            reportId: soilReport._id,
            report: soilReport,
            message: 'Soil data analyzed successfully'
        })
    } catch (error) {
        console.error('AI Analysis failed:', error)
        soilReport.status = 'failed'
        soilReport.errorMessage = error.message
        await soilReport.save()

        res.status(500).json({
            success: false,
            reportId: soilReport._id,
            message: 'AI analysis failed',
            error: error.message
        })
    }
})
