import api from './api'

const getRecommendations = async (reportId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
    const response = await api.get(`/recommendations/${reportId}`, config)
    return response.data
}

const recommendationService = {
    getRecommendations,
}

export default recommendationService
