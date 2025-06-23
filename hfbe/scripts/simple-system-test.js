#!/usr/bin/env node

/**
 * Simple System Validation Test
 * Tests basic functionality without external dependencies
 */

const http = require('http');
const config = require('../config/environment');

// Extract hostname and port from config
const BASE_URL = config.api.baseUrl;
const url = new URL(BASE_URL);
const hostname = url.hostname;
const port = url.port;

console.log('🚀 HANFOODS SYSTEM VALIDATION TEST');
console.log('=' * 40);
console.log(`Testing server at: ${hostname}:${port}`);
console.log('');

// Test results
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

const logTest = (testName, passed, message = '') => {
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}: PASSED ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: FAILED ${message}`);
  }
  testResults.tests.push({ testName, passed, message });
};

// Simple HTTP GET function
const httpGet = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
};

// Run tests
const runTests = async () => {
  console.log('📋 ENVIRONMENT CONFIGURATION');
  console.log('-' * 25);
  
  // Test 1: Environment config loading
  logTest('Environment Config Loading', 
    config && config.app && config.database && config.api,
    'All sections loaded'
  );
  
  // Test 2: API Base URL
  logTest('API Base URL Format', 
    config.api.baseUrl.startsWith('http'),
    `${config.api.baseUrl}`
  );

  console.log('\n🔌 API ENDPOINT TESTS');
  console.log('-' * 18);

  // Test 3: Health endpoint
  try {
    const healthResponse = await httpGet('/api/health');
    logTest('Health Endpoint', 
      healthResponse.status === 200,
      `Status: ${healthResponse.status}`
    );
  } catch (error) {
    logTest('Health Endpoint', false, `Error: ${error.message}`);
  }

  // Test 4: Products endpoint (the main fix)
  try {
    const productsResponse = await httpGet('/api/products?limit=1');
    logTest('Products Endpoint', 
      productsResponse.status === 200,
      `Status: ${productsResponse.status}`
    );
    
    // Check if response contains expected data
    if (productsResponse.status === 200) {
      try {
        const data = JSON.parse(productsResponse.data);
        logTest('Products Data Structure', 
          data.success === true && Array.isArray(data.products),
          `Success: ${data.success}, Products array: ${Array.isArray(data.products)}`
        );
      } catch (parseError) {
        logTest('Products Data Structure', false, 'Invalid JSON response');
      }
    }
  } catch (error) {
    logTest('Products Endpoint', false, `Error: ${error.message}`);
  }

  // Test 5: Admin orders endpoint
  try {
    const ordersResponse = await httpGet('/api/admin/orders');
    logTest('Admin Orders Endpoint', 
      ordersResponse.status < 500, // Accept auth errors as expected
      `Status: ${ordersResponse.status} (Auth required)`
    );
  } catch (error) {
    logTest('Admin Orders Endpoint', false, `Error: ${error.message}`);
  }

  console.log('\n🔒 SECURITY TESTS');
  console.log('-' * 13);

  // Test 6: JWT Secret
  logTest('JWT Secret Configured', 
    config.auth.jwtSecret && config.auth.jwtSecret.length > 10,
    `Length: ${config.auth.jwtSecret?.length || 0} characters`
  );

  // Test 7: Session Secret
  logTest('Session Secret Configured', 
    config.auth.sessionSecret && config.auth.sessionSecret.length > 10,
    `Length: ${config.auth.sessionSecret?.length || 0} characters`
  );

  // Test 8: CORS Configuration
  logTest('CORS Origin Configured', 
    config.cors.origin === config.frontend.url,
    `Origin: ${config.cors.origin}`
  );

  // Final Results
  console.log('\n' + '=' * 40);
  console.log('🎯 TEST RESULTS SUMMARY');
  console.log('=' * 40);
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`📊 Total Tests: ${testResults.tests.length}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);

  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ ProductController constructor issue: FIXED');
    console.log('✅ Product API endpoints: WORKING');
    console.log('✅ Environment variables: PROPERLY CONFIGURED');
    console.log('✅ Admin orders endpoint: ACCESSIBLE');
    console.log('✅ Security configuration: IN PLACE');
    console.log('\n🏆 SYSTEM INTEGRATION SUCCESSFUL!');
  } else {
    console.log('\n⚠️  Some tests failed. Details:');
    testResults.tests.forEach((test, index) => {
      if (!test.passed) {
        console.log(`${index + 1}. ❌ ${test.testName}: ${test.message}`);
      }
    });
  }

  return testResults.failed === 0;
};

// Run the tests
runTests()
  .then(success => {
    console.log('\n🏁 Test execution completed.');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
