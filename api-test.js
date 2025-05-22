// Simple test script to check if the backend API is running
const axios = require('axios');

async function testProductsAPI() {
  console.log('Testing products API...');
  const apiUrl = 'http://localhost:5000/api/products';
  
  try {
    console.log(`Making GET request to: ${apiUrl}`);
    const response = await axios.get(apiUrl, {
      params: {
        limit: 2
      },
      timeout: 5000
    });
    
    console.log(`Status code: ${response.status}`);
    console.log(`Status text: ${response.statusText}`);
    
    if (response.data && response.data.products) {
      console.log(`Products found: ${response.data.products.length}`);
      if (response.data.products.length > 0) {
        console.log('First product:');
        console.log(JSON.stringify(response.data.products[0], null, 2));
      }
      console.log('API is working correctly!');
    } else {
      console.log('API response does not contain products array:', response.data);
    }
  } catch (error) {
    console.error('Error testing products API:');
    if (error.response) {
      // The request was made and the server responded with a status outside the 2xx range
      console.error(`Status: ${error.response.status}`);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received, server might not be running');
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
  }
}

testProductsAPI();
