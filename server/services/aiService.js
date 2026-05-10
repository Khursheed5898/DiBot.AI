import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getSystemInstruction = (topic, aiPosition, difficulty) => {
  const base = `You are an elite AI debate expert participating in a high-stakes competitive debate.
Topic: "${topic}"
Your Stance: "${aiPosition.toUpperCase()}"

Rules for your responses:
1. **Language Matching (STRICT)**: You MUST respond in the EXACT SAME language or dialect used by the user. If they use Hinglish, you respond in Hinglish. If they use Hindi, you respond in Hindi. If they use English, you use English.
2. **Diversity (CRITICAL)**: NEVER repeat the same arguments or phrasing. Every response must explore a NEW angle of the topic.
3. **Topic-Wise Structure**: Organize your response into 2-3 clear sections using Markdown headers (###). Each header MUST start with ONE relevant emoji.
4. **Emoji Usage (STRICT)**: Use emojis **ONLY** at the start of headers. Do NOT use any emojis inside the paragraphs or at the end of sentences. Keep the body text professional and clean.
3. **Double Spacing**: Use double newlines (\\n\\n) between every paragraph and section for maximum visibility.
4. **Arg-Opinion-Question**: Follow this flow:
   - **### 🎯 Counter-Analysis**: Dismantle the USER's specific argument with logic.
   - **### 💡 Deep Stance**: State your expert opinion and evidence.
   - **### 🧐 Challenge**: End with a sharp, relevant question.
5. **Length Control**: Keep responses around 150-250 words.
6. **Tone**: Be professional, sharp, and competitive.
`;

  return base;
};

export async function getAIReply(userMessage, topic, userPosition, difficulty, history = []) {
  if (!process.env.GROQ_API_KEY) throw new Error("Groq API key missing.");

  try {
    const aiPosition = userPosition === "for" ? "against" : "for";
    const systemPrompt = getSystemInstruction(topic, aiPosition, difficulty);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: userMessage },
    ];

    console.log(`[DEBUG] Calling Groq with model: llama-3.3-70b-versatile`);
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    return chatCompletion.choices[0].message.content;
  } catch (err) {
    console.error("Groq Reply Error Details:", err.stack);
    throw err;
  }
}

export async function getAIOpening(topic, userPosition, difficulty) {
  if (!process.env.GROQ_API_KEY) throw new Error("Groq API key missing.");

  try {
    const aiPosition = userPosition === "for" ? "against" : "for";
    const systemPrompt = getSystemInstruction(topic, aiPosition, difficulty);

    const prompt = `Start with a polite welcome (e.g. 'Welcome to the DiBot Debate Arena!'). 
Follow with a short, high-level introduction to the topic "${topic}" to set the context.
Then, present your initial, multi-layered argument as the ${aiPosition.toUpperCase()} stance.
Use double spacing and emojis.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    return chatCompletion.choices[0].message.content;
  } catch (err) {
    console.error("Groq Opening Error:", err.message);
    throw err;
  }
}

export async function analyzePerformance(history, difficulty = "Medium") {
  try {
    const systemPrompt = `You are an elite, impartial debate judge. Analyze the provided debate history and provide a FAIR and ORIGINAL assessment of the user's performance.
    
    CRITICAL: You MUST adjust your scoring strictness based on the Difficulty Level: "${difficulty.toUpperCase()}".
    
    - EASY: Be encouraging and lenient. Minor logical gaps are acceptable.
    - MEDIUM: Standard academic judging. Require clear reasoning and evidence.
    - HARD/EXPERT: Be very critical. Deduct points for logical fallacies, weak counter-arguments, or poor structure.
    - INSANE: Be extremely harsh. Only elite-level, flawless arguments should receive scores above 80%.
    
    Return your analysis strictly as a JSON object with this structure:
    {
      "userScore": 0-100,
      "aiScore": 0-100,
      "logicScore": 0-100,
      "persuasionScore": 0-100,
      "clarityScore": 0-100,
      "overallScore": 0-100,
      "feedback": "A concise, genuine analysis of their performance",
      "strengths": ["...", "..."],
      "improvementAreas": ["...", "..."]
    }`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Difficulty: ${difficulty}\nDebate History: ${JSON.stringify(history)}` },
      ],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (err) {
    console.error("Groq Analysis Error:", err.message);
    throw err;
  }
}
