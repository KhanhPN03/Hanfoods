// Final comprehensive test of the API connection from frontend to backend
const axios = require('axios');
const fs = require('fs');

// Set up logging
const logFile = 'comprehensive-api-test.log';
fs.writeFileSync(logFile, `=== API Test Started at ${new Date().toISOString()} ===\n\n`, 'utf8');

function log(message) {
  const formatted = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
  console.log(formatted);
  fs.appendFileSync(logFile, formatted + '\n', 'utf8');
}

async function testAPI() {
  const API_URL = 'http://localhost:5000/api';
  log(`Testing API at ${API_URL}`);
  
  try {
    // Test health endpoint first
    log('\n--- Testing health endpoint ---');
    try {
      const healthResponse = await axios.get(`${API_URL}/health`);
      log(`Health endpoint status: ${healthResponse.status}`);
      log(`Health data: ${JSON.stringify(healthResponse.data, null, 2)}`);
    } catch (healthError) {
      log(`Error checking health endpoint: ${healthError.message}`);
    }
    
    // Test products endpoint
    log('\n--- Testing products endpoint ---');
    try {
      const productsResponse = await axios.get(`${API_URL}/products`, {
        params: {
          limit: 4,
          sortBy: 'createdAt',
          order: 'desc'
        }
      });
      
      log(`Products endpoint status: ${productsResponse.status}`);
      
      if (productsResponse.data && productsResponse.data.products) {
        log(`Found ${productsResponse.data.products.length} products`);
        
        if (productsResponse.data.products.length > 0) {
          const sample = productsResponse.data.products[0];
          log('Sample product:');
          log({
            id: sample._id,
            name: sample.name,
            price: sample.price,
            category: sample.categoryId ? sample.categoryId.name : 'N/A'
          });
        }
      } else {
        log('No products found or invalid response structure');
        log(productsResponse.data);
      }
    } catch (productsError) {
      log(`Error fetching products: ${productsError.message}`);
      if (productsError.response) {
        log(`Status: ${productsError.response.status}`);
        log(`Error response: ${JSON.stringify(productsError.response.data, null, 2)}`);
      }
    }
    
    // Try to match the exact behavior of the ProductShowcase component
    log('\n--- Testing ProductShowcase behavior ---');
    try {
      // Create same axios client as in apiService.js
      const apiClient = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        timeout: 8000
      });
      
      // Add the same interceptors as in apiService.js
      apiClient.interceptors.request.use(
        (config) => {
          log(`API Request [${config.method}]: ${config.url}`);
          return config;
        },
        (error) => {
          log(`API Request Error: ${error.message}`);
          return Promise.reject(error);
        }
      );
      
      // Make the exact same request as in ProductShowcase
      const response = await apiClient.get('/products', {
        params: {
          limit: 8,
          sortBy: 'createdAt',
          order: 'desc'
        }
      });
      
      log(`Response status: ${response.status}`);
      
      if (response.data && response.data.products && response.data.products.length > 0) {
        log(`Found ${response.data.products.length} products - THIS IS WORKING CORRECTLY`);
      } else {
        log('No products found or invalid response structure');
        log(response.data);
      }
    } catch (componentError) {
      log(`Error in component simulation: ${componentError.message}`);
    }
    
    log('\n=== Tests complete ===');
  } catch (error) {
    log(`Unhandled error: ${error.message}`);
  }
}

// Run the test
testAPI();
