/**
 * Environment Configuration Service
 * Centralizes all environment variable handling with validation and type safety
 * 
 * @author HanFoods Development Team
 * @version 1.0.0
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

/**
 * Validates required environment variables
 * @param {string} varName - Environment variable name
 * @param {*} defaultValue - Default value if not set
 * @returns {*} Environment variable value or default
 */
const getEnvVar = (varName, defaultValue = null) => {
  const value = process.env[varName];
  if (value === undefined || value === null || value === '') {
    if (defaultValue !== null) {
      console.warn(`⚠️  Environment variable ${varName} not set, using default: ${defaultValue}`);
      return defaultValue;
    }
    throw new Error(`❌ Required environment variable ${varName} is not set`);
  }
  return value;
};

/**
 * Converts string to boolean
 * @param {string} value - String value to convert
 * @returns {boolean} Boolean value
 */
const toBool = (value) => {
  return value && (value.toLowerCase() === 'true' || value === '1');
};

/**
 * Converts string to number
 * @param {string} value - String value to convert
 * @param {number} defaultValue - Default value if conversion fails
 * @returns {number} Number value
 */
const toNumber = (value, defaultValue) => {
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Application Configuration Object
 * All environment variables are centralized here
 */
const config = {
  // Application Settings
  app: {
    name: getEnvVar('APP_NAME', 'HanFoods Backend API'),
    version: getEnvVar('APP_VERSION', '1.0.0'),
    env: getEnvVar('NODE_ENV', 'development'),
    port: toNumber(getEnvVar('PORT', '5000'), 5000),
    isProduction: getEnvVar('NODE_ENV') === 'production',
    isDevelopment: getEnvVar('NODE_ENV', 'development') === 'development',
  },

  // API Configuration
  api: {
    baseUrl: getEnvVar('API_BASE_URL', 'http://localhost:5000'),
    version: getEnvVar('API_VERSION', 'v1'),
    prefix: getEnvVar('API_PREFIX', '/api'),
  },

  // Frontend URLs
  frontend: {
    url: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),
    adminUrl: getEnvVar('FRONTEND_ADMIN_URL', 'http://localhost:3000/admin'),
  },

  // Database Configuration
  database: {
    uri: getEnvVar('MONGO_URI', 'mongodb://localhost:27017/hanfoods'),
    name: getEnvVar('MONGO_DB_NAME', 'hanfoods'),
  },

  // Authentication & JWT
  auth: {
    jwtSecret: getEnvVar('JWT_SECRET'),
    jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '24h'),
    jwtRefreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
    sessionSecret: getEnvVar('SESSION_SECRET'),
    sessionExpires: toNumber(getEnvVar('SESSION_EXPIRES', '86400000'), 86400000),
    bcryptRounds: toNumber(getEnvVar('BCRYPT_ROUNDS', '12'), 12),
  },

  // Security Settings
  security: {
    rateLimitWindowMs: toNumber(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 900000),
    rateLimitMaxRequests: toNumber(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 100),
    rateLimitLoginMax: toNumber(getEnvVar('RATE_LIMIT_LOGIN_MAX', '5'), 5),
  },

  // CORS Configuration
  cors: {
    origin: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: toBool(getEnvVar('CORS_CREDENTIALS', 'true')),
  },

  // File Upload Configuration
  upload: {
    path: getEnvVar('UPLOAD_PATH', './uploads'),
    maxFileSize: toNumber(getEnvVar('MAX_FILE_SIZE', '5242880'), 5242880), // 5MB
    allowedTypes: getEnvVar('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/gif,image/webp').split(','),
  },

  // Email Configuration
  email: {
    host: getEnvVar('SMTP_HOST', 'smtp.gmail.com'),
    port: toNumber(getEnvVar('SMTP_PORT', '587'), 587),
    user: getEnvVar('SMTP_USER', ''),
    pass: getEnvVar('SMTP_PASS', ''),
    from: getEnvVar('EMAIL_FROM', 'noreply@hanfoods.com'),
  },

  // Payment Configuration
  payment: {
    vietqr: {
      accountNumber: getEnvVar('VIETQR_ACCOUNT_NUMBER', '0123456789'),
      accountName: getEnvVar('VIETQR_ACCOUNT_NAME', 'Han Foods'),
      bankCode: getEnvVar('VIETQR_BANK_CODE', 'VNPAY'),
    },
    callbackUrl: getEnvVar('PAYMENT_CALLBACK_URL', 'http://localhost:5000/api/payments/callback'),
  },

  // Google OAuth
  google: {
    clientId: getEnvVar('GOOGLE_CLIENT_ID', 'placeholder_client_id'),
    clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET', 'placeholder_client_secret'),
    callbackUrl: getEnvVar('GOOGLE_CALLBACK_URL', 'http://localhost:5000/api/auth/google/callback'),
  },

  // Logging Configuration
  logging: {
    level: getEnvVar('LOG_LEVEL', 'debug'),
    filePath: getEnvVar('LOG_FILE_PATH', './logs/app.log'),
    maxSize: getEnvVar('LOG_MAX_SIZE', '10m'),
    maxFiles: toNumber(getEnvVar('LOG_MAX_FILES', '5'), 5),
  },

  // Admin Configuration
  admin: {
    email: getEnvVar('ADMIN_EMAIL', 'admin@hanfoods.com'),
    password: getEnvVar('ADMIN_PASSWORD', 'admin123'),
    role: getEnvVar('DEFAULT_ADMIN_ROLE', 'admin'),
  },
};

/**
 * Validates critical configuration on startup
 */
const validateConfig = () => {
  const requiredVars = [
    'JWT_SECRET',
    'SESSION_SECRET',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    if (config.app.isProduction) {
      throw new Error('Required environment variables are missing in production');
    } else {
      console.warn('⚠️  Using default values for development. Please set proper values for production.');
    }
  }

  console.log('✅ Environment configuration loaded successfully');
  console.log(`📋 App: ${config.app.name} v${config.app.version}`);
  console.log(`🌍 Environment: ${config.app.env}`);
  console.log(`🚀 Port: ${config.app.port}`);
  console.log(`🔗 API Base: ${config.api.baseUrl}`);
};

// Validate configuration on module load
validateConfig();

module.exports = config;
