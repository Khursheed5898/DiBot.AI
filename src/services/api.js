import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Add interceptor to include token in headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = (email, password) => api.post("/auth/login", { email, password });
export const registerUser = (username, email, password) => api.post("/auth/register", { username, email, password });
export const getDebateHistory = () => api.get("/debate/history");

function buildOpening(topic, position) {
  const aiPosition = position === "for" ? "AGAINST" : "FOR";
  return `Welcome to the debate. The topic is "${topic}". You are arguing ${position.toUpperCase()} this position, and I will argue ${aiPosition}. Start with your clearest opening claim, then defend it with one concrete reason.`;
}

export async function startDebateSession(topic, position, difficulty) {
  try {
    const response = await api.post("/debate/start", {
      topic,
      position,
      difficulty,
    });

    return response.data.opening;
  } catch (error) {
    console.warn("Using local opening fallback:", error);
    return buildOpening(topic, position);
  }
}

export async function sendMessageToAI({
  message,
  topic,
  position,
  difficulty,
  round,
  totalRounds,
  history,
  replyLang, // New UI-forced language state
}) {
  try {
    const response = await api.post("/debate/message", {
      message,
      topic,
      position,
      difficulty,
      round,
      totalRounds,
      history,
      replyLang,
    });

    return response.data.reply;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message || "Failed to connect to AI.";
    throw new Error(errorMsg);
  }
}

export async function endDebateSession(history, topic, difficulty) {
  try {
    const response = await api.post("/debate/end", { history, topic, difficulty });
    return response.data; // { analysis }
  } catch (error) {
    console.error("Analysis Fallback:", error);
    return {
      analysis: {
        overallScore: 0,
        feedback: "Could not retrieve detailed analysis. Great job finishing the debate!",
        strengths: ["Consistency"],
        improvementAreas: ["Logic"],
        fallacies: []
      }
    };
  }
}
