import MarketPrice from '../models/MarketPrice.js'

// Sample market data for seeding - You can replace with actual AGMARKNET data
const SAMPLE_MARKET_DATA = [
    // Nagpur, Maharashtra - Wheat
    { crop: 'Wheat', state: 'Maharashtra', district: 'Nagpur', market: 'Nagpur APMC', minPrice: 2100, maxPrice: 2300, modalPrice: 2200, arrivalQuantity: 1500 },
    { crop: 'Wheat', state: 'Maharashtra', district: 'Nagpur', market: 'Saoner Market', minPrice: 2050, maxPrice: 2250, modalPrice: 2150, arrivalQuantity: 800 },
    
    // Nagpur - Rice
    { crop: 'Rice', state: 'Maharashtra', district: 'Nagpur', market: 'Nagpur APMC', minPrice: 3200, maxPrice: 3500, modalPrice: 3350, arrivalQuantity: 2000 },
    { crop: 'Rice', state: 'Maharashtra', district: 'Nagpur', market: 'Saoner Market', minPrice: 3150, maxPrice: 3450, modalPrice: 3300, arrivalQuantity: 1200 },
    
    // Nagpur - Cotton
    { crop: 'Cotton', state: 'Maharashtra', district: 'Nagpur', market: 'Nagpur APMC', minPrice: 5800, maxPrice: 6200, modalPrice: 6000, arrivalQuantity: 500 },
    
    // Nagpur - Sugarcane
    { crop: 'Sugarcane', state: 'Maharashtra', district: 'Nagpur', market: 'Nagpur APMC', minPrice: 3400, maxPrice: 3800, modalPrice: 3600, arrivalQuantity: 3000 },
    
    // Nagpur - Soybean
    { crop: 'Soybean', state: 'Maharashtra', district: 'Nagpur', market: 'Nagpur APMC', minPrice: 3900, maxPrice: 4200, modalPrice: 4050, arrivalQuantity: 1000 },
    
    // Pune, Maharashtra - Wheat
    { crop: 'Wheat', state: 'Maharashtra', district: 'Pune', market: 'Pune APMC', minPrice: 2150, maxPrice: 2350, modalPrice: 2250, arrivalQuantity: 1800 },
    
    // Pune - Rice
    { crop: 'Rice', state: 'Maharashtra', district: 'Pune', market: 'Pune APMC', minPrice: 3300, maxPrice: 3600, modalPrice: 3450, arrivalQuantity: 2200 },
    
    // Aurangabad - Wheat
    { crop: 'Wheat', state: 'Maharashtra', district: 'Aurangabad', market: 'Aurangabad APMC', minPrice: 2080, maxPrice: 2280, modalPrice: 2180, arrivalQuantity: 1400 },
    
    // Aurangabad - Cotton
    { crop: 'Cotton', state: 'Maharashtra', district: 'Aurangabad', market: 'Aurangabad APMC', minPrice: 5900, maxPrice: 6300, modalPrice: 6100, arrivalQuantity: 600 },
]

export const seedMarketPrices = async () => {
    try {
        const existingData = await MarketPrice.countDocuments()
        
        if (existingData === 0) {
            console.log('🌾 Seeding market price data...')
            
            // Add current date to sample data
            const dataToSeed = SAMPLE_MARKET_DATA.map(item => ({
                ...item,
                date: new Date()
            }))
            
            await MarketPrice.insertMany(dataToSeed)
            console.log(`✅ Seeded ${dataToSeed.length} market price records`)
        } else {
            console.log(`📊 Market price data already exists (${existingData} records)`)
        }
    } catch (error) {
        console.error('Error seeding market prices:', error)
    }
}

export const addSampleHistoricalData = async () => {
    try {
        // Add historical data for last 30 days
        const today = new Date()
        const dataPoints = []
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            
            // Create variations for each date
            SAMPLE_MARKET_DATA.forEach(item => {
                // Add slight price variations for historical authenticity
                const priceVariation = Math.floor(Math.random() * 200) - 100
                dataPoints.push({
                    ...item,
                    minPrice: item.minPrice + priceVariation,
                    maxPrice: item.maxPrice + priceVariation,
                    modalPrice: item.modalPrice + priceVariation,
                    date: date
                })
            })
        }
        
        console.log(`📈 Adding ${dataPoints.length} historical price records`)
        await MarketPrice.insertMany(dataPoints, { ordered: false }).catch(err => {
            // Ignore duplicate key errors
            if (err.code !== 11000) throw err
        })
        console.log('✅ Historical data added')
    } catch (error) {
        if (error.code !== 11000) {
            console.error('Error adding historical data:', error.message)
        }
    }
}
