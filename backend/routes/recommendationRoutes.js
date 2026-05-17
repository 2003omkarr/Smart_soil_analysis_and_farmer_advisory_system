import express from 'express'
import {
    getRecommendations,
    getAllRecommendations,
} from '../controllers/recommendationController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/:reportId', protect, getRecommendations)
router.get('/', protect, getAllRecommendations)

export default router
