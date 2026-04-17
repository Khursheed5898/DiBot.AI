import express from 'express'
import { startDebate, debateMessage } from '../controllers/debateController.js'

const router = express.Router()
router.post('/start', startDebate)
router.post('/message', debateMessage)

export default router
