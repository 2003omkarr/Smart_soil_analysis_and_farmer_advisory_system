import express from 'express'
import {
    uploadSoilReport,
    getSoilReports,
    getSoilReportById,
    deleteSoilReport,
    createManualReport,
} from '../controllers/soilController.js'
import { protect } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.post('/upload', protect, upload.single('soilReport'), uploadSoilReport)
router.post('/manual', protect, createManualReport)
router.get('/reports', protect, getSoilReports)
router.get('/report/:id', protect, getSoilReportById)
router.delete('/report/:id', protect, deleteSoilReport)

export default router
