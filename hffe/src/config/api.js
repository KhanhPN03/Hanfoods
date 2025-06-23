/**
 * API Constants and Endpoint Management
 * Centralized API endpoints configuration for better maintainability
 * 
 * @author HanFoods Development Team
 * @version 1.0.0
 */

import config from './environment';

/**
 * API Endpoints Configuration
 * All API endpoints are defined here for easy maintenance
 */
export const API_ENDPOINTS = {
  // Authentication Endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    GOOGLE: '/api/auth/google',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },

  // Product Endpoints
  PRODUCTS: {
    BASE: '/api/products',
    BY_ID: (id) => `/api/products/${id}`,
    SEARCH: '/api/products/search',
    BY_CATEGORY: (categoryId) => `/api/products/category/${categoryId}`,
    ADMIN: {
      BASE: '/api/products',
      STATS: '/api/products/admin/stats',
      TOP_PRODUCTS: '/api/products/admin/top-products',
      LOW_STOCK: '/api/products/admin/low-stock',
      BULK_UPDATE: '/api/products/admin/bulk-update',
      EXPORT: '/api/products/admin/export',
      BY_ID: (id) => `/api/products/${id}`,
      CHECK_ORDERS: (id) => `/api/products/${id}/orders/check`,
      WITH_IMAGES: '/api/products/with-images',
    },
  },

  // Order Endpoints
  ORDERS: {
    BASE: '/api/orders',
    BY_ID: (id) => `/api/orders/${id}`,
    USER: '/api/orders/user',
    CANCEL: (id) => `/api/orders/${id}/cancel`,
    ADMIN: {
      BASE: '/api/admin/orders',
      BY_ID: (id) => `/api/admin/orders/${id}`,
      STATS: '/api/admin/orders/stats',
      REVENUE: '/api/admin/orders/revenue',
      EXPORT: '/api/admin/orders/export',
      UPDATE_STATUS: (id) => `/api/admin/orders/${id}/status`,
    },
  },

  // Admin Endpoints
  ADMIN: {
    DASHBOARD: {
      STATS: '/api/admin/dashboard/stats',
      RECENT_ORDERS: '/api/admin/dashboard/recent-orders',
    },
    USERS: {
      BASE: '/api/admin/users',
      BY_ID: (id) => `/api/admin/users/${id}`,
      STATS: '/api/admin/users/stats',
      EXPORT: '/api/admin/users/export',
      UPDATE_STATUS: (id) => `/api/admin/users/${id}/status`,
      UPDATE_ROLE: (id) => `/api/admin/users/${id}/role`,
      CHECK_ORDERS: (id) => `/api/admin/users/${id}/orders/check`,
    },
    REVENUE: {
      STATS: '/api/admin/revenue/stats',
      ANALYTICS: '/api/admin/revenue/analytics',
      DETAILED: '/api/admin/revenue/detailed',
      EXPORT: '/api/admin/revenue/export',
    },
    SETTINGS: {
      BASE: '/api/admin/settings',
    },
  },

  // Cart Endpoints
  CART: {
    BASE: '/api/carts',
    ADD: '/api/carts/add',
    UPDATE: '/api/carts/update',
    REMOVE: (productId) => `/api/carts/remove/${productId}`,
    CLEAR: '/api/carts/clear',
  },

  // Wishlist Endpoints
  WISHLIST: {
    BASE: '/api/wishlists',
    ADD: '/api/wishlists/add',
    REMOVE: (productId) => `/api/wishlists/remove/${productId}`,
    CHECK: (productId) => `/api/wishlists/check/${productId}`,
    CLEAR: '/api/wishlists/clear',
  },

  // Address Endpoints
  ADDRESSES: {
    BASE: '/api/addresses',
    BY_ID: (id) => `/api/addresses/${id}`,
    SET_DEFAULT: (id) => `/api/addresses/${id}/default`,
    FIND_OR_CREATE: '/api/addresses/find-or-create',
  },

  // Payment Endpoints
  PAYMENTS: {
    BASE: '/api/payments',
    METHODS: '/api/payments/methods',
    BY_ID: (id) => `/api/payments/${id}`,
    CASH_ON_DELIVERY: '/api/payments/cash-on-delivery',
    VIETQR: '/api/payments/vietqr',
    VERIFY: '/api/payments/verify',
    BY_ORDER_ID: (orderId) => `/api/payments/order/${orderId}`,
  },

  // Category Endpoints
  CATEGORIES: {
    BASE: '/api/categories',
    BY_ID: (id) => `/api/categories/${id}`,
  },

  // Discount Endpoints
  DISCOUNTS: {
    BASE: '/api/discounts',
    BY_ID: (id) => `/api/discounts/${id}`,
    APPLY: '/api/discounts/apply',
    VALIDATE: '/api/discounts/validate',
  },

  // Upload Endpoints
  UPLOAD: {
    IMAGE: '/api/upload/image',
    IMAGES: '/api/upload/images',
    DELETE_FILE: (filename) => `/api/upload/file/${filename}`,
  },

  // Health Check
  HEALTH: '/api/health',
  HEALTH_DATABASE: '/api/health/database',
};

/**
 * Helper function to build full API URL
 * @param {string} endpoint - API endpoint path
 * @returns {string} Full API URL
 */
export const buildFullApiUrl = (endpoint) => {
  return `${config.api.baseUrl}${endpoint}`;
};

/**
 * Helper function to get headers for API requests
 * @param {boolean} includeAuth - Whether to include authorization header
 * @param {object} additionalHeaders - Additional headers to merge
 * @returns {object} Headers object
 */
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

/**
 * Helper function to get file upload headers
 * @param {boolean} includeAuth - Whether to include authorization header
 * @returns {object} Headers object for file upload
 */
export const getFileUploadHeaders = (includeAuth = true) => {
  const headers = {
    // Don't set Content-Type for FormData, let browser set it with boundary
  };

  if (includeAuth) {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * API Response Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * API Error Messages
 */
export const API_ERRORS = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'Your session has expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

export default {
  API_ENDPOINTS,
  buildFullApiUrl,
  getApiHeaders,
  getFileUploadHeaders,
  HTTP_STATUS,
  API_ERRORS,
};
