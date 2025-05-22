/**
 * Script runner with file logging
 * This script runs the enhanced validation script and logs output to a file
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log file paths
const validationLogFile = path.join(logsDir, 'validation-log.txt');
const testScenarioLogFile = path.join(logsDir, 'test-scenario-log.txt');

// Function to run a script and log output
function runScriptWithLogging(scriptPath, logFilePath) {
  try {
    console.log(`Running script: ${scriptPath}`);
    console.log(`Logging output to: ${logFilePath}\n`);
    
    const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
    fs.writeFileSync(logFilePath, output);
    
    console.log(`Script execution complete. Check log file for results.`);
    return true;
  } catch (error) {
    console.error(`Error running script: ${error.message}`);
    if (error.stdout) {
      fs.writeFileSync(logFilePath, error.stdout);
    }
    if (error.stderr) {
      fs.appendFileSync(logFilePath, `\n\nERROR OUTPUT:\n${error.stderr}`);
    }
    return false;
  }
}

// Run the scripts
console.log('=== RUNNING COCONATURE E-COMMERCE TEST SCRIPTS ===\n');

console.log('1. Running Fixed Test Scenario');
const testScenarioSuccess = runScriptWithLogging(
  path.join(__dirname, 'scripts', 'fixed-test-scenario.js'),
  testScenarioLogFile
);

console.log('\n2. Running Enhanced Validation');
const validationSuccess = runScriptWithLogging(
  path.join(__dirname, 'scripts', 'enhanced-validation.js'),
  validationLogFile
);

console.log('\n=== TEST EXECUTION SUMMARY ===');
console.log(`Test Scenario: ${testScenarioSuccess ? 'COMPLETED' : 'FAILED'}`);
console.log(`Validation: ${validationSuccess ? 'COMPLETED' : 'FAILED'}`);
console.log('\nCheck the log files in the logs directory for detailed results.');
