import express from 'express'
import { updateProfile, getProfileStats } from '../controllers/userController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// Protected routes
router.use(authenticate)

router.patch('/me', updateProfile)
router.get('/me/stats', getProfileStats)

export default router 