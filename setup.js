#!/usr/bin/env node

/**
 * Script to fix dependencies and environment setup
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
      // Install the required packages explicitly
      await runCommand('npm', ['install', 'passport-google-oauth2', 'dotenv', 'qrcode', 'uuid', 'bcryptjs', 'connect-mongo'], backendDir);
    } else {
      console.error('Backend package.json not found!');
      process.exit(1);
    }
    
    // Copy .env.example to .env if it doesn't exist
    if (!fs.existsSync(path.join(backendDir, '.env'))) {
      console.log('\n=== Creating .env file from example ===\n');
      
      // Check if .env.example exists, otherwise create it
      if (!fs.existsSync(path.join(backendDir, '.env.example'))) {
        fs.writeFileSync(path.join(backendDir, '.env.example'), `
# Environment variables for the Han Foods E-Commerce backend
PORT=5000
NODE_ENV=development

# MongoDB connection string
MONGO_URI=mongodb://localhost:27017/hanfoods

# Session and auth
SESSION_SECRET=dev_session_secret_replace_in_production
JWT_SECRET=dev_jwt_secret_replace_in_production

# Set these to actual Google OAuth credentials when needed
# For now using placeholder values just to make the app start
GOOGLE_CLIENT_ID=placeholder_client_id
GOOGLE_CLIENT_SECRET=placeholder_client_secret

# Payment provider credentials (placeholders)
VIETQR_ACCOUNT_NUMBER=0123456789
VIETQR_ACCOUNT_NAME=Han Foods
VIETQR_BANK_CODE=VNPAY
        `);
      }
      
      // Copy .env.example to .env
      fs.copyFileSync(
        path.join(backendDir, '.env.example'),
        path.join(backendDir, '.env')
      );
      
      console.log('.env file created successfully!');
    }
    
    console.log('\n=== Setup Complete ===\n');
    console.log('You can now start the projects:');
    console.log('  - Backend: cd hfbe && npm run dev');
    console.log('  - Frontend: cd hffe && npm start');
    console.log('');
    console.log('IMPORTANT: Update the .env file with real credentials when deploying to production');
    
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

main();
