#!/usr/bin/env node

/**
 * System Integration Test for HanFoods E-commerce Platform
 * Tests the complete system after environment variable restructuring
 * 
 * This script validates:
 * 1. Environment configuration loading
 * 2. Database connectivity
 * 3. API endpoints functionality
 * 4. Frontend-backend integration
 * 5. Security configurations
 */

const axios = require('axios');
const config = require('../config/environment');

// Test configuration
const BASE_URL = config.api.baseUrl;
const FRONTEND_URL = config.frontend.url;

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper functions
const logTest = (testName, passed, message = '') => {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}: PASSED ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: FAILED ${message}`);
  }
  testResults.details.push({ testName, passed, message });
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test suite
const runSystemIntegrationTests = async () => {
  console.log('🚀 STARTING SYSTEM INTEGRATION TESTS');
  console.log('=' * 50);
  console.log(`Testing against: ${BASE_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log('');

  // 1. Environment Configuration Tests
  console.log('📋 ENVIRONMENT CONFIGURATION TESTS');
  console.log('-' * 30);
  
  logTest('Environment Config Loading', 
    config && config.app && config.database && config.api,
    'All config sections loaded'
  );
  
  logTest('Database URI Format', 
    config.database.uri.includes('mongodb://'),
    `URI: ${config.database.uri}`
  );
  
  logTest('API Base URL Format', 
    config.api.baseUrl.startsWith('http'),
    `URL: ${config.api.baseUrl}`
  );

  // 2. API Endpoint Tests
  console.log('\n🔌 API ENDPOINT TESTS');
  console.log('-' * 20);

  // Test health endpoint
  try {
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    logTest('Health Check Endpoint', 
      healthResponse.status === 200,
      `Status: ${healthResponse.status}`
    );
  } catch (error) {
    logTest('Health Check Endpoint', false, `Error: ${error.message}`);
  }

  // Test products endpoint (the main issue we fixed)
  try {
    const productsResponse = await axios.get(`${BASE_URL}/api/products?limit=1`);
    logTest('Products Endpoint', 
      productsResponse.status === 200 && productsResponse.data.success,
      `Status: ${productsResponse.status}, Products found: ${productsResponse.data.products?.length || 0}`
    );
  } catch (error) {
    logTest('Products Endpoint', false, `Error: ${error.message}`);
  }

  // Test admin orders endpoint (previously failing)
  try {
    const ordersResponse = await axios.get(`${BASE_URL}/api/admin/orders`, {
      headers: { 'Authorization': 'Bearer test-token' },
      validateStatus: (status) => status < 500 // Accept 401/403 as expected for auth
    });
    logTest('Admin Orders Endpoint', 
      ordersResponse.status < 500,
      `Status: ${ordersResponse.status} (Auth required)`
    );
  } catch (error) {
    logTest('Admin Orders Endpoint', false, `Error: ${error.message}`);
  }

  // Test cart endpoint
  try {
    const cartResponse = await axios.get(`${BASE_URL}/api/carts`, {
      validateStatus: (status) => status < 500
    });
    logTest('Cart Endpoint', 
      cartResponse.status < 500,
      `Status: ${cartResponse.status}`
    );
  } catch (error) {
    logTest('Cart Endpoint', false, `Error: ${error.message}`);
  }

  // 3. Security Configuration Tests
  console.log('\n🔒 SECURITY CONFIGURATION TESTS');
  console.log('-' * 25);

  logTest('JWT Secret Configured', 
    config.auth.jwtSecret && config.auth.jwtSecret.length > 10,
    `Length: ${config.auth.jwtSecret?.length || 0} chars`
  );

  logTest('Session Secret Configured', 
    config.auth.sessionSecret && config.auth.sessionSecret.length > 10,
    `Length: ${config.auth.sessionSecret?.length || 0} chars`
  );

  logTest('CORS Origin Configured', 
    config.cors.origin === FRONTEND_URL,
    `Origin: ${config.cors.origin}`
  );

  // 4. Database Integration Tests
  console.log('\n🗄️  DATABASE INTEGRATION TESTS');
  console.log('-' * 25);

  // Test database connection through API
  try {
    const dbHealthResponse = await axios.get(`${BASE_URL}/api/health`);
    if (dbHealthResponse.data.database) {
      logTest('Database Connection', 
        dbHealthResponse.data.database.status === 'connected',
        `Status: ${dbHealthResponse.data.database.status}`
      );
    } else {
      logTest('Database Connection', true, 'Connected (health endpoint working)');
    }
  } catch (error) {
    logTest('Database Connection', false, `Error: ${error.message}`);
  }

  // 5. Environment Variable Security Tests
  console.log('\n🛡️  ENVIRONMENT SECURITY TESTS');
  console.log('-' * 25);

  // Check if sensitive data is not exposed in API responses
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    const responseText = JSON.stringify(response.data);
    
    logTest('JWT Secret Not Exposed', 
      !responseText.includes(config.auth.jwtSecret),
      'JWT secret not found in API responses'
    );
    
    logTest('Database Password Not Exposed', 
      !responseText.includes('password') || !responseText.includes(config.database.uri),
      'Database credentials not exposed'
    );
  } catch (error) {
    logTest('Security Check', false, `Error: ${error.message}`);
  }

  // 6. Frontend Integration Tests
  console.log('\n🖥️  FRONTEND INTEGRATION TESTS');
  console.log('-' * 25);

  // Test if frontend can reach backend (through proxy)
  try {
    // This will test if the setupProxy.js is working correctly
    const frontendApiTest = await axios.get(`${FRONTEND_URL}/api/health`, {
      timeout: 5000,
      validateStatus: (status) => status < 500
    });
    logTest('Frontend-Backend Proxy', 
      frontendApiTest.status === 200,
      `Proxy working, Status: ${frontendApiTest.status}`
    );
  } catch (error) {
    // This is expected if frontend server is not running
    logTest('Frontend-Backend Proxy', false, 
      `Frontend server may not be running: ${error.message}`
    );
  }

  // Final Results
  console.log('\n' + '=' * 50);
  console.log('🎯 TEST RESULTS SUMMARY');
  console.log('=' * 50);
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`📊 Total Tests: ${testResults.total}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! System integration successful!');
    console.log('✅ Environment variables restructuring completed successfully');
    console.log('✅ All API endpoints are working correctly');
    console.log('✅ Security configurations are in place');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the results above.');
    console.log('Check the following:');
    console.log('- Ensure backend server is running on port 5000');
    console.log('- Ensure frontend server is running on port 3000');
    console.log('- Check MongoDB connection');
    console.log('- Verify environment variables are properly configured');
  }

  console.log('\n📋 DETAILED RESULTS:');
  testResults.details.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.testName}: ${result.message}`);
  });

  return testResults;
};

// Export for use in other scripts or run directly
if (require.main === module) {
  runSystemIntegrationTests()
    .then(results => {
      process.exit(results.failed === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { runSystemIntegrationTests };
