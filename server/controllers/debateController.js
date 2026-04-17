import mongoose from "mongoose";
import DebateSession from "../models/DebateSession.js";
import { getAIReply, getAIOpening } from "../services/geminiService.js";

async function saveSessionIfPossible(payload) {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  try {
    await DebateSession.create(payload);
  } catch (error) {
    console.warn("Skipping debate session save:", error.message);
  }
}

export async function startDebate(req, res) {
  const { topic, position, difficulty } = req.body;

  if (!topic || !position) {
    res.status(400).json({ error: "Topic and position are required." });
    return;
  }

  try {
    const opening = await getAIOpening(topic, position, difficulty);

    await saveSessionIfPossible({
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
  const { message, topic, position, difficulty } = req.body;

  if (!message || !topic || !position) {
    res
      .status(400)
      .json({ error: "Message, topic, and position are required." });
    return;
  }

  try {
    const reply = await getAIReply(message, topic, position, difficulty);
    res.json({ reply });
  } catch (err) {
    console.error("Error generating reply:", err.message);
    res.status(500).json({ error: err.message || "Failed to generate AI reply." });
  }
}
