import axios from 'axios';
import config from '../config/environment';
import { API_ENDPOINTS, getApiHeaders } from '../config/api';

// Create axios instance with centralized configuration
const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
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
      localStorage.removeItem('adminUser');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Admin API service
class AdminApiService {
  // Expose the axios instance for direct API calls if needed
  static api = api;
    // Dashboard APIs
  async getDashboardStats() {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.DASHBOARD.STATS);
      return response.data.data; // Return the data property from backend response
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRecentOrders(limit = 10) {
    try {
      const response = await api.get(`${API_ENDPOINTS.ADMIN.DASHBOARD.RECENT_ORDERS}?limit=${limit}`);
      return response.data; // Backend returns { success: true, orders: [...] }
    } catch (error) {
      throw this.handleError(error);
    }
  }async getRevenueAnalytics(period = '30d') {
    try {
      const response = await api.get(`/api/admin/orders/revenue?period=${period}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Additional methods for AdminProductManagement
  async getProducts(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/api/products${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getProductStats() {
    try {
      const response = await api.get('/api/admin/products/stats');
      return response.data.stats || response.data;
    } catch (error) {
      // If the endpoint doesn't exist, calculate stats from products
      try {
        const productsResponse = await this.getAllProducts();
        const products = productsResponse.products || [];
        
        const stats = {
          totalProducts: products.length,
          activeProducts: products.filter(p => p.status === 'active' || p.isActive).length,
          outOfStock: products.filter(p => (p.stock || 0) === 0).length,
          totalValue: products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0)
        };
        
        return stats;
      } catch (fallbackError) {
        throw this.handleError(error);
      }
    }
  }

  // Additional methods for AdminAccountManagement
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/api/admin/users?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  // Product Management APIs
  async getAllProducts(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/api/products${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async createProduct(productData) {
    try {
      // Check if productData is FormData (file upload)
      if (productData instanceof FormData) {
        const response = await api.post('/api/products/with-images', productData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Traditional JSON data
        const response = await api.post('/api/products', productData);
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProduct(productId, productData) {
    try {
      const response = await api.put(`/api/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteProduct(productId) {
    try {
      const response = await api.delete(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Check if product has existing orders before deletion
  async checkProductOrders(productId) {
    try {
      const response = await api.get(`/api/products/${productId}/orders/check`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTopProducts(limit = 10, sortBy = 'sales') {
    try {
      const response = await api.get(`/api/products/admin/top-products?limit=${limit}&sortBy=${sortBy}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getLowStockProducts(threshold = 10) {
    try {
      const response = await api.get(`/api/products/admin/low-stock?threshold=${threshold}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkUpdateProducts(productIds, updates) {
    try {
      const response = await api.post('/api/products/admin/bulk-update', {
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
    try {    const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/api/admin/orders${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getOrderById(orderId) {
    try {
      const response = await api.get(`/api/admin/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const response = await api.patch(`/api/admin/orders/${orderId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }  async getOrderStats() {
    try {
      const response = await api.get('/api/admin/orders/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // User Management APIs
  async getAllUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/api/admin/users?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createUser(userData) {
    try {
      const response = await api.post('/api/admin/users', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserById(userId) {
    try {
      const response = await api.get(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUserStatus(userId, isActive) {
    try {
      const response = await api.patch(`/api/admin/users/${userId}/status`, { isActive });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUserRole(userId, role) {
    try {
      const response = await api.patch(`/api/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteUser(userId) {
    try {
      const response = await api.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Check if user has existing orders before deletion
  async checkUserOrders(userId) {
    try {
      const response = await api.get(`/api/admin/users/${userId}/orders/check`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getUserStats(timeRange = '30d') {
    try {
      const response = await api.get(`/api/admin/users/stats?timeRange=${timeRange}`);
      return response.data.data || response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/api/admin/users/export?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  // Discount Management APIs
  async getAllDiscounts(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/api/discounts${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDiscountById(id) {
    try {
      const response = await api.get(`/api/discounts/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createDiscount(discountData) {
    try {
      const response = await api.post('/api/discounts', discountData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateDiscount(id, discountData) {
    try {
      const response = await api.patch(`/api/discounts/${id}`, discountData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteDiscount(id) {
    try {
      const response = await api.delete(`/api/discounts/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDiscountStats() {
    try {
      const response = await api.get('/api/discounts');
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
      const response = await api.get('/api/discounts/export', {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateDiscountCode(code, orderAmount) {
    try {
      const response = await api.post('/api/discounts/validate', { code, orderAmount });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async applyDiscountCode(code, orderAmount) {
    try {
      const response = await api.post('/api/discounts/apply', { code, orderAmount });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  // Category Management APIs
  async getAllCategories() {
    try {
      const response = await api.get('/api/categories');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await api.post('/api/categories', categoryData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCategory(categoryId, categoryData) {
    try {
      const response = await api.put(`/api/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteCategory(categoryId) {
    try {
      const response = await api.delete(`/api/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  // Settings APIs
  async getSettings() {
    try {
      const response = await api.get('/api/admin/settings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSettings(settings) {
    try {
      const response = await api.put('/api/admin/settings', settings);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  // Export APIs
  async exportProducts(filters = {}, format = 'csv') {
    try {
      const queryString = new URLSearchParams({ ...filters, format }).toString();
      const response = await api.get(`/api/products/admin/export?${queryString}`, {
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
      const response = await api.get(`/api/admin/orders/export?${queryString}`, {
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

      const response = await api.post('/api/upload', formData, {
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
      const response = await api.get(`/api/admin/revenue/stats?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDetailedRevenue(startDate, endDate, category = null) {
    try {
      let url = `/api/admin/revenue/detailed?startDate=${startDate}&endDate=${endDate}`;
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
      const response = await api.get(`/api/admin/revenue/export?startDate=${startDate}&endDate=${endDate}&format=${format}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTopProductsByRevenue(limit = 10, timeRange = '30d') {
    try {
      const response = await api.get(`/api/admin/revenue/top-products?limit=${limit}&timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCategoryRevenueBreakdown(timeRange = '30d') {
    try {
      const response = await api.get(`/api/admin/revenue/categories?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMonthlyRevenueChart(months = 12) {
    try {
      const response = await api.get(`/api/admin/revenue/monthly-chart?months=${months}`);
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
// Also expose the api instance for direct access
adminApiService.api = api;
export default adminApiService;
