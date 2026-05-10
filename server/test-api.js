import axios from 'axios';

async function test() {
  try {
    const response = await axios.post('http://localhost:5000/api/debate/start', {
      topic: 'AI in Education',
      position: 'for',
      difficulty: 'easy'
    });
    console.log('SUCCESS:', response.data);
  } catch (error) {
    console.log('STATUS:', error.response?.status);
    console.log('ERROR DATA:', JSON.stringify(error.response?.data, null, 2));
    console.log('MESSAGE:', error.message);
  }
}

test();
