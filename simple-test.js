// Simple admin test
const axios = require('axios');

async function quickTest() {
  try {
    console.log('Testing basic connectivity...');
    const response = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
    console.log('✅ Health check:', response.data);
    
    console.log('\nTesting auth endpoint...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@test.com',
      password: 'wrongpassword'
    }, { timeout: 5000 });
    
  } catch (error) {
    if (error.response) {
      console.log('Auth endpoint response:', error.response.status, error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

quickTest();
