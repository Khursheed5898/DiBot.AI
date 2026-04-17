import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' }) // Read from root or fallback to environment vars

const apiKey = process.env.GEMINI_API_KEY || ""
const genAI = new GoogleGenerativeAI(apiKey)

export async function getAIOpening(topic, userPosition, difficulty) {
  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey === "dummy_key_if_none_exists") {
    throw new Error("Invalid or missing API key.");
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const aiPosition = userPosition === 'for' ? 'against' : 'for'
    
    const difficultyLabel = difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1);
    
    const prompt = `You are a professional AI debater. 
The debate topic is: "${topic}".
The user is arguing: "${userPosition.toUpperCase()}". 
You must take the opposite position: "${aiPosition.toUpperCase()}".
The difficulty level is ${difficultyLabel}.

Please provide a short, engaging opening statement (maximum 3 sentences) welcoming the user, stating your position, and inviting their first argument.
Use **Markdown formatting** to slightly structure your response (e.g. bolding key terms or the topic) to make it look clean and visually appealing.`;
            
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (err) {
    console.error("Gemini Error:", err);
    throw err;
  }
}

export async function getAIReply(userMessage, topic, userPosition, difficulty) {
  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey === "dummy_key_if_none_exists") {
    throw new Error("Invalid or missing API key.");
  }
  
  try {
     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
     const aiPosition = userPosition === 'for' ? 'against' : 'for'
     const prompt = `You are an AI debate opponent. 
The topic is: "${topic}". 
The user is arguing: "${userPosition.toUpperCase()}". 
You must argue: "${aiPosition.toUpperCase()}". 
Difficulty: ${difficulty}. 

The user just argued: "${userMessage}"

Respond thoughtfully and concisely (maximum 4 sentences). End with a clarifying or challenging question.
Use **Markdown format** exclusively. Use bullet points if making multiple distinct points, or bold key phrases to make your response highly structured and easy to read.`
     
     const result = await model.generateContent(prompt)
     return result.response.text()
  } catch (err) {
     console.error("Gemini Error:", err);
     throw err;
  }
}
