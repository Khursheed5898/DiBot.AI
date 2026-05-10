import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 STARTING MANUAL SYSTEM AUDIT...\n');

  // 1. Health Check
  try {
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ BACKEND STATUS: Online');
  } catch (e) {
    console.log('❌ BACKEND STATUS: Offline (Is the server running?)');
    return;
  }

  // 2. AI Debate Opening Test
  try {
    console.log('⏳ Testing AI Debate Opening...');
    const res = await axios.post(`${BASE_URL}/debate/start`, {
      topic: 'Space Exploration',
      position: 'for',
      difficulty: 'easy'
    });
    console.log('✅ AI RESPONSE SUCCESS');
    console.log('--- AI OPENING PREVIEW ---');
    console.log(res.data.opening.substring(0, 150) + '...');
    console.log('--------------------------\n');
  } catch (e) {
    console.log('❌ AI DEBATE ERROR:', e.response?.data?.error || e.message);
  }

  // 3. AI Performance Analysis Test
  try {
    console.log('⏳ Testing AI Analysis Logic...');
    const res = await axios.post(`${BASE_URL}/debate/end`, {
      topic: 'Space Exploration',
      difficulty: 'easy',
      history: [
        { role: 'user', content: 'We should go to Mars because it is cool.' },
        { role: 'ai', content: 'That is a weak argument. We need scientific goals.' }
      ]
    });
    console.log('✅ ANALYSIS SUCCESS');
    console.log('📊 Overall Score:', res.data.analysis.overallScore);
    console.log('📝 Feedback:', res.data.analysis.feedback);
  } catch (e) {
    console.log('❌ ANALYSIS ERROR:', e.response?.data?.error || e.message);
  }

  console.log('\n🏁 AUDIT COMPLETE.');
}

runTests();
