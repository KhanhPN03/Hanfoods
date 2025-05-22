const { exec } = require('child_process');
const path = require('path');

console.log('Starting backend server...');

const server = exec('node app.js', { cwd: __dirname }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Execution error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});

// Keep the process running
process.stdin.resume();

console.log('Server starting...');
console.log('Press Ctrl+C to stop');
