#!/usr/bin/env node

/**
 * Script to fix missing dependencies for both backend and frontend
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to run a command in a specific directory
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')} in ${cwd}`);
    
    const process = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`));
        return;
      }
      resolve();
    });
  });
}

async function main() {
  try {
    const rootDir = path.resolve(__dirname);
    const backendDir = path.join(rootDir, 'hfbe');
    
    // Install specific backend dependencies that are missing
    console.log('\n=== Installing Missing Backend Dependencies ===\n');
    
    // Check if the package.json exists
    if (fs.existsSync(path.join(backendDir, 'package.json'))) {
      // Install the passport-google-oauth2 package explicitly
      await runCommand('npm', ['install', 'passport-google-oauth2'], backendDir);
      
      // Install other necessary packages
      await runCommand('npm', ['install', 'qrcode', 'uuid', 'bcryptjs', 'connect-mongo'], backendDir);
    } else {
      console.error('Backend package.json not found!');
      process.exit(1);
    }
    
    console.log('\n=== Dependencies Fixed ===\n');
    console.log('You can now start the projects:');
    console.log('  - Backend: cd hfbe && npm run dev');
    console.log('  - Frontend: cd hffe && npm start');
    
  } catch (error) {
    console.error('Error during installation:', error);
    process.exit(1);
  }
}

main();
