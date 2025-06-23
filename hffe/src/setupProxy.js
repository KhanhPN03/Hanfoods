// file: setupProxy.js
// This file configures the development server's proxy settings
// to help with WebSocket connections and API requests

const { createProxyMiddleware } = require('http-proxy-middleware');

// Load environment configuration
require('dotenv').config();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

module.exports = function(app) {
  // Proxy API requests to the backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: API_URL,
      changeOrigin: true,
      logLevel: process.env.REACT_APP_DEBUG === 'true' ? 'debug' : 'warn',
    })
  );

  // Fix for WebSocket connection issues
  app.use(
    '/ws',
    createProxyMiddleware({
      target: `ws://${FRONTEND_URL.replace('http://', '').replace('https://', '')}`,
      ws: true,
      changeOrigin: true,
    })
  );
};
