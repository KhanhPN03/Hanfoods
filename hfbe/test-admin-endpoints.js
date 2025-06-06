const http = require('http');
const https = require('https');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function testAdminEndpoints() {
  try {
    // First login to get token
    console.log('1. Testing login...');
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const loginResponse = await makeRequest(loginOptions, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    console.log('Login response:', loginResponse);
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.token;
      
      // Test dashboard stats
      console.log('\n2. Testing dashboard stats...');
      const statsOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/dashboard/stats',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const statsResponse = await makeRequest(statsOptions);
      console.log('Dashboard stats response:', statsResponse);
      
      // Test recent orders
      console.log('\n3. Testing recent orders...');
      const ordersOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/dashboard/recent-orders',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const ordersResponse = await makeRequest(ordersOptions);
      console.log('Recent orders response:', ordersResponse);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAdminEndpoints();
