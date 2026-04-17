import mongoose from 'mongoose'

const debateSessionSchema = new mongoose.Schema({
  topic: String,
  userPosition: String,
  difficulty: String,
  messages: Array,
  createdAt: { type: Date, default: Date.now }
})
export default mongoose.model('DebateSession', debateSessionSchema)
