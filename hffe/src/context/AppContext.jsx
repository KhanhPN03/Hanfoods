import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/userService';
import { authAPI, wishlistAPI } from '../services/apiService'; // Import authAPI and wishlistAPI for login/register
import { toast } from 'react-toastify';

// Create context
const AppContext = createContext();

// Create provider component
export const AppProvider = ({ children }) => {
  const navigate = useNavigate();  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(undefined); // undefined = loading
  const [isLoading, setIsLoading] = useState(true); // Changed to true for initial load
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const initialAuthCheckDone = useRef(false);
  const tokenRefreshTimer = useRef(null);
  const [productCache, setProductCache] = useState({
    featuredProducts: null,
    loadAttempts: 0,
    failedAttempts: 0,
    apiErrorTimestamp: null,
    timestamp: null,
    productDetails: {},
    fetchErrors: {},
  });

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    const newMenuState = !mobileMenuOpen;
    setMobileMenuOpen(newMenuState);
    const mainContainer = document.querySelector('.landingPageContainer');
    if (mainContainer) {
      if (newMenuState) {
        mainContainer.dataset.scrollPosition = window.pageYOffset;
        mainContainer.style.overflow = 'hidden';
      } else {
        mainContainer.style.overflow = 'auto';
        if (mainContainer.dataset.scrollPosition) {
          window.scrollTo(0, parseInt(mainContainer.dataset.scrollPosition || '0'));
        }
      }
    }
  };  // Notification system
  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    switch(type) {
      case 'success':
        toast.success(message, { autoClose: duration });
        break;
      case 'error':
        toast.error(message, { autoClose: duration });
        break;
      case 'warning':
        toast.warning(message, { autoClose: duration });
        break;
      default:
        toast.info(message, { autoClose: duration });
    }
  }, []);

  // Product cache functions (unchanged)
  const cacheProducts = (products, type = 'featuredProducts', isError = false) => {
    setProductCache((prev) => {
      const newFailedAttempts = isError ? prev.failedAttempts + 1 : 0;
      const apiErrorTimestamp = isError ? Date.now() : prev.apiErrorTimestamp;
      const fetchErrors = { ...prev.fetchErrors, [type]: isError };
      return {
        ...prev,
        [type]: products,
        loadAttempts: prev.loadAttempts + 1,
        failedAttempts: newFailedAttempts,
        apiErrorTimestamp,
        fetchErrors,
        timestamp: Date.now(),
      };
    });
  };

  const getCachedProducts = (type = 'featuredProducts') => productCache[type];

  const isCacheValid = (type = 'featuredProducts', maxAge = 1000 * 60 * 5) => {
    const hasValidCache =
      productCache[type] !== null &&
      productCache.timestamp &&
      Date.now() - productCache.timestamp < maxAge;
    const recentApiError =
      productCache.apiErrorTimestamp &&
      Date.now() - productCache.apiErrorTimestamp < 1000 * 60;
    const extendedCacheAfterErrors =
      productCache.failedAttempts >= 3 &&
      productCache.timestamp &&
      Date.now() - productCache.timestamp < 1000 * 60 * 20;
    const hasTypeError = productCache.fetchErrors[type] === true;
    return (
      hasValidCache ||
      (recentApiError && productCache[type] !== null) ||
      extendedCacheAfterErrors ||
      (hasTypeError && productCache[type] !== null)
    );
  };

  const cacheProductDetail = (productId, productData, isError = false) => {
    setProductCache((prev) => {
      const newFailedAttempts = isError ? prev.failedAttempts + 1 : prev.failedAttempts;
      const apiErrorTimestamp = isError ? Date.now() : prev.apiErrorTimestamp;
      return {
        ...prev,
        failedAttempts: newFailedAttempts,
        apiErrorTimestamp,
        productDetails: {
          ...prev.productDetails,
          [productId]: {
            data: productData,
            isError,
            timestamp: Date.now(),
          },
        },
      };
    });
  };

  const getCachedProductDetail = (productId) => productCache.productDetails[productId]?.data || null;

  const isProductCacheValid = (productId, maxAge = 1000 * 60 * 5) => {
    const cached = productCache.productDetails[productId];
    const hasValidCache =
      cached && cached.timestamp && Date.now() - cached.timestamp < maxAge;
    const recentApiError =
      productCache.apiErrorTimestamp &&
      Date.now() - productCache.apiErrorTimestamp < 1000 * 60;
    const hasProductError = cached && cached.isError === true;
    const extendedCacheForErrors =
      cached &&
      cached.isError === true &&
      cached.timestamp &&
      Date.now() - cached.timestamp < 1000 * 60 * 20;
    return (
      hasValidCache ||
      (recentApiError && cached) ||
      extendedCacheForErrors ||
      (hasProductError && cached && cached.data)
    );
  };

  // Authentication functions
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      const { data } = response;
      if (data.success && data.user) {
        const token = data.token || `temp_token_${Date.now()}`;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setupTokenRefresh();
        // --- Đồng bộ cart từ backend về frontend ---
        try {
          const cartData = await UserService.syncCart([]); // Lấy cart từ backend
          setCart(cartData);
          localStorage.setItem('coconature_cart', JSON.stringify(cartData));
        } catch (err) {
          console.error('Error syncing cart after login:', err);
        }
        addNotification('Đăng nhập thành công!', 'success');
        return { success: true };
      }
      return { success: false, message: 'Đăng nhập thất bại' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng nhập thất bại',
      };
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const { data } = await authAPI.register(userData);
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setupTokenRefresh();
        addNotification('Đăng ký thành công!', 'success');
        return { success: true };
      }
      // Nếu API trả về thông báo lỗi cụ thể
      return { 
        success: false, 
        message: data.message || 'Đăng ký thất bại'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng ký thất bại',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current);
        tokenRefreshTimer.current = null;
      }
      await UserService.logout(); // Call backend logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setSessionExpired(false);
      setCart([]); // Clear cart on logout
      setWishlist([]); // Clear wishlist on logout
      addNotification('Đăng xuất thành công!', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      addNotification('Có lỗi xảy ra khi đăng xuất', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setIsLoading(true);
      const { data } = await authAPI.updateProfile(userData);
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user)); // Update cached user
        addNotification('Cập nhật hồ sơ thành công!', 'success');
        return { success: true };
      }
      return { success: false, message: 'Cập nhật hồ sơ thất bại' };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Cập nhật hồ sơ thất bại',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const setupTokenRefresh = useCallback(() => {
    if (tokenRefreshTimer.current) {
      clearTimeout(tokenRefreshTimer.current);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping token refresh setup');
      return;
    }

    tokenRefreshTimer.current = setTimeout(async () => {
      try {
        await UserService.refreshToken();
        console.log('Token refreshed successfully');
        setupTokenRefresh(); // Recursively set up next refresh
      } catch (error) {
        console.error('Token refresh failed:', error);
        setTimeout(() => {
          setupTokenRefresh();
        }, 60 * 1000);
        if (error.response?.status === 401) {
          setSessionExpired(true);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    }, 55 * 60 * 1000); // 55 minutes

    return () => {
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current);
      }
    };
  }, []);

  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      initialAuthCheckDone.current = true;
      return;
    }
    try {
      setIsLoading(true);
      const cachedUser = UserService.getUserFromStorage();
      if (cachedUser) {
        setUser(cachedUser);
      }
      const response = await UserService.getProfile();
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        setupTokenRefresh();
      }
      initialAuthCheckDone.current = true;
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setSessionExpired(true);
    } finally {      setIsLoading(false);
    }
  }, [setupTokenRefresh]);

  // Initial auth check and cart restore
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedWishlist = localStorage.getItem('coconature_wishlist');

    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    const fetchCart = async () => {
      if (token) {
        // Nếu đã đăng nhập, luôn lấy cart từ backend
        try {
          const cartData = await UserService.syncCart([]);
          setCart(cartData);
          localStorage.setItem('coconature_cart', JSON.stringify(cartData));
        } catch (err) {
          setCart([]);
          localStorage.setItem('coconature_cart', '[]');
        }
      } else {
        // Nếu chưa đăng nhập, lấy cart từ localStorage
        const savedCart = localStorage.getItem('coconature_cart');
        if (savedCart) setCart(JSON.parse(savedCart));
      }
    };

    fetchCart();
    checkAuthStatus();

    const handleUserActivity = () => {
      if (sessionExpired) {
        checkAuthStatus();
      }
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current);
      }
    };
  }, [sessionExpired, checkAuthStatus]);

  // Handle session expiration
  useEffect(() => {
    if (sessionExpired) {
      addNotification('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'warning', 5000);
      setAuthModalOpen(true);
      navigate('/login');
    }
  }, [sessionExpired, addNotification, navigate]);  // Cart functions (unchanged except for logout clearing)
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!user) {
        addNotification('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!', 'warning');
        navigate('/login');
        return;
      }      
      
      // Trích xuất dữ liệu cần thiết từ product
      let productId = product._id || product.id;
      let productName = product.name;
      
      // Xác định số lượng chính xác dựa trên cấu trúc của dữ liệu đầu vào
      let actualQuantity;
      
      // Nếu product là object có chứa thuộc tính quantity
      if (product.quantity !== undefined) {
        actualQuantity = product.quantity;
        console.log("Lấy quantity từ object product:", product.quantity);
      } 
      // Nếu tham số quantity được truyền riêng
      else {
        actualQuantity = quantity;
        console.log("Lấy quantity từ tham số thứ 2:", quantity);
      }
        const safeQuantity = Math.max(1, parseInt(actualQuantity) || 1);
      
      console.log('AppContext - Adding to cart:', {
        productId,
        productName,
        actualQuantity,
        safeQuantity,
        originalProduct: product
      });
        try {
        // Gọi API addToCart, lấy cart mới nhất từ backend
        const response = await UserService.addToCart(productId, safeQuantity);
        if (response && response.cart) {
          // Use consistent data transformation with syncCart
          const transformedCart = response.cart.items.map(item => {
            const productData = item.productId;
            let price = 0;
            if (typeof productData.salePrice === 'number' && productData.salePrice > 0) {
              price = productData.salePrice;
            } else if (typeof productData.price === 'number') {
              price = productData.price;
            } else {
              price = 0;
            }
            return {
              id: productData._id || productData.id,
              name: productData.name,
              price: price, // always a number
              quantity: item.quantity,
              image: productData.images || productData.thumbnailImage || productData.imageUrl || (Array.isArray(productData.images) && productData.images.length > 0 ? productData.images[0] : `https://via.placeholder.com/100x100?text=${encodeURIComponent(productData.name)}`)
            };
          });
          setCart(transformedCart);
        }
        addNotification(`Đã thêm ${productName} vào giỏ hàng!`, 'success');
      } catch (error) {
        addNotification('Có lỗi khi thêm vào giỏ hàng!', 'error');
        console.error('Error syncing cart with backend:', error);
      }
    },
    [user, addNotification, navigate]
  );
  const removeFromCart = useCallback(
    async (productId) => {
      if (!user) {
        addNotification('Bạn cần đăng nhập để xóa sản phẩm khỏi giỏ hàng!', 'warning');
        navigate('/login');
        return;
      }
      
      try {
        const response = await UserService.removeFromCart(productId);
        if (response && response.cart) {
          // Use consistent data transformation
          const transformedCart = response.cart.items.map(item => {
            const productData = item.productId;
            let price = 0;
            if (typeof productData.salePrice === 'number' && productData.salePrice > 0) {
              price = productData.salePrice;
            } else if (typeof productData.price === 'number') {
              price = productData.price;
            } else {
              price = 0;
            }
            return {
              id: productData._id || productData.id,
              name: productData.name,
              price: price,
              quantity: item.quantity,
              image: productData.images || productData.thumbnailImage || productData.imageUrl || (Array.isArray(productData.images) && productData.images.length > 0 ? productData.images[0] : `https://via.placeholder.com/100x100?text=${encodeURIComponent(productData.name)}`)
            };
          });
          setCart(transformedCart);
        }
        addNotification('Đã xóa sản phẩm khỏi giỏ hàng!', 'info');
      } catch (error) {
        console.error('Error syncing cart removal with backend:', error);
        addNotification('Có lỗi khi xóa sản phẩm khỏi giỏ hàng!', 'error');
      }
    },
    [user, addNotification, navigate]
  );
  const updateCartItemQuantity = useCallback(
    async (productId, quantity) => {
      if (!user) {
        addNotification('Bạn cần đăng nhập để thay đổi số lượng sản phẩm!', 'warning');
        navigate('/login');
        return;
      }
      const safeQuantity = Math.max(1, parseInt(quantity) || 1);
      
      try {
        const response = await UserService.updateCartItem(productId, safeQuantity);
        if (response && response.cart) {
          // Use consistent data transformation
          const transformedCart = response.cart.items.map(item => {
            const productData = item.productId;
            let price = 0;
            if (typeof productData.salePrice === 'number' && productData.salePrice > 0) {
              price = productData.salePrice;
            } else if (typeof productData.price === 'number') {
              price = productData.price;
            } else {
              price = 0;
            }
            return {
              id: productData._id || productData.id,
              name: productData.name,
              price: price,
              quantity: item.quantity,
              image: productData.images || productData.thumbnailImage || productData.imageUrl || (Array.isArray(productData.images) && productData.images.length > 0 ? productData.images[0] : `https://via.placeholder.com/100x100?text=${encodeURIComponent(productData.name)}`)
            };
          });
          setCart(transformedCart);
        }
      } catch (error) {
        console.error('Error syncing cart update with backend:', error);
        addNotification('Có lỗi khi cập nhật số lượng!', 'error');
      }
    },
    [user, addNotification, navigate]
  );

  const clearCart = useCallback(
    async () => {
      setCart([]);
      if (user) {
        try {
          await UserService.clearCart();
        } catch (error) {
          console.error('Error syncing cart clear with backend:', error);
        }
      }
      addNotification('Đã xóa tất cả sản phẩm khỏi giỏ hàng!', 'info');
    },
    [user, addNotification]
  );

  // Wishlist functions
  const addToWishlist = async (product) => {
    try {
      // Gọi API backend để thêm vào wishlist
      await wishlistAPI.addToWishlist(product.id || product._id);
      // Sau khi thành công, đồng bộ lại wishlist từ backend
      await fetchWishlistFromServer();
      addNotification(`Đã thêm ${product.name} vào danh sách yêu thích!`, 'success');
    } catch (err) {
      addNotification('Không thể thêm vào danh sách yêu thích!', 'error');
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    addNotification('Đã xóa sản phẩm khỏi danh sách yêu thích!', 'info');
  };

  // Hàm mới: fetch wishlist từ server
  const fetchWishlistFromServer = async () => {
    try {
      const res = await wishlistAPI.getWishlist();
      if (res.data.success) {
        setWishlist(res.data.wishlist?.products || []);
      }
    } catch (err) {
      // Có thể xử lý lỗi nếu cần
    }
  };

  // Save cart and wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('coconature_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage', error);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('coconature_wishlist', JSON.stringify(wishlist));
    } catch (error) {
      console.error('Error saving wishlist to localStorage', error);
    }
  }, [wishlist]);
  const value = {
    mobileMenuOpen,
    setMobileMenuOpen,
    toggleMobileMenu,
    isLoading,
    setIsLoading,
    addNotification,
    sessionExpired,
    user,
    setUser,
    authModalOpen,
    setAuthModalOpen,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
    setupTokenRefresh,
    cart,
    setCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    fetchWishlistFromServer,
    cacheProducts,
    getCachedProducts,
    isCacheValid,
    cacheProductDetail,
    getCachedProductDetail,
    isProductCacheValid,
  };

  return (
    <AppContext.Provider value={value}>
      {isLoading ? <div>Đang kiểm tra trạng thái đăng nhập...</div> : children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;