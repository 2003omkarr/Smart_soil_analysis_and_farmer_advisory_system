import mongoose from 'mongoose'

const marketPriceSchema = new mongoose.Schema({
    crop: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: String,
        required: true,
        trim: true
    },
    market: {
        type: String,
        required: true,
        trim: true
    },
    minPrice: {
        type: Number,
        required: true
    },
    maxPrice: {
        type: Number,
        required: true
    },
    modalPrice: {
        type: Number,
        required: true
    },
    arrivalQuantity: {
        type: Number,
        default: 0
    },
    unit: {
        type: String,
        default: 'quintal'
    },
    date: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

// Index for faster queries
marketPriceSchema.index({ crop: 1, state: 1, district: 1, date: -1 })
marketPriceSchema.index({ state: 1, district: 1, market: 1 })

export default mongoose.model('MarketPrice', marketPriceSchema)
