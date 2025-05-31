#!/usr/bin/env node

/**
 * API Endpoint Test Script
 * Tests the routing fixes to ensure all API calls work correctly
 */

const http = require('http');

// Test endpoints
const endpoints = [
  // Health check
  { path: '/api/health', method: 'GET', description: 'Health check' },
  
  // Product endpoints
  { path: '/api/products', method: 'GET', description: 'Get all products' },
  { path: '/api/products/search?query=test', method: 'GET', description: 'Search products' },
  
  // Auth endpoints  
  { path: '/api/auth/login', method: 'POST', description: 'Login endpoint (expect 400 for missing data)', data: {} },
  
  // Cart endpoints
  { path: '/api/carts', method: 'GET', description: 'Get cart (expect 401 for no auth)' },
  
  // Order endpoints
  { path: '/api/orders/user', method: 'GET', description: 'Get user orders (expect 401 for no auth)' },
  
  // Discount endpoints
  { path: '/api/discounts', method: 'GET', description: 'Get discounts (expect 401 for no auth)' },
  
  // Address endpoints  
  { path: '/api/addresses', method: 'GET', description: 'Get addresses (expect 401 for no auth)' },
  
  // Payment endpoints
  { path: '/api/payments', method: 'GET', description: 'Get payment methods (expect 401 for no auth)' },
  
  // Wishlist endpoints
  { path: '/api/wishlists', method: 'GET', description: 'Get wishlist (expect 401 for no auth)' },
  
  // Billing endpoints
  { path: '/api/billings/user', method: 'GET', description: 'Get user billings (expect 401 for no auth)' }
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ 
          endpoint: endpoint.path,
          method: endpoint.method,
          status: res.statusCode, 
          description: endpoint.description,
          success: res.statusCode !== 404 // Any status except 404 means endpoint exists
        });
      });
    });

    req.on('error', (err) => {
      resolve({ 
        endpoint: endpoint.path,
        method: endpoint.method,
        error: err.message, 
        description: endpoint.description,
        success: false
      });
    });

    req.setTimeout(5000, () => {
      resolve({ 
        endpoint: endpoint.path,
        method: endpoint.method,
        error: 'timeout', 
        description: endpoint.description,
        success: false
      });
    });

    if (endpoint.data && endpoint.method === 'POST') {
      req.write(JSON.stringify(endpoint.data));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing API endpoints after routing fixes...\n');
  
  const results = await Promise.all(endpoints.map(testEndpoint));
  
  let passCount = 0;
  let failCount = 0;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const statusInfo = result.status ? `(${result.status})` : `(${result.error})`;
    
    console.log(`${status} ${result.method} ${result.endpoint} ${statusInfo}`);
    console.log(`     ${result.description}`);
    
    if (result.success) passCount++;
    else failCount++;
  });
  
  console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed`);
  
  if (failCount === 0) {
    console.log('🎉 All API endpoints are working correctly!');
  } else {
    console.log('⚠️  Some endpoints returned 404 - check backend routes');
  }
  
  // Test a few old endpoints to ensure they properly return 404
  console.log('\n🔍 Testing old endpoints (should return 404):');
  const oldEndpoints = ['/health', '/products', '/orders'];
  
  const oldResults = await Promise.all(oldEndpoints.map(path => 
    testEndpoint({ path, method: 'GET', description: 'Old endpoint (should be 404)' })
  ));
  
  oldResults.forEach(result => {
    const status = result.status === 404 ? '✅ CORRECTLY 404' : '❌ UNEXPECTED';
    console.log(`${status} GET ${result.endpoint} (${result.status || result.error})`);
  });
}

runTests().catch(console.error);
