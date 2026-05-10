import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionsPlayed: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
  topTopics: [{ type: String }],
  lastActive: { type: Date, default: Date.now },
});

export default mongoose.model('Analytics', analyticsSchema);
