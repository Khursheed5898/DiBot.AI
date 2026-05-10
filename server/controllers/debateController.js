import DebateSession from "../models/DebateSession.js";
import Analytics from "../models/Analytics.js";
import { getAIReply, getAIOpening, analyzePerformance } from "../services/aiService.js";

async function saveSessionIfPossible(payload) {
  try {
    const session = await DebateSession.create(payload);
    
    if (payload.userId) {
      await Analytics.findOneAndUpdate(
        { userId: payload.userId },
        { 
          $inc: { sessionsPlayed: 1 },
          $set: { lastActive: new Date() }
        },
        { upsert: true }
      );
    }
    return session;
  } catch (error) {
    console.warn("Skipping debate session save:", error.message);
  }
}

export async function startDebate(req, res) {
  const { topic, position, difficulty } = req.body;
  const userId = req.user?.id; // From authMiddleware

  if (!topic || !position) {
    res.status(400).json({ error: "Topic and position are required." });
    return;
  }

  try {
    const opening = await getAIOpening(topic, position, difficulty);

    await saveSessionIfPossible({
      userId,
      topic,
      userPosition: position,
      difficulty,
      messages: [{ role: "assistant", content: opening }],
    });

    res.json({ opening });
  } catch (err) {
    console.error("Error starting debate:", err.message);
    res.status(500).json({ error: err.message || "Failed to start debate with AI." });
  }
}

export async function debateMessage(req, res) {
  const { message, topic, position, difficulty, history } = req.body;

  if (!message || !topic || !position) {
    res.status(400).json({ error: "Message, topic, and position are required." });
    return;
  }

  try {
    const reply = await getAIReply(message, topic, position, difficulty, history);
    res.json({ reply });
  } catch (err) {
    console.error("Error generating reply:", err.message);
    res.status(500).json({ error: err.message || "Failed to generate AI reply." });
  }
}

export async function endDebate(req, res) {
  const { history, topic, difficulty } = req.body;
  const userId = req.user?.id;

  if (!history || history.length === 0) {
    return res.status(400).json({ error: "Debate history is required." });
  }

  try {
    const analysis = await analyzePerformance(history, difficulty);

    if (userId) {
      await Analytics.findOneAndUpdate(
        { userId },
        { 
          $push: { 
            performanceHistory: {
              score: analysis.overallScore,
              logicScore: analysis.logicScore,
              persuasionScore: analysis.persuasionScore,
              clarityScore: analysis.clarityScore,
              topic: topic || "General",
              feedback: analysis.feedback,
              date: new Date()
            }
          }
        },
        { upsert: true }
      );
    }

    res.json({ analysis });
  } catch (err) {
    console.error("Error ending debate:", err.message);
    res.status(500).json({ error: "Failed to analyze performance." });
  }
}

export const getHistory = async (req, res) => {
  try {
    const history = await DebateSession.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
