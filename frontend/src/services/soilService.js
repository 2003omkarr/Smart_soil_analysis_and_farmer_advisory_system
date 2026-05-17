import api from './api'

const uploadReport = async (formData, token) => {
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
        },
    }
    const response = await api.post('/soil/upload', formData, config)
    return response.data
}

const getReports = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
    const response = await api.get('/soil/reports', config)
    return response.data
}

const getReportById = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
    const response = await api.get(`/soil/report/${id}`, config)
    return response.data
}

const soilService = {
    uploadReport,
    getReports,
    getReportById,
}

export default soilService
