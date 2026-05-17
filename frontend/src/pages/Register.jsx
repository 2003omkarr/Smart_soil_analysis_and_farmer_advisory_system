import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register, reset } from '../store/slices/authSlice'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useTranslation } from '../hooks/useTranslation'

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        password: '',
        confirmPassword: '',
        role: 'farmer', // Default role
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
        const trimmedName = formData.name.trim()
        const trimmedEmail = formData.email.trim()
        const trimmedPhone = formData.phone.trim()
        const trimmedLocation = formData.location.trim()
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const phonePattern = /^(?:\+91[\s-]?)?[6-9]\d{9}$/

        if (!trimmedName) {
            nextErrors.name = t('required')
        }

        if (!trimmedEmail) {
            nextErrors.email = t('required')
        } else if (!emailPattern.test(trimmedEmail)) {
            nextErrors.email = t('invalidEmail')
        }

        if (!trimmedPhone) {
            nextErrors.phone = t('required')
        } else if (!phonePattern.test(trimmedPhone)) {
            nextErrors.phone = t('invalidPhone')
        }

        if (!trimmedLocation) {
            nextErrors.location = t('required')
        }

        if (!formData.password.trim()) {
            nextErrors.password = t('required')
        } else if (formData.password.length < 6) {
            nextErrors.password = t('passwordTooShort')
        }

        if (!formData.confirmPassword.trim()) {
            nextErrors.confirmPassword = t('required')
        } else if (formData.password !== formData.confirmPassword) {
            nextErrors.confirmPassword = t('passwordMismatch')
        }

        setErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const onSubmit = (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        const userData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            role: formData.role,
            password: formData.password,
        }

        dispatch(register(userData))
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
            >
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    Register for Smart Soil Advisory
                </h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('name')}
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={onChange}
                            aria-invalid={Boolean(errors.name)}
                            className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-400' : ''}`}
                            required
                        />
                        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                    </div>
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
                        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('phone')}
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={onChange}
                            aria-invalid={Boolean(errors.phone)}
                            className={`input-field ${errors.phone ? 'border-red-500 focus:ring-red-400' : ''}`}
                            required
                        />
                        {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('location')}
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={onChange}
                            aria-invalid={Boolean(errors.location)}
                            className={`input-field ${errors.location ? 'border-red-500 focus:ring-red-400' : ''}`}
                            required
                        />
                        {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('role')}
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={onChange}
                            className="input-field"
                            required
                        >
                            <option value="farmer">Farmer</option>
                            <option value="lab_technician">Lab Technician</option>
                            <option value="agriculture_expert">Agriculture Expert</option>
                            <option value="admin">Admin</option>
                        </select>
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
                        {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('confirmPassword')}
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={onChange}
                            aria-invalid={Boolean(errors.confirmPassword)}
                            className={`input-field ${errors.confirmPassword ? 'border-red-500 focus:ring-red-400' : ''}`}
                            required
                        />
                        {errors.confirmPassword && (
                            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary"
                    >
                        {isLoading ? t('loading') : t('register')}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                        Login
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}

export default Register
