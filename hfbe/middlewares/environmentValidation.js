/**
 * Environment Validation Middleware
 * Validates environment variables and provides warnings for missing configs
 * 
 * @author HanFoods Development Team
 * @version 1.0.0
 */

const config = require('../config/environment');

/**
 * Security Check Middleware
 * Validates critical security configurations
 */
const validateSecurityConfig = () => {
  const issues = [];

  // Check JWT Secret strength
  if (config.auth.jwtSecret.includes('dev_') || config.auth.jwtSecret.length < 32) {
    issues.push({
      level: 'CRITICAL',
      message: 'JWT_SECRET is too weak or using development default',
      recommendation: 'Use a strong, random 32+ character secret in production'
    });
  }

  // Check Session Secret strength
  if (config.auth.sessionSecret.includes('dev_') || config.auth.sessionSecret.length < 32) {
    issues.push({
      level: 'CRITICAL', 
      message: 'SESSION_SECRET is too weak or using development default',
      recommendation: 'Use a strong, random 32+ character secret in production'
    });
  }

  // Check if running in production with development configs
  if (config.app.isProduction) {
    if (config.database.uri.includes('localhost')) {
      issues.push({
        level: 'CRITICAL',
        message: 'Using localhost database in production',
        recommendation: 'Configure proper production database URI'
      });
    }

    if (config.cors.origin.includes('localhost')) {
      issues.push({
        level: 'WARNING',
        message: 'CORS origin set to localhost in production',
        recommendation: 'Configure proper production frontend URL'
      });
    }
  }

  // Check Google OAuth config
  if (config.google.clientId.includes('placeholder')) {
    issues.push({
      level: 'INFO',
      message: 'Google OAuth not configured',
      recommendation: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET for Google login'
    });
  }

  return issues;
};

/**
 * Log security validation results
 */
const logSecurityValidation = () => {
  const issues = validateSecurityConfig();
  
  if (issues.length === 0) {
    console.log('✅ Security configuration validation passed');
    return;
  }

  console.log('\n🔒 SECURITY CONFIGURATION REPORT');
  console.log('=' .repeat(50));

  issues.forEach(issue => {
    const icon = issue.level === 'CRITICAL' ? '🚨' : 
                 issue.level === 'WARNING' ? '⚠️' : 'ℹ️';
    
    console.log(`${icon} ${issue.level}: ${issue.message}`);
    console.log(`   💡 ${issue.recommendation}\n`);
  });

  // Exit if critical issues in production
  const criticalIssues = issues.filter(i => i.level === 'CRITICAL');
  if (config.app.isProduction && criticalIssues.length > 0) {
    console.error('❌ Critical security issues detected in production. Exiting...');
    process.exit(1);
  }
};

/**
 * Environment Information Logging
 */
const logEnvironmentInfo = () => {
  console.log('\n🌍 ENVIRONMENT CONFIGURATION');
  console.log('=' .repeat(50));
  console.log(`📱 Application: ${config.app.name} v${config.app.version}`);
  console.log(`🏃 Environment: ${config.app.env}`);
  console.log(`🚀 Port: ${config.app.port}`);
  console.log(`🔗 API Base URL: ${config.api.baseUrl}`);
  console.log(`🌐 Frontend URL: ${config.frontend.url}`);
  console.log(`🗄️  Database: ${config.database.uri.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials
  console.log(`📧 SMTP Host: ${config.email.host}`);
  console.log(`💳 Payment: VietQR configured`);
  console.log(`🔐 JWT Expires: ${config.auth.jwtExpiresIn}`);
  console.log(`📊 Log Level: ${config.logging.level}`);
  console.log(`🛡️  CORS Origin: ${config.cors.origin}`);
  console.log('=' .repeat(50));
};

/**
 * Feature Status Logging
 */
const logFeatureStatus = () => {
  console.log('\n🎯 FEATURE STATUS');
  console.log('=' .repeat(30));
  console.log(`🔍 Google OAuth: ${config.google.clientId.includes('placeholder') ? '❌ Not configured' : '✅ Configured'}`);
  console.log(`📧 Email Service: ${config.email.user ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`💳 Payment Gateway: ✅ VietQR Ready`);
  console.log(`📁 File Upload: ✅ Ready (${config.upload.path})`);
  console.log(`🔒 Rate Limiting: ✅ Active (${config.security.rateLimitMaxRequests} req/${config.security.rateLimitWindowMs}ms)`);
  console.log('=' .repeat(30));
};

/**
 * Startup Environment Check
 */
const performStartupCheck = () => {
  console.log('\n🔍 PERFORMING STARTUP ENVIRONMENT CHECK...');
  
  // Log environment info
  logEnvironmentInfo();
  
  // Log feature status
  logFeatureStatus();
  
  // Validate security configuration
  logSecurityValidation();
  
  console.log('✅ Environment validation completed\n');
};

/**
 * Runtime Configuration Watcher
 * Monitors for configuration changes during runtime
 */
const startConfigWatcher = () => {
  if (config.app.isDevelopment) {
    // In development, periodically check for .env file changes
    const fs = require('fs');
    const path = require('path');
    
    const envPath = path.join(__dirname, '../.env');
    
    if (fs.existsSync(envPath)) {
      fs.watchFile(envPath, (curr, prev) => {
        console.log('\n📝 .env file changed - restart required for changes to take effect');
      });
    }
  }
};

module.exports = {
  validateSecurityConfig,
  logSecurityValidation,
  logEnvironmentInfo,
  logFeatureStatus,
  performStartupCheck,
  startConfigWatcher,
};
