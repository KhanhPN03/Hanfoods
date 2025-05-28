import axios from 'axios';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for sessions
  timeout: 15000, // 15-second timeout
});

// Request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.debug(`API Request [${config.method.toUpperCase()}]: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Interceptor Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    console.debug(`API Response [${response.status}]: ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized and attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await authAPI.refreshToken();
        if (refreshResponse.data.success && refreshResponse.data.token) {
          // Store new token and user
          localStorage.setItem('token', refreshResponse.data.token);
          if (refreshResponse.data.user) {
            localStorage.setItem('user', JSON.stringify(refreshResponse.data.user));
          }
          // Update original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.token}`;
          return apiClient(originalRequest);
        }
        throw new Error('Refresh token failed');
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const sessionExpiredEvent = new CustomEvent('session-expired', {
          detail: { message: refreshError.message },
        });
        window.dispatchEvent(sessionExpiredEvent);
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      console.error(`API Error [${error.response.status}]: ${error.config.url}`, error.response.data);
      const message = error.response.data?.message || 'An error occurred';
      switch (error.response.status) {
        case 400:
          return Promise.reject({ ...error, message: `Bad Request: ${message}` });
        case 403:
          return Promise.reject({ ...error, message: `Forbidden: ${message}` });
        case 404:
          return Promise.reject({ ...error, message: `Not Found: ${message}` });
        case 500:
          return Promise.reject({ ...error, message: `Server Error: ${message}` });
        default:
          return Promise.reject({ ...error, message });
      }
    } else if (error.request) {
      if (error.code === 'ECONNABORTED') {
        console.error(`API Timeout: Request to ${error.config.url} timed out after ${error.config.timeout}ms`);
        return Promise.reject({ ...error, message: 'Request timed out' });
      }
      console.error(`API No Response:`, error.request);
      return Promise.reject({ ...error, message: 'No response received' });
    } else {
      console.error(`API Setup Error:`, error.message);
      return Promise.reject({ ...error, message: 'Request setup failed' });
    }
  }
);

// Auth API
export const authAPI = {
  register: (userData) =>
    apiClient.post('/auth/register', userData).then((res) => ({
      data: {
        success: res.data.success ?? true,
        token: res.data.token,
        user: res.data.user,
        message: res.data.message,
      },
    })),

  login: (credentials) =>
    apiClient.post('/auth/login', credentials).then((res) => ({
      data: {
        success: res.data.success ?? true,
        token: res.data.token,
        user: res.data.user,
        message: res.data.message,
      },
    })),

  googleLogin: () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `${API_URL}/auth/google`;
  },

  logout: () =>
    apiClient.post('/auth/logout').then((res) => ({
      data: {
        success: res.data.success ?? true,
        message: res.data.message || 'Logged out successfully',
      },
    })),
  getProfile: () =>
    apiClient.get('/auth/current-user').then((res) => ({
      data: {
        success: res.data.success ?? true,
        user: res.data.user,
        message: res.data.message,
      },
    })),

  updateProfile: (userData) =>
    apiClient.put('/auth/profile', userData).then((res) => ({
      data: {
        success: res.data.success ?? true,
        user: res.data.user,
        message: res.data.message,
      },
    })),

  changePassword: (passwordData) =>
    apiClient.post('/auth/change-password', passwordData).then((res) => ({
      data: {
        success: res.data.success ?? true,
        message: res.data.message,
      },
    })),

  refreshToken: () =>
    apiClient.post('/auth/refresh-token').then((res) => ({
      data: {
        success: res.data.success ?? true,
        token: res.data.token,
        user: res.data.user,
        message: res.data.message,
      },
    })),
};

// Product API
export const productAPI = {
  getAllProducts: (params) =>
    apiClient.get('/products', { params }).then((res) => ({
      data: {
        success: res.data.success ?? true,
        products: res.data.products,
        message: res.data.message,
      },
    })),

  getProductById: (id, options = {}) => {
    console.log(`Fetching product with ID: ${id} with custom options:`, options);
    return apiClient
      .get(`/products/${id}`, {
        ...options,
        timeout: 20000,
      })
      .then((res) => ({
        data: {
          success: res.data.success ?? true,
          product: res.data.product,
          message: res.data.message,
        },
      }));
  },

  searchProducts: (query) =>
    apiClient.get('/products/search', { params: { query } }).then((res) => ({
      data: {
        success: res.data.success ?? true,
        products: res.data.products,
        message: res.data.message,
      },
    })),

  getProductsByCategory: (categoryId) =>
    apiClient.get(`/products/category/${categoryId}`).then((res) => ({
      data: {
        success: res.data.success ?? true,
        products: res.data.products,
        message: res.data.message,
      },
    })),

  createProduct: (productData) =>
    apiClient.post('/products', productData).then((res) => ({
      data: {
        success: res.data.success ?? true,
        product: res.data.product,
        message: res.data.message,
      },
    })),

  updateProduct: (id, productData) =>
    apiClient.put(`/products/${id}`, productData).then((res) => ({
      data: {
        success: res.data.success ?? true,
        product: res.data.product,
        message: res.data.message,
      },
    })),

  deleteProduct: (id) =>
    apiClient.delete(`/products/${id}`).then((res) => ({
      data: {
        success: res.data.success ?? true,
        message: res.data.message,
      },
    })),
};

// Cart API
export const cartAPI = {
  getCart: () => 
    apiClient.get('/carts').then(res => ({
      data: {
        success: true,
        cart: res.data.cart,
        message: res.data.message
      }
    })),

  addToCart: (productId, quantity) => 
    apiClient.post('/carts/add', { productId, quantity }).then(res => ({
      data: {
        success: true,
        cart: res.data.cart,
        message: res.data.message
      }
    })),

  updateCartItem: (productId, quantity) => 
    apiClient.put('/carts/update', { productId, quantity }).then(res => ({
      data: {
        success: true,
        cart: res.data.cart,
        message: res.data.message
      }
    })),

  removeFromCart: (productId) => 
    apiClient.delete(`/carts/remove/${productId}`).then(res => ({
      data: {
        success: true,
        cart: res.data.cart,
        message: res.data.message
      }
    })),

  clearCart: () => 
    apiClient.delete('/carts/clear').then(res => ({
      data: {
        success: true,
        cart: res.data.cart,
        message: res.data.message
      }
    }))
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () =>
    apiClient.get('/wishlists').then((res) => ({
      data: {
        success: res.data.success ?? true,
        wishlist: res.data.wishlist,
        message: res.data.message,
      },
    })),

  addToWishlist: (productId) =>
    apiClient.post('/wishlists/add', { productId }).then((res) => ({
      data: {
        success: res.data.success ?? true,
        wishlist: res.data.wishlist,
        message: res.data.message,
      },
    })),
  removeFromWishlist: (productId) =>
    apiClient.delete(`/wishlists/remove/${productId}`).then((res) => ({
      data: {
        success: res.data.success ?? true,
        wishlist: res.data.wishlist,
        message: res.data.message,
      },
    })),  moveToCart: (productId) =>
    apiClient.post('/wishlists/move-to-cart', { productId }).then((res) => ({
      data: {
        success: res.data.success ?? true,
        cart: res.data.cart,
        wishlist: res.data.wishlist,
        message: res.data.message,
      },
    })),
};

// Address API
export const addressAPI = {
  getAllAddresses: () =>
    apiClient.get('/addresses').then((res) => ({
      data: {
        success: res.data.success ?? true,
        addresses: res.data.addresses,
        message: res.data.message,
      },
    })),

  getAddressById: (id) =>
    apiClient.get(`/addresses/${id}`).then((res) => ({
      data: {
        success: res.data.success ?? true,
        address: res.data.address,
        message: res.data.message,
      },
    })),

  createAddress: (addressData) =>
    apiClient.post('/addresses', addressData).then((res) => ({
      data: {
        success: res.data.success ?? true,
        address: res.data.address,
        message: res.data.message,
      },
    })),

  updateAddress: (id, addressData) =>
    apiClient.put(`/addresses/${id}`, addressData).then((res) => ({
      data: {
        success: res.data.success ?? true,
        address: res.data.address,
        message: res.data.message,
      },
    })),

  deleteAddress: (id) =>
    apiClient.delete(`/addresses/${id}`).then((res) => ({
      data: {
        success: res.data.success ?? true,
        message: res.data.message,
      },
    })),
};

// Payment API
export const paymentAPI = {
  getAllPaymentMethods: () =>
    apiClient.get('/payments').then((res) => ({
      data: {
        success: res.data.success ?? true,
        paymentMethods: res.data.paymentMethods,
        message: res.data.message,
      },
    })),

  processCashOnDelivery: (orderId) =>
    apiClient.post('/payments/cash-on-delivery', { orderId }).then((res) => ({
      data: {
        success: res.data.success ?? true,
        payment: res.data.payment,
        message: res.data.message,
      },
    })),

  processVietQR: (orderId) =>
    apiClient.post('/payments/vietqr', { orderId }).then((res) => ({
      data: {
        success: res.data.success ?? true,
        payment: res.data.payment,
        message: res.data.message,
      },
    })),

  getPaymentByOrderId: (orderId) =>
    apiClient.get(`/payments/order/${orderId}`).then((res) => ({
      data: {
        success: res.data.success ?? true,
        payment: res.data.payment,
        message: res.data.message,
      },
    })),
};

// Order API
export const orderAPI = {
  createOrder: (orderData) =>
    apiClient.post('/orders', orderData).then((res) => ({
      data: {
        success: res.data.success ?? true,
        order: res.data.order,
        message: res.data.message,
      },
    })),

  getUserOrders: () =>
    apiClient.get('/orders/user').then((res) => ({
      data: {
        success: res.data.success ?? true,
        orders: res.data.orders,
        message: res.data.message,
      },
    })),

  getOrderById: (id) =>
    apiClient.get(`/orders/${id}`).then((res) => ({
      data: {
        success: res.data.success ?? true,
        order: res.data.order,
        message: res.data.message,
      },
    })),

  cancelOrder: (id) =>
    apiClient.patch(`/orders/${id}/cancel`).then((res) => ({
      data: {
        success: res.data.success ?? true,
        message: res.data.message,
      },
    })),

  getAllOrders: (params) =>
    apiClient.get('/orders/admin', { params }).then((res) => ({
      data: {
        success: res.data.success ?? true,
        orders: res.data.orders,
        message: res.data.message,
      },
    })),

  updateOrderStatus: (id, status) =>
    apiClient.patch(`/orders/${id}/status`, { status }).then((res) => ({
      data: {
        success: res.data.success ?? true,
        order: res.data.order,
        message: res.data.message,
      },
    })),

  generateOrderReport: (startDate, endDate) =>
    apiClient
      .get('/orders/report', { params: { startDate, endDate } })
      .then((res) => ({
        data: {
          success: res.data.success ?? true,
          report: res.data.report,
          message: res.data.message,
        },
      })),
};

// Discount API
export const discountAPI = {
  validateDiscount: (code, orderAmount) =>
    apiClient.post('/discounts/validate', { code, orderAmount }).then((res) => ({
      data: {
        success: res.data.success ?? true,
        discount: res.data.discount,
        message: res.data.message,
      },
    })),

  applyDiscount: (code, orderAmount) =>
    apiClient.post('/discounts/apply', { code, orderAmount }).then((res) => ({
      data: {
        success: res.data.success ?? true,
        discount: res.data.discount,
        message: res.data.message,
      },
    })),

  getAllDiscounts: () =>
    apiClient.get('/discounts').then((res) => ({
      data: {
        success: res.data.success ?? true,
        discounts: res.data.discounts,
        message: res.data.message,
      },
    })),

  createDiscount: (discountData) =>
    apiClient.post('/discounts', discountData).then((res) => ({
      data: {
        success: res.data.success ?? true,
        discount: res.data.discount,
        message: res.data.message,
      },
    })),

  updateDiscount: (id, discountData) =>
    apiClient.patch(`/discounts/${id}`, discountData).then((res) => ({
      data: {
        success: res.data.success ?? true,
        discount: res.data.discount,
        message: res.data.message,
      },
    })),

  deleteDiscount: (id) =>
    apiClient.delete(`/discounts/${id}`).then((res) => ({
      data: {
        success: res.data.success ?? true,
        message: res.data.message,
      },
    })),
};

// Billing API
export const billingAPI = {
  getUserBillings: () =>
    apiClient.get('/billings/user').then((res) => ({
      data: {
        success: res.data.success ?? true,
        billings: res.data.billings,
        message: res.data.message,
      },
    })),

  getBillingById: (id) =>
    apiClient.get(`/billings/${id}`).then((res) => ({
      data: {
        success: res.data.success ?? true,
        billing: res.data.billing,
        message: res.data.message,
      },
    })),

  getAllBillings: (params) =>
    apiClient.get('/billings/admin', { params }).then((res) => ({
      data: {
        success: res.data.success ?? true,
        billings: res.data.billings,
        message: res.data.message,
      },
    })),

  updateBillingStatus: (id, status) =>
    apiClient.patch(`/billings/${id}/status`, { status }).then((res) => ({
      data: {
        success: res.data.success ?? true,
        billing: res.data.billing,
        message: res.data.message,
      },
    })),

  generateBillingReport: (startDate, endDate) =>
    apiClient
      .get('/billings/report', { params: { startDate, endDate } })
      .then((res) => ({
        data: {
          success: res.data.success ?? true,
          report: res.data.report,
          message: res.data.message,
        },
      })),
};

export default apiClient;