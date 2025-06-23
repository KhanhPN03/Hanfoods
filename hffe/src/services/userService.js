import { authAPI, cartAPI, orderAPI } from './apiService';

class UserService {
  // Authentication methods
  static async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('token', response.data.token);
      // Lưu thêm thông tin người dùng vào localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  static async register(userData) {
    try {
      const response = await authAPI.register(userData);
      
      // Lưu token và thông tin người dùng khi đăng ký thành công
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  static async logout() {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      // Xóa cả thông tin người dùng
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error', error);
      // Still remove token even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  static async getProfile() {
    try {
      const response = await authAPI.getProfile();
      // Cập nhật thông tin người dùng trong localStorage
      if (response.data && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  // Tải thông tin người dùng từ localStorage
  static getUserFromStorage() {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error getting user from storage', error);
      return null;
    }
  }
  static async refreshToken() {
    try {
      const response = await authAPI.refreshToken();
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Nếu response trả về thông tin user mới, cập nhật luôn
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (error) {
      console.error('Token refresh error', error);
      throw this.handleError(error);
    }
  }

  // Cart operations
  static async syncCart(localCart) {
    if (!localStorage.getItem('token')) {
      return localCart; // No sync needed if not logged in
    }

    try {
      // Get server cart
      const serverResponse = await cartAPI.getCart();
      const serverCart = serverResponse.data.cart?.items || [];

      // If server cart is empty but local cart has items, upload local cart
      if (serverCart.length === 0 && localCart.length > 0) {
        console.log('Syncing local cart to server:', localCart);

        // First clear the server cart to ensure clean state
        await cartAPI.clearCart();

        // Add each item from local cart to server
        for (const item of localCart) {
          await cartAPI.addToCart(item.id, item.quantity);
        }
        return localCart;
      }
      // If server cart has items, replace local cart with server cart
      else if (serverCart.length > 0) {
        console.log('Syncing server cart to local:', serverCart);

        // Transform server cart to local format
        return serverCart.map(item => {
          console.log("log from" , item);
          
          const productData = item.productId;
          // Lấy giá số, không lấy chuỗi đã format
          let price = 0;
          if (typeof productData.salePrice === 'number' && productData.salePrice > 0) {
            price = productData.salePrice;
          } else if (typeof productData.price === 'number') {
            price = productData.price;
          } else {
            price = 0;
          }          // Xử lý URL ảnh một cách chính xác
          let imageUrl = '';
          if (productData.thumbnailImage && typeof productData.thumbnailImage === 'string') {
            imageUrl = productData.thumbnailImage;
          } else if (Array.isArray(productData.images) && productData.images.length > 0) {
            imageUrl = productData.images[0];
          } else if (typeof productData.images === 'string') {
            imageUrl = productData.images;
          } else if (productData.imageUrl && typeof productData.imageUrl === 'string') {
            imageUrl = productData.imageUrl;
          } else {
            imageUrl = `https://via.placeholder.com/100x100?text=${encodeURIComponent(productData.name || 'Sản phẩm')}`;
          }
          
          return {
            id: productData._id || productData.id,
            name: productData.name,
            price: price, // luôn là số
            quantity: item.quantity,
            image: imageUrl
          };
        });
      }

      return localCart;
    } catch (error) {
      console.error('Cart sync error', error);
      return localCart; // Return local cart if sync fails
    }
  }
  static async addToCart(productId, quantity) {
    try {
      console.log('UserService - Adding to cart:', { productId, quantity });
      const response = await cartAPI.addToCart(productId, quantity);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async removeFromCart(productId) {
    try {
      const response = await cartAPI.removeFromCart(productId);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async updateCartItem(productId, quantity) {
    try {
      const response = await cartAPI.updateCartItem(productId, quantity);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async clearCart() {
    try {
      const response = await cartAPI.clearCart();
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Order operations
  static async createOrder(orderData) {
    try {
      const response = await orderAPI.createOrder(orderData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getUserOrders() {
    try {
      const response = await orderAPI.getUserOrders();
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  static handleError(error) {
    if (error.response) {
      // Server responded with error
      return {
        status: error.response.status,
        message: error.response.data.message || 'Lỗi từ máy chủ',
        error: error.response.data
      };
    } else if (error.request) {
      // No response received
      return {
        status: 0,
        message: 'Không thể kết nối tới máy chủ',
        error
      };
    } else {
      // Error setting up request
      return {
        status: 0,
        message: 'Lỗi khi gửi yêu cầu',
        error
      };
    }
  }
}

export default UserService;
