// filepath: d:\Hang_ngoo\web\hfbe\scripts\updated-test-runner.js
/**
 * Updated Comprehensive CocoNature E-commerce Test Runner
 * 
 * This script performs the following tasks:
 * 1. Connects to the MongoDB database and checks connection
 * 2. Clears existing data in the test database
 * 3. Runs the test scenario script to populate database with relational data
 * 4. Uses the improved validation script to validate relationships and routes
 * 5. Generates a summary report of the test results
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Import improved validation script
const { validateRelationships, validateRoutes } = require('./improved-validation');

// Import all models
const Account = require('../models/Account');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Address = require('../models/Address');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Billing = require('../models/Billing');
const Discount = require('../models/Discount');
const Review = require('../models/Review');
const PaymentMethod = require('../models/PaymentMethod');

// Store test results
const testResults = {
  dbConnection: false,
  dataPopulation: false,
  relationshipValidation: false,
  routeValidation: false,
  errors: []
};

// Connect to MongoDB
async function connectToDatabase() {
  try {
    console.log('1. TESTING MONGODB CONNECTION:');
    console.log('Connecting to MongoDB database: hanfoods...');
    
    await mongoose.connect('mongodb://127.0.0.1:27017/hanfoods', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Successfully connected to MongoDB database');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in the database:`);
    collections.forEach(collection => {
      console.log(` - ${collection.name}`);
    });
    
    testResults.dbConnection = true;
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    testResults.errors.push('MongoDB connection failed: ' + error.message);
    return false;
  }
}

// Clear all collections
async function clearDatabase() {
  console.log('\n2. CLEARING DATABASE:');
  console.log('Deleting all records from collections...');
  
  try {
    await Account.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Address.deleteMany({});
    await PaymentMethod.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await Billing.deleteMany({});
    await Discount.deleteMany({});
    await Review.deleteMany({});
    
    console.log('✅ All collections cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear database:', error.message);
    testResults.errors.push('Database clearing failed: ' + error.message);
    return false;
  }
}

// Create test data by running the fixed test scenario script
async function populateTestData() {
  console.log('\n3. POPULATING TEST DATA:');
  console.log('Running fixed test scenario script...');
  
  try {
    // Execute the fixed test scenario script as a child process
    const scriptPath = path.join(__dirname, 'fixed-test-scenario.js');
    
    // We'll run this in a separate process, but capture the output
    const { stdout, stderr } = await execPromise(`node ${scriptPath}`);
    
    if (stderr && !stderr.includes('DeprecationWarning')) {
      console.error('❌ Error running test scenario script:', stderr);
      testResults.errors.push('Test data population failed: ' + stderr);
      return false;
    }
    
    // Log the output in a clean format
    const outputLines = stdout.split('\n').filter(line => 
      !line.includes('DeprecationWarning') && 
      !line.includes('useNewUrlParser') && 
      !line.includes('useUnifiedTopology')
    );
    
    outputLines.forEach(line => console.log(line));
    
    // Check if data was successfully created
    const accounts = await Account.countDocuments();
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    
    if (accounts > 0 && products > 0) {
      console.log('✅ Test data successfully populated');
      console.log(`   Created ${accounts} accounts, ${products} products, ${orders} orders`);
      testResults.dataPopulation = true;
      return true;
    } else {
      console.error('❌ Test data population appears to have failed');
      testResults.errors.push('Test data population failed: No accounts or products created');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to run test scenario script:', error.message);
    testResults.errors.push('Test data population failed: ' + error.message);
    return false;
  }
}

// Generate test report
function generateReport() {
  console.log('\n=== COCONATURE E-COMMERCE TEST REPORT ===');
  console.log(`Test Date: ${new Date().toLocaleString()}`);
  console.log('\nTest Results:');
  console.log(`1. Database Connection: ${testResults.dbConnection ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`2. Test Data Population: ${testResults.dataPopulation ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`3. Database Relationship Validation: ${testResults.relationshipValidation ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`4. Routes and Controllers Validation: ${testResults.routeValidation ? '✅ PASSED' : '❌ FAILED'}`);
  
  const overallResult = 
    testResults.dbConnection && 
    testResults.dataPopulation && 
    testResults.relationshipValidation && 
    testResults.routeValidation;
  
  console.log(`\nOverall Test Result: ${overallResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (testResults.errors.length > 0) {
    console.log('\nErrors encountered:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  console.log('\nTest Accounts Created:');
  console.log('- Admin: admin@coconature.com / Admin@123');
  console.log('- Customer 1: nguyen.khachhang@example.com / Customer1@123');
  console.log('- Customer 2: tran.khachhang@example.com / Customer2@123');
  
  console.log('\n=== END OF REPORT ===');
}

// Main function
async function runTests() {
  console.log('=== COCONATURE E-COMMERCE TEST SUITE ===');
  console.log('Starting comprehensive tests...\n');
  
  try {
    // Connect to database
    const isConnected = await connectToDatabase();
    if (!isConnected) {
      generateReport();
      return;
    }
    
    // Clear database
    await clearDatabase();
    
    // Populate test data
    const dataPopulated = await populateTestData();
    if (!dataPopulated) {
      generateReport();
      return;
    }
    
    // Validate relationships (using improved validation)
    console.log('\n4. VALIDATING DATABASE RELATIONSHIPS:');
    try {
      const relationshipsValid = await validateRelationships();
      testResults.relationshipValidation = relationshipsValid;
      
      if (relationshipsValid) {
        console.log('✅ Database relationships validation passed');
      } else {
        console.error('❌ Database relationships validation failed');
        testResults.errors.push('Database relationships validation failed');
      }
    } catch (error) {
      console.error('❌ Error during relationship validation:', error.message);
      testResults.errors.push('Relationship validation error: ' + error.message);
    }
    
    // Validate routes (using improved validation)
    console.log('\n5. VALIDATING ROUTES AND CONTROLLERS:');
    try {
      const routesValid = await validateRoutes();
      testResults.routeValidation = routesValid;
      
      if (routesValid) {
        console.log('✅ Routes and controllers validation passed');
      } else {
        console.error('❌ Routes and controllers validation failed');
        testResults.errors.push('Routes and controllers validation failed');
      }
    } catch (error) {
      console.error('❌ Error during route validation:', error.message);
      testResults.errors.push('Route validation error: ' + error.message);
    }
    
    // Generate report
    generateReport();
  } catch (error) {
    console.error('\nUnexpected error during testing:', error);
    testResults.errors.push('Unexpected error: ' + error.message);
    generateReport();
  } finally {
    // Disconnect from database
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

// Run tests
runTests();
