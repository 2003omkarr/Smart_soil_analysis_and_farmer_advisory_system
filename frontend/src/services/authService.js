import api from './api'

const register = async (userData) => {
    const response = await api.post('/auth/register', userData)
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
}

const login = async (userData) => {
    const response = await api.post('/auth/login', userData)
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
}

const logout = () => {
    localStorage.removeItem('user')
}

const updateLanguage = async (language) => {
    const response = await api.put('/auth/language', { language })
    if (response.data) {
        // Update user in localStorage with new language
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        user.language = language
        localStorage.setItem('user', JSON.stringify(user))
    }
    return response.data
}

const authService = {
    register,
    login,
    logout,
    updateLanguage,
}

export default authService
