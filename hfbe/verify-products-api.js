// Test script for products API with explicit console output
const http = require('http');

console.log('Testing products API endpoint...');

// Create a request object
const request = http.request(
  {
    host: 'localhost',
    port: 5000,
    path: '/api/products?limit=2',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  (response) => {
    console.log(`STATUS: ${response.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
    
    // Set encoding to utf8 so that we get strings instead of buffers
    response.setEncoding('utf8');
    
    let responseData = '';
    
    // Collect response data as it arrives
    response.on('data', (chunk) => {
      console.log(`BODY CHUNK RECEIVED: ${chunk.length} bytes`);
      responseData += chunk;
    });
    
    // Process the complete response
    response.on('end', () => {
      console.log('RESPONSE COMPLETE');
      
      try {
        // Try to parse the response as JSON
        const parsedData = JSON.parse(responseData);
        console.log('RESPONSE SUCCESSFULLY PARSED AS JSON');
        
        // Check if the response contains products
        if (parsedData.products && Array.isArray(parsedData.products)) {
          console.log(`SUCCESS! Found ${parsedData.products.length} products`);
          
          // If there are products, show some details of the first one
          if (parsedData.products.length > 0) {
            const firstProduct = parsedData.products[0];
            console.log(`First product name: ${firstProduct.name}`);
            console.log(`First product price: ${firstProduct.price}`);
            console.log(`First product category: ${firstProduct.categoryId ? 
              (firstProduct.categoryId.name || 'Category ID present but no name') : 'No category'}`);
          }
        } else {
          console.log('No products found in the response');
        }
      } catch (error) {
        console.error(`Error parsing response: ${error.message}`);
        console.log(`Raw response: ${responseData.substring(0, 500)}...`);
      }
    });
  }
);

// Handle request errors
request.on('error', (e) => {
  console.error(`REQUEST ERROR: ${e.message}`);
});

// Set a timeout for the request
request.setTimeout(10000, () => {
  console.log('Request timed out after 10 seconds');
  request.destroy();
});

// Send the request
request.end();
console.log('Request sent, waiting for response...');
