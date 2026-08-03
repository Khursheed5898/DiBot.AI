import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import Groq from 'groq-sdk';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

async function runTests() {
  console.log(`\n${colors.bright}${colors.magenta}=== DiBot.AI SYSTEM COMPREHENSIVE TEST ===${colors.reset}\n`);

  // 1. Check Env Variables
  console.log(`${colors.cyan}[1/4] Checking Environment Variables...${colors.reset}`);
  const requiredEnv = ['MONGODB_URI', 'GROQ_API_KEY', 'JWT_SECRET'];
  let envPass = true;
  requiredEnv.forEach(env => {
    if (process.env[env]) {
      console.log(`   ${colors.green}✓${colors.reset} ${env} is set`);
    } else {
      console.log(`   ${colors.red}✗${colors.reset} ${env} is MISSING`);
      envPass = false;
    }
  });

  // 2. Test Database
  console.log(`\n${colors.cyan}[2/4] Testing Database Connectivity...${colors.reset}`);
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`   ${colors.green}✓${colors.reset} Connected to MongoDB successfully`);
    await mongoose.disconnect();
  } catch (err) {
    console.log(`   ${colors.red}✗${colors.reset} MongoDB Connection FAILED: ${err.message}`);
  }

  // 3. Test Groq AI
  const testModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  console.log(`\n${colors.cyan}[3/4] Testing Groq AI Integration (${testModel})...${colors.reset}`);
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say 'Groq Online'" }],
      model: testModel,
    });
    const text = completion.choices[0]?.message?.content || "";
    console.log(`   ${colors.green}✓${colors.reset} Groq API Response: ${colors.yellow}"${text.trim()}"${colors.reset}`);
  } catch (err) {
    console.log(`   ${colors.red}✗${colors.reset} Groq API FAILED: ${err.message}`);
  }

  // 4. Test Local Server
  console.log(`\n${colors.cyan}[4/4] Testing Backend Server Health...${colors.reset}`);
  try {
    const response = await axios.get('http://localhost:5000/api/health').catch(() => null);
    if (response) {
      console.log(`   ${colors.green}✓${colors.reset} Server is running on port 5000`);
    } else {
      console.log(`   ${colors.yellow}!${colors.reset} Server not detected on port 5000 (Ensure 'npm run server' is active)`);
    }
  } catch (err) {
    console.log(`   ${colors.yellow}!${colors.reset} Server check skipped`);
  }

  console.log(`\n${colors.bright}${colors.magenta}=== ALL TESTS COMPLETED ===${colors.reset}\n`);
}

runTests();
