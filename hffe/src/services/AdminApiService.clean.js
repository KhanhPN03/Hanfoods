import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admin API service
class AdminApiService {
  // Dashboard APIs
  async getDashboardStats() {
    try {
      const [productStats, orderStats, userStats] = await Promise.all([
        api.get('/products/admin/stats'),
        api.get('/orders/admin/stats'),
        api.get('/auth/admin/user-stats')
      ]);

      return {
        products: productStats.data,
        orders: orderStats.data,
        users: userStats.data
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRecentOrders(limit = 10) {
    try {
      const response = await api.get(`/orders/admin/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRevenueAnalytics(period = '30d') {
    try {
      const response = await api.get(`/orders/admin/revenue?period=${period}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Product Management APIs
  async getAllProducts(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/products${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProduct(productId, productData) {
    try {
      const response = await api.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteProduct(productId) {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTopProducts(limit = 10, sortBy = 'sales') {
    try {
      const response = await api.get(`/products/admin/top-products?limit=${limit}&sortBy=${sortBy}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getLowStockProducts(threshold = 10) {
    try {
      const response = await api.get(`/products/admin/low-stock?threshold=${threshold}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkUpdateProducts(productIds, updates) {
    try {
      const response = await api.post('/products/admin/bulk-update', {
        productIds,
        updates
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Order Management APIs
  async getAllOrders(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/orders${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrderById(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const response = await api.put(`/orders/admin/status/${orderId}`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // User Management APIs
  async getAllUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/admin/users?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserById(userId) {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUserStatus(userId, isActive) {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUserRole(userId, role) {
    try {
      const response = await api.patch(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserStats(timeRange = '30d') {
    try {
      const response = await api.get(`/admin/users/stats?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/admin/users/export?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Discount Management APIs
  async getAllDiscounts(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/discounts${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDiscountById(id) {
    try {
      const response = await api.get(`/discounts/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createDiscount(discountData) {
    try {
      const response = await api.post('/discounts', discountData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateDiscount(id, discountData) {
    try {
      const response = await api.patch(`/discounts/${id}`, discountData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteDiscount(id) {
    try {
      const response = await api.delete(`/discounts/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDiscountStats() {
    try {
      const response = await api.get('/discounts');
      const discounts = response.data.discounts || [];
      
      const now = new Date();
      const active = discounts.filter(d => {
        const start = new Date(d.startDate);
        const end = new Date(d.endDate);
        return now >= start && now <= end && !d.deleted;
      }).length;
      
      const expired = discounts.filter(d => {
        const end = new Date(d.endDate);
        return now > end && !d.deleted;
      }).length;
      
      const upcoming = discounts.filter(d => {
        const start = new Date(d.startDate);
        return now < start && !d.deleted;
      }).length;
      
      return {
        total: discounts.length,
        active,
        expired,
        upcoming
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportDiscounts() {
    try {
      const response = await api.get('/discounts/export', {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateDiscountCode(code, orderAmount) {
    try {
      const response = await api.post('/discounts/validate', { code, orderAmount });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async applyDiscountCode(code, orderAmount) {
    try {
      const response = await api.post('/discounts/apply', { code, orderAmount });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Category Management APIs
  async getAllCategories() {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCategory(categoryId, categoryData) {
    try {
      const response = await api.put(`/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteCategory(categoryId) {
    try {
      const response = await api.delete(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Settings APIs
  async getSettings() {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSettings(settings) {
    try {
      const response = await api.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Export APIs
  async exportProducts(filters = {}, format = 'csv') {
    try {
      const queryString = new URLSearchParams({ ...filters, format }).toString();
      const response = await api.get(`/products/admin/export?${queryString}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportOrders(filters = {}, format = 'csv') {
    try {
      const queryString = new URLSearchParams({ ...filters, format }).toString();
      const response = await api.get(`/orders/admin/export?${queryString}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // File Upload API
  async uploadImage(file, type = 'product') {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Revenue Management APIs
  async getRevenueStats(timeRange = '30d') {
    try {
      const response = await api.get(`/admin/revenue/stats?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDetailedRevenue(startDate, endDate, category = null) {
    try {
      let url = `/admin/revenue/detailed?startDate=${startDate}&endDate=${endDate}`;
      if (category) {
        url += `&category=${category}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportRevenueReport(startDate, endDate, format = 'excel') {
    try {
      const response = await api.get(`/admin/revenue/export?startDate=${startDate}&endDate=${endDate}&format=${format}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTopProductsByRevenue(limit = 10, timeRange = '30d') {
    try {
      const response = await api.get(`/admin/revenue/top-products?limit=${limit}&timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCategoryRevenueBreakdown(timeRange = '30d') {
    try {
      const response = await api.get(`/admin/revenue/categories?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMonthlyRevenueChart(months = 12) {
    try {
      const response = await api.get(`/admin/revenue/monthly-chart?months=${months}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error. Please check your connection.',
        status: 0
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1
      };
    }
  }
}

const adminApiService = new AdminApiService();
export default adminApiService;
