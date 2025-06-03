/**
 * MongoDB database health check utility
 * Used to verify the database connection and report issues
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');

/**
 * Check the health of the MongoDB connection
 * @returns {Promise<Object>} Health status object
 */
async function checkDatabaseHealth() {
  try {
    // First check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return {
        connected: false,
        status: 'disconnected',
        readyState: mongoose.connection.readyState,
        message: 'MongoDB is not connected',
        error: null
      };
    }

    // Try to ping the database
    await mongoose.connection.db.admin().ping();
    
    // Try to fetch a product to verify collection access
    const startTime = Date.now();
    const productCount = await Product.countDocuments().limit(1);
    const queryTime = Date.now() - startTime;
    
    return {
      connected: true,
      status: 'healthy',
      readyState: mongoose.connection.readyState,
      message: 'MongoDB connection is healthy',
      responseTime: queryTime,
      productCount,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  } catch (error) {
    return {
      connected: false,
      status: 'error',
      readyState: mongoose.connection.readyState,
      message: `MongoDB health check failed: ${error.message}`,
      error: error.toString(),
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  }
}

/**
 * Print the database health status to the console
 */
async function logDatabaseHealth() {
  const health = await checkDatabaseHealth();
  if (health.connected) {
    console.log(`✅ MongoDB connection is HEALTHY`);
    console.log(`   Database: ${health.name} at ${health.host}:${health.port}`);
    console.log(`   Query time: ${health.responseTime}ms`);
    console.log(`   Products count: ${health.productCount}`);
  } else {
    console.error(`❌ MongoDB connection is NOT HEALTHY: ${health.message}`);
    console.error(`   Status: ${health.status}, Ready state: ${health.readyState}`);
    if (health.error) {
      console.error(`   Error: ${health.error}`);
    }
  }
  return health;
}

module.exports = {
  checkDatabaseHealth,
  logDatabaseHealth
};
