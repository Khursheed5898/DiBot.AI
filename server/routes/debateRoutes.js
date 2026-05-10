import express from 'express'
import { startDebate, debateMessage, getHistory, endDebate } from '../controllers/debateController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/start', startDebate)
router.post('/message', debateMessage)
router.post('/end', endDebate)
router.get('/history', authMiddleware, getHistory)

export default router
