import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL_NAME = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const getSystemInstruction = (topic, aiPosition, difficulty = "Medium", replyLang = "auto") => {
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

  // DYNAMIC UI-FORCED LANGUAGE OVERRIDE ENGINE
  let dynamicLanguageRule = "";
  if (replyLang === "hindi") {
    dynamicLanguageRule = `1. **Language Control (STRICT DEVANAGARI)**: YOU MUST RESPOND 100% EXCLUSIVELY IN NATIVE DEVANAGARI HINDI SCRIPT (हिंदी देवनागरी). EVERY SINGLE WORD, PARAGRAPH, AND HEADER MUST BE IN HINDI (देवनागरी). ZERO ENGLISH WORDS OR LATIN ALPHABET ALLOWED.
    Use Hindi headers:
    - ### 🎯 प्रति-विश्लेषण
    - ### 💡 मुख्य दृष्टिकोण
    - ### 🧐 प्रश्न / चुनौती`;
  } else if (replyLang === "english") {
    dynamicLanguageRule = "1. **Language Control**: RESPOND EXCLUSIVELY IN STANDARD ENGLISH. NO HINDI, NO DEVANGRI.";
  } else if (replyLang === "hinglish") {
    dynamicLanguageRule = "1. **Language Control**: RESPOND STRICTLY IN 50/50 HINGLISH BLEND USING LATIN ALPHABET ONLY. Forcefully mix English & Latin-Hindi phrases.";
  } else {
    // Default: Smart Mirror Auto Mode
    dynamicLanguageRule = `1. **Dynamic Language Mirroring (ABSOLUTE)**: Analyze user input and mirror seamlessly:
   - **Case A (English)**: If user speaks English, respond 100% Elite English.
   - **Case B (Hindi)**: If user speaks Hindi script, respond in native Devnagri Hindi.
   - **Case C (Hinglish)**: If user speaks Hinglish (Latin), reply in natural 50/50 Hinglish.`;
  }

  const base = `You are an expert AI debate entity participating in a high-stakes competitive debate.
Topic: "${topic}"
Your Stance: "${aiPosition.toUpperCase()}"
Difficulty Level: "${difficulty.toUpperCase()}"

Behavioral Guide:${difficultyInstructions}

Rules for your responses:
${dynamicLanguageRule}
2. **Script Fidelity**: Always strictly match the output format defined in Rule 1.
3. **Diversity (CRITICAL)**: NEVER repeat the same arguments or phrasing. Every response must explore a NEW angle of the topic.
4. **Topic-Wise Structure**: Organize your response into 2-3 clear sections using Markdown headers (###). Each header MUST start with ONE relevant emoji.
5. **Emoji Usage (STRICT)**: Use emojis **ONLY** at the start of headers. Do NOT use any emojis inside the paragraphs.
6. **Double Spacing**: Use empty lines to clearly separate paragraphs and sections.
7. **Arg-Opinion-Question**: Follow this flow:
   - **### 🎯 Counter-Analysis**: Dismantle the USER's specific argument with logic.
   - **### 💡 Deep Stance**: State your stance based on your Difficulty tier logic.
   - **### 🧐 Challenge**: End with a sharp, relevant question scaled to their difficulty level.
8. **Numerical Formatting (CRITICAL)**: NEVER use raw digits like "100" or "2024". ALWAYS write numbers out as full words (e.g., "one hundred" or "ek sau").
9. **Length Control**: Keep responses around 150-250 words.
`;

  return base;
};

export async function getAIReply(userMessage, topic, userPosition, difficulty, history = [], replyLang = "auto") {
  if (!process.env.GROQ_API_KEY) throw new Error("Groq API key missing.");

  try {
    const aiPosition = userPosition === "for" ? "against" : "for";
    const systemPrompt = getSystemInstruction(topic, aiPosition, difficulty, replyLang);

    let tailInstruction = "Act as a literal language MIRROR. If input is in Hindi script, respond in native Devnagri Hindi script. If English, respond in English.";
    if (replyLang === "hindi") tailInstruction = "CRITICAL MANDATE: RESPOND 100% EXCLUSIVELY IN NATIVE HINDI DEVANAGARI SCRIPT (हिंदी देवनागरी लिपि). WRITE EVERY PARAGRAPH, HEADER, AND WORD IN HINDI DEVANAGARI SCRIPT ONLY. DO NOT USE ANY ENGLISH LETTERS OR LATIN ALPHABET AT ALL.";
    if (replyLang === "english") tailInstruction = "RESPOND 100% IN STANDARD ENGLISH ONLY. ZERO Hindi allowed.";
    if (replyLang === "hinglish") tailInstruction = "RESPOND 100% IN LATIN-SCRIPT HINGLISH ONLY. ZERO Devnagri allowed.";

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { 
        role: "user", 
        content: `${userMessage}\n\n(IMPORTANT INSTRUCTION: ${tailInstruction})`
      },
    ];

    console.log(`[DEBUG] Calling Groq with model: ${MODEL_NAME}`);
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: MODEL_NAME,
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
      model: MODEL_NAME,
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
    const systemPrompt = `You are a strictly impartial, world-class debate adjudicator. 
    Analyze the provided debate history and deliver a completely objective and critical assessment comparing the user's performance against the AI opponent's performance.
    
    CRITICAL COMPETITIVE RULES:
    1. OBJECTIVITY (NO FLATTERY BIAS): DO NOT automatically favor the user. Conversational models often suffer from "flattery bias"—you MUST avoid this. If the user's arguments were weaker, less articulated, or logically flawed compared to the AI's rebuttals, the AI MUST win (aiScore > userScore). 
    2. AUTHENTICITY: The scores must feel real and earned. If the user argued poorly, do not hesitate to give a failing score (e.g. 30-55). Only exceptional arguments deserve scores above 85%.
    3. COMPARATIVE JUDGING: Weigh the User's logical consistency against the AI's rebuttals. If the User ignored the AI's counter-points, deduct userScore heavily.
    
    CRITICAL: You MUST scale your judging harshness based on the Difficulty Level: "${difficulty.toUpperCase()}".
    
    - EASY: The AI was gentle. If the user maintained a basic coherent stance, they can win.
    - MEDIUM: Standard competitive level. Equal playing field. Require logical coherence and direct responses.
    - HARD: Be highly critical. The AI was rigorous. The user will likely lose unless they deployed excellent counters and evidence.
    - INSANE: The AI was a grandmaster. The user MUST lose unless their arguments were completely flawless and elite-level.
    
    Return your analysis strictly as a JSON object with this structure:
    {
      "userScore": 0-100,
      "aiScore": 0-100,
      "logicScore": 0-100, // Refers specifically to the user's logic metric
      "persuasionScore": 0-100, // Refers to user's persuasion metric
      "clarityScore": 0-100, // Refers to user's clarity metric
      "overallScore": 0-100, // The overall weighted rating for the user (should be close to userScore)
      "feedback": "A concise, genuine, and completely impartial feedback paragraph explaining WHY the winner won and where the loser fell short.",
      "strengths": ["specific user strength 1", "specific user strength 2"],
      "improvementAreas": ["specific user weakness 1", "specific user weakness 2"],
      "fallacies": ["Named Logical Fallacy 1", "Named Logical Fallacy 2"]
    }`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Difficulty: ${difficulty}\nDebate History: ${JSON.stringify(history)}` },
      ],
      model: MODEL_NAME,
      response_format: { type: "json_object" },
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (err) {
    console.error("Groq Analysis Error:", err.message);
    throw err;
  }
}
