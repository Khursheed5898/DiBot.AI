import express from 'express'
import { startDebate, debateMessage, getHistory, endDebate } from '../controllers/debateController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/start', authMiddleware, startDebate)
router.post('/message', debateMessage) // Optional, but can keep it open for performance 
router.post('/end', authMiddleware, endDebate)
router.get('/history', authMiddleware, getHistory)

export default router
