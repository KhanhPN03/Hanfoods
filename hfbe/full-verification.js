// Comprehensive verification script that logs to file
const fs = require('fs');
const http = require('http');
const { execSync } = require('child_process');

// Set up logging
const logFile = './verification-results.log';
fs.writeFileSync(logFile, `Verification started at ${new Date().toISOString()}\n\n`, 'utf8');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(message); // Also log to console
  fs.appendFileSync(logFile, logMessage, 'utf8');
}

async function runCommand(command) {
  log(`Running command: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    log(`Command output:\n${output}`);
    return output;
  } catch (error) {
    log(`Command error: ${error.message}`);
    if (error.stdout) log(`Command stdout: ${error.stdout}`);
    if (error.stderr) log(`Command stderr: ${error.stderr}`);
    return null;
  }
}

async function testProductsAPI() {
  return new Promise((resolve, reject) => {
    log('Testing products API endpoint...');

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
        log(`STATUS: ${response.statusCode}`);
        log(`HEADERS: ${JSON.stringify(response.headers)}`);
        
        // Set encoding to utf8 so that we get strings instead of buffers
        response.setEncoding('utf8');
        
        let responseData = '';
        
        // Collect response data as it arrives
        response.on('data', (chunk) => {
          log(`BODY CHUNK RECEIVED: ${chunk.length} bytes`);
          responseData += chunk;
        });
        
        // Process the complete response
        response.on('end', () => {
          log('RESPONSE COMPLETE');
          
          try {
            // Try to parse the response as JSON
            const parsedData = JSON.parse(responseData);
            log('RESPONSE SUCCESSFULLY PARSED AS JSON');
            
            // Check if the response contains products
            if (parsedData.products && Array.isArray(parsedData.products)) {
              log(`SUCCESS! Found ${parsedData.products.length} products`);
              
              // If there are products, show some details of the first one
              if (parsedData.products.length > 0) {
                const firstProduct = parsedData.products[0];
                log(`First product name: ${firstProduct.name}`);
                log(`First product price: ${firstProduct.price}`);
                log(`First product category: ${firstProduct.categoryId ? 
                  (firstProduct.categoryId.name || 'Category ID present but no name') : 'No category'}`);
              }
              
              resolve(true);
            } else {
              log('No products found in the response');
              resolve(false);
            }
          } catch (error) {
            log(`Error parsing response: ${error.message}`);
            log(`Raw response: ${responseData.substring(0, 500)}...`);
            reject(error);
          }
        });
      }
    );

    // Handle request errors
    request.on('error', (e) => {
      log(`REQUEST ERROR: ${e.message}`);
      reject(e);
    });

    // Set a timeout for the request
    request.setTimeout(10000, () => {
      log('Request timed out after 10 seconds');
      request.destroy();
      reject(new Error('Request timeout'));
    });

    // Send the request
    request.end();
    log('Request sent, waiting for response...');
  });
}

async function main() {
  try {
    log('Starting verification process');
    
    // Check if server is running
    log('Checking if server is running...');
    try {
      const checkServer = await testProductsAPI();
      if (checkServer) {
        log('Server is running and responding to API requests correctly!');
      } else {
        log('Server is running but not returning products correctly');
      }
    } catch (error) {
      log(`Error connecting to server: ${error.message}`);
      log('Starting server...');
      
      // Try to start server
      runCommand('start cmd /k "cd /d d:\\Hang_ngoo\\web\\hfbe && node app.js"');
      
      // Wait for server to start
      log('Waiting 5 seconds for server to start...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Test again
      try {
        const serverStarted = await testProductsAPI();
        if (serverStarted) {
          log('Server started successfully and API is working!');
        } else {
          log('Server started but API is not working correctly');
        }
      } catch (startError) {
        log(`Failed to connect after starting server: ${startError.message}`);
      }
    }
    
    log('Verification process completed');
  } catch (error) {
    log(`Verification failed: ${error.message}`);
  }
}

main();
