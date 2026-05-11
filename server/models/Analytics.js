import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionsPlayed: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
  totalXp: { type: Number, default: 0 },
  topTopics: [{ type: String }],
  lastActive: { type: Date, default: Date.now },
  performanceHistory: [{
    topic: String,
    date: { type: Date, default: Date.now },
    score: Number,
    logicScore: Number,
    persuasionScore: Number,
    clarityScore: Number,
    feedback: String
  }]
});

export default mongoose.model('Analytics', analyticsSchema);
