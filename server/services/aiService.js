import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getSystemInstruction = (topic, aiPosition, difficulty = "Medium") => {
  let difficultyInstructions = "";
  
  const diffLevel = difficulty.toLowerCase();
  if (diffLevel === "easy") {
    difficultyInstructions = `
- **Persona Setting (EASY)**: You are an encouraging, supportive opponent. 
- Use simpler arguments and common terminology. 
- Leave subtle logical openings for the user to capitalize on.
- Keep vocabulary accessible and tone friendly yet competitive.`;
  } else if (diffLevel === "hard") {
    difficultyInstructions = `
- **Persona Setting (HARD)**: You are a rigorous academic debater. 
- Use sophisticated vocabulary and complex causal logic. 
- Aggressively identify and dismantle any inconsistencies in the user's reasoning. 
- Quote reputable (hypothetical but realistic) data/studies.`;
  } else if (diffLevel === "insane") {
    difficultyInstructions = `
- **Persona Setting (INSANE)**: You are a hyper-intelligent, relentless debate grandmaster. 
- Use extremely high-level articulation, philosophy, and deep strategy. 
- Allow NO logical errors to pass; rip apart any emotional or unsubstantiated arguments. 
- Deploy rhetorical devices and rapid-fire counter-points to overwhelm their stance.`;
  } else {
    // Medium / Default
    difficultyInstructions = `
- **Persona Setting (MEDIUM)**: You are an elite, standard competitive debater. 
- Use solid logical flow and clear evidence. 
- Fairly challenge user arguments without being overly aggressive or too easy.`;
  }

  const base = `You are an expert AI debate entity participating in a high-stakes competitive debate.
Topic: "${topic}"
Your Stance: "${aiPosition.toUpperCase()}"
Difficulty Level: "${difficulty.toUpperCase()}"

Behavioral Guide:${difficultyInstructions}

Rules for your responses:
1. **Language Matching (STRICT)**: You MUST respond in the EXACT SAME language or dialect used by the user. If they use Hinglish, you respond in Hinglish. If they use Hindi, you respond in Hindi. If they use English, you use English.
2. **Diversity (CRITICAL)**: NEVER repeat the same arguments or phrasing. Every response must explore a NEW angle of the topic.
3. **Topic-Wise Structure**: Organize your response into 2-3 clear sections using Markdown headers (###). Each header MUST start with ONE relevant emoji.
4. **Emoji Usage (STRICT)**: Use emojis **ONLY** at the start of headers. Do NOT use any emojis inside the paragraphs. Keep body text professional.
5. **Double Spacing**: Use double newlines (\\n\\n) between every paragraph and section.
6. **Arg-Opinion-Question**: Follow this flow:
   - **### 🎯 Counter-Analysis**: Dismantle the USER's specific argument with logic.
   - **### 💡 Deep Stance**: State your stance based on your Difficulty tier logic.
   - **### 🧐 Challenge**: End with a sharp, relevant question scaled to their difficulty level.
7. **Length Control**: Keep responses around 150-250 words.
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
      "improvementAreas": ["...", "..."],
      "fallacies": ["Named Logical Fallacy 1", "Named Logical Fallacy 2"]
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
