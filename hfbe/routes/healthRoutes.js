// Health check routes
const express = require('express');
const router = express.Router();
const { checkDatabaseHealth, logDatabaseHealth } = require('../utils/database-healthcheck');

// Basic health check endpoint
router.get('/', async (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// Database health check endpoint
router.get('/database', async (req, res) => {
  const health = await checkDatabaseHealth();
  
  // Auto-run a database log on request
  logDatabaseHealth();
  
  if (health.connected) {
    return res.status(200).json({
      success: true,
      databaseHealth: health
    });
  } else {
    return res.status(503).json({
      success: false,
      databaseHealth: health
    });
  }
});

module.exports = router;
