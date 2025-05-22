#!/usr/bin/env node

/**
 * Script to install dependencies for both backend and frontend
 */

const { spawn } = require('child_process');
const path = require('path');

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
    const frontendDir = path.join(rootDir, 'hffe');
    
    // Install backend dependencies
    console.log('\n=== Installing Backend Dependencies ===\n');
    await runCommand('npm', ['install'], backendDir);
    
    // Install frontend dependencies
    console.log('\n=== Installing Frontend Dependencies ===\n');
    await runCommand('npm', ['install'], frontendDir);
    
    console.log('\n=== Installation Complete ===\n');
    console.log('You can now start the projects:');
    console.log('  - Backend: cd hfbe && npm run dev');
    console.log('  - Frontend: cd hffe && npm start');
    
  } catch (error) {
    console.error('Error during installation:', error);
    process.exit(1);
  }
}

main();
