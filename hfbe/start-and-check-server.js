// Start backend server and verify it's working
const { exec } = require('child_process');
const http = require('http');

console.log('Starting backend server...');

// Start the server
const server = exec('node app.js', { 
  cwd: __dirname,
  env: { ...process.env }
});

server.stdout.on('data', (data) => {
  console.log(`Server stdout: ${data.trim()}`);
});

server.stderr.on('data', (data) => {
  console.error(`Server stderr: ${data.trim()}`);
});

// Wait for server to start up
setTimeout(() => {
  console.log('\nTesting if server is responding...');
  
  // Make a request to the health endpoint
  const req = http.get('http://localhost:5000/api/health', (res) => {
    console.log(`Health check status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const healthData = JSON.parse(data);
        console.log('Health status:', healthData.status);
        console.log('Database connection:', healthData.database.readyStateText);
        
        if (healthData.status === 'ok') {
          console.log('\nServer is running correctly!');
          console.log('Now testing products endpoint...');
          
          // Test products endpoint
          const productsReq = http.get('http://localhost:5000/api/products', (res) => {
            console.log(`Products API status: ${res.statusCode}`);
            
            if (res.statusCode === 200) {
              console.log('Products API is working correctly!');
            } else {
              console.log('Products API returned error status');
            }
          });
          
          productsReq.on('error', (err) => {
            console.error('Error testing products API:', err.message);
          });
        } else {
          console.log('Server health check failed');
        }
      } catch (e) {
        console.error('Error parsing health data:', e.message);
      }
    });
  });
  
  req.on('error', (err) => {
    console.error('Error making health check request:', err.message);
    console.log('The server might not be running yet. Please try again later.');
  });
}, 5000); // Wait 5 seconds for server to start

console.log('Waiting for server to start up...');
