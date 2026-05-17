import mongoose from 'mongoose'

const recommendationSchema = mongoose.Schema(
    {
        soilReport: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'SoilReport',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        crop: {
            type: String,
            required: true,
        },
        cropReason: {
            type: String,
        },
        soilHealthScore: {
            type: Number,
            min: 0,
            max: 100,
        },
        soilHealthStatus: {
            type: String,
        },
        fertilizers: [
            {
                name: String,
                dosage: String,
                timing: String,
            },
        ],
        irrigation: {
            type: String,
        },
        weatherAdvice: {
            type: String,
        },
        tips: [String],
        language: {
            type: String,
            default: 'en',
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.model('Recommendation', recommendationSchema)
