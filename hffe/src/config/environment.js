/**
 * Frontend Environment Configuration Service
 * Centralizes all environment variable handling for React application
 * 
 * @author HanFoods Development Team
 * @version 1.0.0
 */

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
 * Frontend Configuration Object
 * All environment variables for React application
 */
const config = {
  // Application Settings
  app: {
    name: getEnvVar('REACT_APP_NAME', 'HanFoods E-Commerce'),
    version: getEnvVar('REACT_APP_VERSION', '1.0.0'),
    env: getEnvVar('REACT_APP_ENV', 'development'),
    isProduction: getEnvVar('REACT_APP_ENV') === 'production',
    isDevelopment: getEnvVar('REACT_APP_ENV', 'development') === 'development',
    debug: toBool(getEnvVar('REACT_APP_DEBUG', 'true')),
    logLevel: getEnvVar('REACT_APP_LOG_LEVEL', 'debug'),
  },

  // API Configuration
  api: {
    baseUrl: getEnvVar('REACT_APP_API_URL', 'http://localhost:5000'),
    version: getEnvVar('REACT_APP_API_VERSION', 'v1'),
    prefix: getEnvVar('REACT_APP_API_PREFIX', '/api'),
    timeout: 15000, // 15 seconds
  },

  // Specific API Endpoints
  endpoints: {
    auth: getEnvVar('REACT_APP_AUTH_API_URL', 'http://localhost:5000/api/auth'),
    products: getEnvVar('REACT_APP_PRODUCTS_API_URL', 'http://localhost:5000/api/products'),
    orders: getEnvVar('REACT_APP_ORDERS_API_URL', 'http://localhost:5000/api/orders'),
    admin: getEnvVar('REACT_APP_ADMIN_API_URL', 'http://localhost:5000/api/admin'),
    cart: getEnvVar('REACT_APP_CART_API_URL', 'http://localhost:5000/api/carts'),
    wishlist: getEnvVar('REACT_APP_WISHLIST_API_URL', 'http://localhost:5000/api/wishlists'),
    addresses: getEnvVar('REACT_APP_ADDRESSES_API_URL', 'http://localhost:5000/api/addresses'),
    payments: getEnvVar('REACT_APP_PAYMENTS_API_URL', 'http://localhost:5000/api/payments'),
    upload: getEnvVar('REACT_APP_UPLOAD_API_URL', 'http://localhost:5000/api/upload'),
  },

  // Frontend URLs
  frontend: {
    baseUrl: getEnvVar('REACT_APP_BASE_URL', 'http://localhost:3000'),
    adminBaseUrl: getEnvVar('REACT_APP_ADMIN_BASE_URL', 'http://localhost:3000/admin'),
  },

  // Feature Toggles
  features: {
    googleLogin: toBool(getEnvVar('REACT_APP_ENABLE_GOOGLE_LOGIN', 'false')),
    socialMedia: toBool(getEnvVar('REACT_APP_ENABLE_SOCIAL_MEDIA', 'true')),
    wishlist: toBool(getEnvVar('REACT_APP_ENABLE_WISHLIST', 'true')),
    reviews: toBool(getEnvVar('REACT_APP_ENABLE_REVIEWS', 'true')),
    discounts: toBool(getEnvVar('REACT_APP_ENABLE_DISCOUNTS', 'true')),
  },

  // UI Configuration
  ui: {
    defaultCurrency: getEnvVar('REACT_APP_DEFAULT_CURRENCY', 'VND'),
    defaultLanguage: getEnvVar('REACT_APP_DEFAULT_LANGUAGE', 'vi'),
    itemsPerPage: toNumber(getEnvVar('REACT_APP_ITEMS_PER_PAGE', '12'), 12),
    maxCartItems: toNumber(getEnvVar('REACT_APP_MAX_CART_ITEMS', '99'), 99),
  },

  // File Upload Configuration
  upload: {
    maxFileSize: toNumber(getEnvVar('REACT_APP_MAX_FILE_SIZE', '5242880'), 5242880), // 5MB
    allowedTypes: getEnvVar('REACT_APP_ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/gif,image/webp').split(','),
  },

  // Third-party Services
  external: {
    googleClientId: getEnvVar('REACT_APP_GOOGLE_CLIENT_ID', 'placeholder_client_id'),
    analyticsId: getEnvVar('REACT_APP_ANALYTICS_ID', ''),
  },

  // Build Information
  build: {
    date: getEnvVar('REACT_APP_BUILD_DATE', new Date().toISOString().split('T')[0]),
    generateSourceMap: toBool(getEnvVar('GENERATE_SOURCEMAP', 'true')),
  },
};

/**
 * Validates critical configuration on startup
 */
const validateConfig = () => {
  const requiredVars = [
    'REACT_APP_API_URL',
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

  if (config.app.debug) {
    console.log('✅ Frontend environment configuration loaded successfully');
    console.log(`📋 App: ${config.app.name} v${config.app.version}`);
    console.log(`🌍 Environment: ${config.app.env}`);
    console.log(`🔗 API Base: ${config.api.baseUrl}`);
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint, path = '') => {
  const baseUrl = config.endpoints[endpoint] || config.api.baseUrl;
  return path ? `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}` : baseUrl;
};

// Helper function to get API headers
export const getApiHeaders = (includeAuth = true, additionalHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };

  if (includeAuth) {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to check if feature is enabled
export const isFeatureEnabled = (featureName) => {
  return config.features[featureName] || false;
};

// Validate configuration on module load
validateConfig();

export default config;
