import Groq from "groq-sdk";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env file (2 levels up from server/services/)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing in your root .env file");
  }
  return new Groq({ apiKey });
};

const getModelName = () => process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const FALLBACK_MODELS = [
  process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  "llama3-70b-8192",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

async function createCompletionWithFallback(params) {
  const groq = getGroqClient();
  let lastError = null;

  for (const model of FALLBACK_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        ...params,
        model,
      });
      return completion;
    } catch (err) {
      lastError = err;
      if (
        err.status === 429 ||
        (err.message && err.message.includes("rate_limit_exceeded"))
      ) {
        console.warn(
          `Groq Model ${model} rate limited (429). Falling back to next available model...`,
        );
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

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
10. **GENDER & PERSONA MANDATE (LANGUAGE-SPECIFIC)**:
    - **HINDI (Native Devanagari Script - STRICT FEMALE PERSONA ONLY)**:
      Whenever responding in HINDI (हिंदी देवनागरी), YOU MUST STRICTLY ADOPT A FEMALE PERSONA AND USE FEMININE GENDER GRAMMAR FOR YOURSELF:
      - ✅ MUST USE FEMALE VERB ENDINGS IN HINDI: "मैं कहना चाहती हूँ", "मैं मानती हूँ", "मैं समझती हूँ", "मैं बताना चाहती हूँ", "मैं सोचती हूँ", "मैं तर्क देना चाहती हूँ"
      - ❌ STRICTLY FORBIDDEN (MALE VERBS IN HINDI): "मैं कहना चाहता हूँ", "मैं मानता हूँ", "मैं समझता हूँ", "मैं बताता हूँ", "मैं सोचता हूँ"
    - **HINGLISH & ENGLISH (Latin Script - STRICT MALE PERSONA ONLY)**:
      Whenever responding in HINGLISH or ENGLISH, YOU MUST STRICTLY ADOPT A MALE PERSONA AND USE MASCULINE GENDER GRAMMAR FOR YOURSELF:
      - ✅ MUST USE MALE VERB ENDINGS IN HINGLISH: "main kehna chahata hu", "main maanta hu", "main sochta hu", "main batana chahata hu", "main samjhatta hu"
      - ❌ STRICTLY FORBIDDEN (FEMALE VERBS IN HINGLISH): "main kehna chahati hu", "main maanti hu", "main sochti hu"
`;

  return base;
};

export async function getAIReply(userMessage, topic, userPosition, difficulty, history = [], replyLang = "auto") {
  if (!process.env.GROQ_API_KEY) throw new Error("Groq API key missing.");

  try {
    const aiPosition = userPosition === "for" ? "against" : "for";
    const systemPrompt = getSystemInstruction(topic, aiPosition, difficulty, replyLang);

    let tailInstruction = "Act as a literal language MIRROR. If input is in Hindi script, respond in native Devnagri Hindi script using FEMALE persona ('कहना चाहती हूँ'). If English or Hinglish, respond using MALE persona ('kehna chahata hu').";
    if (replyLang === "hindi") tailInstruction = "CRITICAL MANDATE: RESPOND 100% EXCLUSIVELY IN NATIVE HINDI DEVANAGARI SCRIPT (हिंदी देवनागरी लिपि). ALWAYS USE FEMALE PERSONA GRAMMAR FOR YOURSELF (e.g., 'मैं कहना चाहती हूँ', 'मैं मानती हूँ'). ZERO MALE VERBS ALLOWED FOR HINDI.";
    if (replyLang === "english") tailInstruction = "RESPOND 100% IN STANDARD ENGLISH ONLY. USE MALE PERSONA.";
    if (replyLang === "hinglish") tailInstruction = "CRITICAL MANDATE: RESPOND 100% IN LATIN-SCRIPT HINGLISH ONLY. ALWAYS USE MALE PERSONA GRAMMAR FOR YOURSELF (e.g., 'main kehna chahata hu', 'main maanta hu', 'main sochta hu'). ZERO FEMALE VERBS ALLOWED FOR HINGLISH.";

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

    console.log(`[DEBUG] Calling Groq with model: ${getModelName()}`);
    const chatCompletion = await createCompletionWithFallback({
      messages: messages,
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

    const chatCompletion = await createCompletionWithFallback({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
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
    4. LANGUAGE CONSISTENCY (MANDATORY): Automatically detect the primary language used by the user during the debate (e.g. English, Hinglish, Hindi, Spanish, etc.). You MUST write all evaluation text (the "feedback" paragraph, "strengths" list, "improvementAreas" list, and "fallacies" list) in THAT SAME EXACT PRIMARY LANGUAGE!
    5. POINT COUNT (MANDATORY): You MUST generate AT LEAST 4 TO 5 distinct points in the "strengths" array, and AT LEAST 4 TO 5 distinct points in the "improvementAreas" array.
    
    CRITICAL: You MUST scale your judging harshness based on the Difficulty Level: "${difficulty.toUpperCase()}".
    
    - EASY: The AI was gentle. If the user maintained a basic coherent stance, they can win.
    - MEDIUM: Standard competitive level. Equal playing field. Require logical coherence and direct responses.
    - HARD: Be highly critical. The AI was rigorous. The user will likely lose unless they deployed excellent counters and evidence.
    - INSANE: The AI was a grandmaster. The user MUST lose unless their arguments were completely flawless and elite-level.
    
    Return your analysis strictly as a JSON object with this structure:
    {
      "userScore": 0-100,
      "aiScore": 0-100,
      "logicScore": 0-100,
      "persuasionScore": 0-100,
      "clarityScore": 0-100,
      "overallScore": 0-100,
      "feedback": "A concise, genuine, and completely impartial feedback paragraph explaining WHY the winner won and where the loser fell short (in the SAME language as the debate).",
      "strengths": ["specific strength 1", "specific strength 2", "specific strength 3", "specific strength 4", "specific strength 5"],
      "improvementAreas": ["specific weakness 1", "specific weakness 2", "specific weakness 3", "specific weakness 4", "specific weakness 5"],
      "fallacies": ["Named Logical Fallacy 1"]
    }`;

    const chatCompletion = await createCompletionWithFallback({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Difficulty: ${difficulty}\nDebate History: ${JSON.stringify(history)}` },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (err) {
    console.error("Groq Analysis Error:", err.message);
    throw err;
  }
}
