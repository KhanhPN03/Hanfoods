// file: setupProxy.js
// This file configures the development server's proxy settings
// to help with WebSocket connections and API requests

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to the backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );

  // Fix for WebSocket connection issues
  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'ws://localhost:3000',
      ws: true,
      changeOrigin: true,
    })
  );
};
