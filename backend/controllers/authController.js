import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

export const register = asyncHandler(async (req, res) => {
    const { name, email, phone, location, password } = req.body

    if (!name || !email || !phone || !location || !password) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    const userExists = await User.findOne({ email })

    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    const user = await User.create({
        name,
        email,
        phone,
        location,
        password,
    })

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            role: user.role,
            language: user.language || 'en',
            token: generateToken(user._id),
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            role: user.role,
            language: user.language || 'en',
            token: generateToken(user._id),
        })
    } else {
        res.status(401)
        throw new Error('Invalid email or password')
    }
})

export const getMe = asyncHandler(async (req, res) => {
    res.json(req.user)
})

export const updateLanguage = asyncHandler(async (req, res) => {
    const { language } = req.body

    if (!language) {
        res.status(400)
        throw new Error('Please provide a language')
    }

    // Validate language
    const validLanguages = ['en', 'hi', 'mr', 'es']
    if (!validLanguages.includes(language)) {
        res.status(400)
        throw new Error('Invalid language. Supported languages: en, hi, mr, es')
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { language },
        { new: true }
    )

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        language: user.language,
        message: 'Language updated successfully'
    })
})
