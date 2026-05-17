import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import { errorHandler } from './middleware/errorMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import soilRoutes from './routes/soilRoutes.js'
import recommendationRoutes from './routes/recommendationRoutes.js'
import marketPriceRoutes from './routes/marketPriceRoutes.js'
import { seedMarketPrices, addSampleHistoricalData } from './services/marketPriceService.js'

dotenv.config()

connectDB()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/uploads', express.static('uploads'))

app.get('/', (req, res) => {
    res.json({ message: 'Smart Soil Advisory API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/soil', soilRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/market', marketPriceRoutes)

// Seed market data on startup
seedMarketPrices().catch(err => console.error('Error seeding market data:', err))

app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
