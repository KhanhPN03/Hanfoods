/**
 * Simple script to start the backend server
 */

const { spawn } = require('child_process');
const path = require('path');

// Start the backend server
console.log('Starting Han Foods backend server...');
console.log('Press Ctrl+C to stop the server.');

const backendDir = path.join(__dirname, 'hfbe');
const server = spawn('node', ['app.js'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});
