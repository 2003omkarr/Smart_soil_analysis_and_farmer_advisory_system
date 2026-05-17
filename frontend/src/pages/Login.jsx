import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, reset } from '../store/slices/authSlice'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useTranslation } from '../hooks/useTranslation'

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [errors, setErrors] = useState({})

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    )

    useEffect(() => {
        if (isError) {
            toast.error(message)
        }

        if (isSuccess || user) {
            navigate('/dashboard')
        }

        dispatch(reset())
    }, [user, isError, isSuccess, message, navigate, dispatch])

    const onChange = (e) => {
        const { name, value } = e.target

        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }))

        if (errors[name]) {
            setErrors((prevErrors) => {
                const nextErrors = { ...prevErrors }
                delete nextErrors[name]
                return nextErrors
            })
        }
    }

    const validateForm = () => {
        const nextErrors = {}
        const trimmedEmail = formData.email.trim()
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!trimmedEmail) {
            nextErrors.email = t('required')
        } else if (!emailPattern.test(trimmedEmail)) {
            nextErrors.email = t('invalidEmail')
        }

        if (!formData.password.trim()) {
            nextErrors.password = t('required')
        } else if (formData.password.length < 6) {
            nextErrors.password = t('passwordTooShort')
        }

        setErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const onSubmit = (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        dispatch(login(formData))
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
            >
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    Login to Smart Soil Advisory
                </h2>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('email')}
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={onChange}
                            aria-invalid={Boolean(errors.email)}
                            className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-400' : ''}`}
                            required
                        />
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('password')}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={onChange}
                            aria-invalid={Boolean(errors.password)}
                            className={`input-field ${errors.password ? 'border-red-500 focus:ring-red-400' : ''}`}
                            required
                        />
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary"
                    >
                        {isLoading ? t('loading') : t('login')}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                        Register
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}

export default Login
