import mongoose from 'mongoose'

const soilReportSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        farmName: {
            type: String,
            required: [true, 'Please add farm name'],
        },
        location: {
            type: String,
            required: [true, 'Please add location'],
        },
        area: {
            type: Number,
            required: [true, 'Please add area'],
        },
        soilType: {
            type: String,
            required: [true, 'Please add soil type'],
        },
        nitrogen: {
            type: Number,
            required: [true, 'Please add Nitrogen value'],
        },
        phosphorus: {
            type: Number,
            required: [true, 'Please add Phosphorus value'],
        },
        potassium: {
            type: Number,
            required: [true, 'Please add Potassium value'],
        },
        ph: {
            type: Number,
            required: [true, 'Please add pH value'],
        },
        rainfall: {
            type: Number,
            default: 150,
        },
        temperature: {
            type: Number,
            default: 25,
        },
        humidity: {
            type: Number,
            default: 70,
        },
        filePath: {
            type: String,
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending',
        },
        recommendation: {
            crop: String,
            confidence: Number,
            explanation: String,
            alternatives: [Object],
        },
        soilHealthScore: {
            type: Number,
        },
        soilHealthGrade: {
            type: String,
        },
        recommendedCrop: {
            type: String,
        },
        fertilizerRecommendation: {
            type: Object,
        },
        aiAnalysis: {
            type: Object,
        },
        errorMessage: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.model('SoilReport', soilReportSchema)
