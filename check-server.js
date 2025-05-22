/**
 * Script to verify backend server starts correctly
 */
const { spawn } = require('child_process');
const path = require('path');

const backendDir = path.join(__dirname, 'hfbe');
let hasError = false;
let errorMessage = '';

console.log('Starting server for verification...');

const server = spawn('node', ['app.js'], {
  cwd: backendDir,
  shell: true
});

// Log server startup for 5 seconds
server.stdout.on('data', (data) => {
  console.log(`SERVER OUTPUT: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`SERVER ERROR: ${data}`);
  hasError = true;
  errorMessage += data;
});

// Wait 5 seconds then check if any errors occurred
setTimeout(() => {
  server.kill();
  
  if (hasError) {
    console.error('\nServer had errors during startup:');
    console.error(errorMessage);
    console.error('\nPlease fix these errors before proceeding.');
  } else {
    console.log('\nServer started successfully!');
    console.log('You can now run the server with: cd hfbe && npm run dev');
  }
  
  process.exit(hasError ? 1 : 0);
}, 5000);
