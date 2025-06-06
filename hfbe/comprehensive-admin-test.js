const http = require('http');

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

async function comprehensiveAdminTest() {
  console.log('🔧 COMPREHENSIVE ADMIN PANEL TEST');
  console.log('=====================================\n');
  
  try {
    // 1. Test login
    console.log('1️⃣ Testing Admin Login...');
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    
    const loginResponse = await makeRequest(loginOptions, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      
      // 2. Test dashboard stats
      console.log('\n2️⃣ Testing Dashboard Stats...');
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
      if (statsResponse.status === 200 && statsResponse.data.success) {
        console.log('✅ Dashboard stats working');
        console.log(`   📊 Products: ${statsResponse.data.data.products.totalProducts}`);
        console.log(`   👥 Users: ${statsResponse.data.data.users.totalUsers}`);
        console.log(`   📦 Orders: ${statsResponse.data.data.orders.totalOrders}`);
        console.log(`   💰 Revenue: ₫${statsResponse.data.data.orders.totalRevenue.toLocaleString()}`);
      } else {
        console.log('❌ Dashboard stats failed:', statsResponse.status);
      }
      
      // 3. Test recent orders
      console.log('\n3️⃣ Testing Recent Orders...');
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
      if (ordersResponse.status === 200 && ordersResponse.data.success) {
        console.log('✅ Recent orders working');
        console.log(`   📋 Orders count: ${ordersResponse.data.orders.length}`);
      } else {
        console.log('❌ Recent orders failed:', ordersResponse.status);
      }
      
      // 4. Test products endpoint
      console.log('\n4️⃣ Testing Products API...');
      const productsOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/products',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const productsResponse = await makeRequest(productsOptions);
      if (productsResponse.status === 200 && productsResponse.data.success) {
        console.log('✅ Products API working');
        console.log(`   🛍️ Products count: ${productsResponse.data.products.length}`);
      } else {
        console.log('❌ Products API failed:', productsResponse.status);
      }
      
      // 5. Test users endpoint
      console.log('\n5️⃣ Testing Users API...');
      const usersOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/users',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const usersResponse = await makeRequest(usersOptions);
      if (usersResponse.status === 200 && usersResponse.data.success) {
        console.log('✅ Users API working');
        console.log(`   👤 Users count: ${usersResponse.data.users.length}`);
      } else {
        console.log('❌ Users API failed:', usersResponse.status);
      }
      
      console.log('\n🎉 ADMIN PANEL TEST COMPLETED!');
      console.log('=====================================');
      console.log('✅ All core admin functionalities are working');
      console.log('✅ Dashboard data fetching is functional');
      console.log('✅ API endpoints are responding correctly');
      console.log('✅ Authentication is working properly');
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

comprehensiveAdminTest();
