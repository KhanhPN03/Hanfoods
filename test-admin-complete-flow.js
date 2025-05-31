#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

console.log('🚀 Testing Complete Admin Flow...\n');

async function testCompleteAdminFlow() {
  try {
    // Step 1: Test basic API connectivity
    console.log('1️⃣ Testing API connectivity...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log(`✅ Health check: ${healthResponse.status} - ${healthResponse.data.message}`);
    
    // Step 2: Register an admin user
    console.log('\n2️⃣ Creating admin account...');
    const adminData = {
      email: 'admin@hanfoods.com',
      password: 'Admin123!',
      firstname: 'Admin',
      lastname: 'User',
      phone: '0123456789',
      role: 'admin'  // Note: This might be ignored if role assignment is restricted
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, adminData);
      console.log(`✅ Admin registered: ${registerResponse.status}`);
      console.log(`   User ID: ${registerResponse.data.user._id}`);
      console.log(`   Role: ${registerResponse.data.user.role || 'customer (default)'}`);
    } catch (regError) {
      if (regError.response?.status === 400 && regError.response?.data?.message?.includes('exists')) {
        console.log(`ℹ️  Admin account already exists`);
      } else {
        console.log(`❌ Registration failed: ${regError.response?.data?.message || regError.message}`);
      }
    }
    
    // Step 3: Test admin login
    console.log('\n3️⃣ Testing admin login...');
    const loginData = {
      email: 'admin@hanfoods.com',
      password: 'Admin123!'
    };
    
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
      console.log(`✅ Login successful: ${loginResponse.status}`);
      console.log(`   Token received: ${loginResponse.data.token ? 'YES' : 'NO'}`);
      console.log(`   User role: ${loginResponse.data.user.role}`);
      console.log(`   User name: ${loginResponse.data.user.firstname} ${loginResponse.data.user.lastname}`);
      
      if (loginResponse.data.user.role !== 'admin') {
        console.log(`⚠️  WARNING: User role is '${loginResponse.data.user.role}', not 'admin'`);
        console.log(`   Admin panel access will be denied`);
      }
      
      const adminToken = loginResponse.data.token;
      
      // Step 4: Test admin API endpoints
      console.log('\n4️⃣ Testing admin-protected endpoints...');
      const authHeaders = { 'Authorization': `Bearer ${adminToken}` };
      
      // Test product stats
      try {
        const productStatsResponse = await axios.get(`${API_BASE}/products/admin/stats`, { headers: authHeaders });
        console.log(`✅ Product stats: ${productStatsResponse.status}`);
      } catch (error) {
        console.log(`❌ Product stats failed: ${error.response?.status} - ${error.response?.data?.message}`);
      }
      
      // Test order stats  
      try {
        const orderStatsResponse = await axios.get(`${API_BASE}/orders/admin/stats`, { headers: authHeaders });
        console.log(`✅ Order stats: ${orderStatsResponse.status}`);
      } catch (error) {
        console.log(`❌ Order stats failed: ${error.response?.status} - ${error.response?.data?.message}`);
      }
      
    } catch (loginError) {
      console.log(`❌ Login failed: ${loginError.response?.status} - ${loginError.response?.data?.message}`);
      return;
    }
    
    // Step 5: Test alternative admin credentials
    console.log('\n5️⃣ Testing alternative admin credentials...');
    const altCredentials = [
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'admin@localhost', password: 'password' },
      { email: 'test@admin.com', password: 'test123' }
    ];
    
    for (const cred of altCredentials) {
      try {
        const response = await axios.post(`${API_BASE}/auth/login`, cred);
        if (response.data.user.role === 'admin') {
          console.log(`✅ Alternative admin found: ${cred.email} (role: ${response.data.user.role})`);
        }
      } catch (error) {
        // Silent fail for credential testing
      }
    }
    
    console.log('\n🎉 Admin flow test completed!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCompleteAdminFlow();
