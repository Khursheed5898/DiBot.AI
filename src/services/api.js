import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

function buildOpening(topic, position) {
  const aiPosition = position === "for" ? "AGAINST" : "FOR";
  return `Welcome to the debate. The topic is "${topic}". You are arguing ${position.toUpperCase()} this position, and I will argue ${aiPosition}. Start with your clearest opening claim, then defend it with one concrete reason.`;
}

function buildFallbackReply(message, position, difficulty) {
  const shortClaim =
    message.length > 110 ? `${message.slice(0, 107)}...` : message;
  const aiSide = position === "for" ? "against" : "for";

  const variants = {
    easy: [
      `You argue that "${shortClaim}", but that still assumes the policy will work as intended in every case. If the idea is truly necessary, what evidence shows it can be funded and managed without creating new problems?`,
      "That sounds reasonable on the surface, but necessity is a much stronger claim than usefulness. Why should the judge accept this as essential rather than simply helpful?",
    ],
    medium: [
      "Your point highlights one benefit, but it does not prove the trade-off is worth the national cost. If the state must carry that burden long term, where is the evidence that productivity and public revenue will keep pace?",
      "You are treating a possible outcome as a reliable one. Why should we commit to a system this large before you show that the same resources could not solve the problem more efficiently elsewhere?",
    ],
    hard: [
      "That argument depends on the best-case version of the policy, not the version that survives contact with tax pressure, uneven participation, and political compromise. If necessity is your standard, how do you justify a model that can weaken incentives while demanding permanent funding?",
      "You are asking the judge to ignore the implementation gap. Even if the principle sounds fair, why should society accept a costly universal promise when targeted intervention could produce stronger outcomes with less distortion?",
    ],
    expert: [
      `Your claim collapses the distinction between moral appeal and policy sufficiency. On the ${aiSide.toUpperCase()} side, I only need to show that your mechanism is under-justified, fiscally vulnerable, and less efficient than narrower alternatives, so what is your strongest proof that universality adds value rather than waste?`,
      "You are defending necessity, yet your reasoning shows at most plausibility. If the burden is that high, how do you answer the charge that universality creates deadweight cost while leaving the core structural problem largely untouched?",
    ],
  };

  const pool = variants[difficulty] || variants.medium;
  return pool[Math.floor(Math.random() * pool.length)];
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
}) {
  try {
    const response = await api.post("/debate/message", {
      message,
      topic,
      position,
      difficulty,
      round,
      totalRounds,
    });

    return response.data.reply;
  } catch (error) {
    console.warn("Using local debate fallback:", error);
    return buildFallbackReply(message, position, difficulty);
  }
}
