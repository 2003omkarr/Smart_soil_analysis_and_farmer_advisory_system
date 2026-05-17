import api from './api'

const marketPriceService = {
    // Get prices for a specific crop in a location
    getPricesForCrop: async (crop, state, district) => {
        try {
            const response = await api.get(
                `/market/prices/${encodeURIComponent(crop)}/${encodeURIComponent(state)}/${encodeURIComponent(district)}`
            )
            return response.data
        } catch (error) {
            console.error('Error fetching market prices:', error)
            return { success: false, data: [], statistics: {} }
        }
    },

    // Get available markets in a district
    getMarketsInDistrict: async (state, district) => {
        try {
            const response = await api.get(
                `/market/markets/${encodeURIComponent(state)}/${encodeURIComponent(district)}`
            )
            return response.data.data || []
        } catch (error) {
            console.error('Error fetching markets:', error)
            return []
        }
    },

    // Get available crops in a district
    getCropsInDistrict: async (state, district) => {
        try {
            const response = await api.get(
                `/market/crops/${encodeURIComponent(state)}/${encodeURIComponent(district)}`
            )
            return response.data.data || []
        } catch (error) {
            console.error('Error fetching crops:', error)
            return []
        }
    },

    // Get all available states
    getStates: async () => {
        try {
            const response = await api.get('/market/states')
            return response.data.data || []
        } catch (error) {
            console.error('Error fetching states:', error)
            return []
        }
    },

    // Get districts for a state
    getDistricts: async (state) => {
        try {
            const response = await api.get(`/market/districts/${encodeURIComponent(state)}`)
            return response.data.data || []
        } catch (error) {
            console.error('Error fetching districts:', error)
            return []
        }
    },
}

export default marketPriceService
