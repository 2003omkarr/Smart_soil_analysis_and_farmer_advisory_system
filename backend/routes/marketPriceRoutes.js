import express from 'express'
import asyncHandler from 'express-async-handler'
import MarketPrice from '../models/MarketPrice.js'

const router = express.Router()

// Get market prices for a crop in a location
router.get('/prices/:crop/:state/:district', asyncHandler(async (req, res) => {
    const { crop, state, district } = req.params

    const prices = await MarketPrice.find({
        crop: { $regex: crop, $options: 'i' },
        state: { $regex: state, $options: 'i' },
        district: { $regex: district, $options: 'i' },
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    })
        .sort({ date: -1 })
        .limit(50)

    if (prices.length === 0) {
        return res.status(404).json({ 
            success: false, 
            message: 'No price data available for this crop/location',
            data: []
        })
    }

    // Calculate statistics
    const avgPrice = Math.round(prices.reduce((sum, p) => sum + (p.modalPrice || 0), 0) / prices.length)
    const minPriceOverall = Math.min(...prices.map(p => p.minPrice))
    const maxPriceOverall = Math.max(...prices.map(p => p.maxPrice))

    res.json({ 
        success: true, 
        data: prices,
        statistics: {
            avgPrice,
            minPrice: minPriceOverall,
            maxPrice: maxPriceOverall,
            totalRecords: prices.length
        }
    })
}))

// Get available markets in a district
router.get('/markets/:state/:district', asyncHandler(async (req, res) => {
    const { state, district } = req.params

    const markets = await MarketPrice.distinct('market', {
        state: { $regex: state, $options: 'i' },
        district: { $regex: district, $options: 'i' },
        date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })

    res.json({ 
        success: true, 
        data: markets || [] 
    })
}))

// Get available crops in a district
router.get('/crops/:state/:district', asyncHandler(async (req, res) => {
    const { state, district } = req.params

    const crops = await MarketPrice.distinct('crop', {
        state: { $regex: state, $options: 'i' },
        district: { $regex: district, $options: 'i' },
        date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })

    res.json({ 
        success: true, 
        data: crops || [] 
    })
}))

// Get all available states
router.get('/states', asyncHandler(async (req, res) => {
    const states = await MarketPrice.distinct('state')

    res.json({ 
        success: true, 
        data: states?.sort() || [] 
    })
}))

// Get districts for a state
router.get('/districts/:state', asyncHandler(async (req, res) => {
    const { state } = req.params

    const districts = await MarketPrice.distinct('district', {
        state: { $regex: state, $options: 'i' }
    })

    res.json({ 
        success: true, 
        data: districts?.sort() || [] 
    })
}))

export default router
