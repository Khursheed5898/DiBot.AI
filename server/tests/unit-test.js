import { getAIReply, getAIOpening } from '../services/aiService.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function testUnit() {
  console.log('🧪 RUNNING AI UNIT TESTS...\n');

  // Test 1: AI Prompt Generation
  try {
    console.log('🔹 Testing getAIOpening...');
    const result = await getAIOpening('Climate Change', 'for', 'easy');
    if (result && result.length > 10) {
      console.log('✅ getAIOpening: PASSED');
    } else {
      console.log('❌ getAIOpening: FAILED (Empty response)');
    }
  } catch (e) {
    console.log('❌ getAIOpening: ERROR ->', e.message);
  }

  // Test 2: AI Interaction Logic
  try {
    console.log('\n🔹 Testing getAIReply...');
    const result = await getAIReply('Why is the sky blue?', 'Science', 'against', 'medium', []);
    if (result && result.includes('###')) {
      console.log('✅ getAIReply: PASSED (Markdown Structure found)');
    } else {
      console.log('❌ getAIReply: FAILED (Missing Markdown Structure)');
    }
  } catch (e) {
    console.log('❌ getAIReply: ERROR ->', e.message);
  }

  console.log('\n🏁 UNIT TESTS FINISHED.');
}

testUnit();
