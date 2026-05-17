import express from 'express'
import { register, login, getMe, updateLanguage } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)
router.put('/language', protect, updateLanguage)

export default router
