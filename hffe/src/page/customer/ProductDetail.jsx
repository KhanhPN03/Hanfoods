import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Import components
import MainHeader from '../../components/shared/MainHeader';
import MainFooter from '../../components/shared/MainFooter';
import ProductGallery from './customerComponent/ProductGallery';
import ProductInfo from './customerComponent/ProductInfo';
import ProductTabs from './customerComponent/ProductTabs';
import ProductSuggestions from './customerComponent/ProductSuggestions';

// Import context and services
import { useAppContext } from '../../context/AppContext';
import { productAPI } from '../../services/apiService';

// Import styles
import './css/newProductDetail.css'; // New comprehensive product detail styling
// Không cần scrollFix.css vì đã có CSS tương tự trong newProductDetail.css

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { cart, addNotification } = useAppContext();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Calculate cart item count for the header badge
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Fallback product data in case API fails - will be removed in production
 
  
  // Effect to handle product loading with real API data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Simple scroll to top without animation - fix for scrolling issues
        window.scrollTo(0, 0);
        
        let productData = null;
        
        try {
          // Try to fetch product from API with extended timeout
          console.log("Fetching product with ID:", id);
          
          // Using new timeout setting from apiService enhancement
          const response = await productAPI.getProductById(id);
          console.log("API Response:", response);
          
          // Check if we have valid product data
          if (response.data && response.data.product) {
            productData = response.data.product;
            console.log("Product data retrieved:", productData);
          } else {
            throw new Error("Invalid product data format");
          }
        } catch (apiError) {
          console.error("API fetch error:", apiError);
          
          // Handle different types of errors
          if (apiError.code === 'ECONNABORTED') {
            addNotification("Thời gian kết nối quá lâu, vui lòng thử lại sau.", "warning", 5000);
          } else {
            addNotification("Không thể kết nối với máy chủ.", "warning", 5000);
          }
          
          // Try to fetch data with direct fetch API as a backup approach (no credentials/cookies)
          try {
            console.log("Trying direct fetch as backup with longer timeout");
            
            // Create a new AbortController with a longer timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
            
            const backupResponse = await fetch(`http://localhost:5000/api/products/${id}`, {
              signal: controller.signal,
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (backupResponse.ok) {
              const backupData = await backupResponse.json();
              if (backupData && backupData.product) {
                productData = backupData.product;
                console.log("Product data retrieved via backup fetch:", productData);
                addNotification("Đã tải dữ liệu sản phẩm thành công.", "success", 3000);
              } else {
                throw new Error("Invalid product data format from backup fetch");
              }
            } else {
              throw new Error(`HTTP error ${backupResponse.status}`);
            }
          } catch (backupError) {
            console.error("Backup fetch also failed:", backupError);
            addNotification("Không thể kết nối với máy chủ sau nhiều lần thử. Vui lòng thử lại sau.", "error", 5000);
            
            // Add a delay to prevent too rapid retries
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Format the product for our components and ensure all fields exist
        let formattedProduct = null;
        
        if (productData) {
          // Hàm kiểm tra URL hợp lệ cho hình ảnh
          const getValidImageUrl = (url) => {
            if (!url || typeof url !== 'string' || url.trim() === '' || 
                (!url.startsWith('http://') && !url.startsWith('https://')) ||
                url.includes('via.placeholder.com')) {
              const productName = productData.name ? productData.name.replace(/\s+/g, '+') : 'Product';
              return `https://placeholder.pics/svg/500x500/${productName}`;
            }
            return url;
          };
          
          // Kiểm tra và chuẩn hóa thumbnailImage
          const safeThumbnail = getValidImageUrl(productData.thumbnailImage);
          
          // Kiểm tra và chuẩn hóa images array
          const safeImages = Array.isArray(productData.images) ? 
            productData.images.map(img => getValidImageUrl(img)) : 
            [safeThumbnail];
          console.log("safe img", safeThumbnail);
          
          formattedProduct = {  
            id: productData.id || productData._id || '',
            name: productData.name || 'Sản phẩm',
            description: productData.description || 'Không có mô tả',
            price: productData.price || 0,
            originalPrice: productData.originalPrice || null,
            discount: productData.discount || null,
            rating: productData.rating || 4.5,
            reviewCount: productData.reviewCount || 0,
            stock: productData.stock || 0,
            inStock: productData.stock > 0,
            // Sử dụng URL hình ảnh đã kiểm tra
            thumbnailImage: safeThumbnail,
            // Backward compatibility
            mainImage: safeThumbnail,
            imageUrl: safeThumbnail,
            // Sử dụng mảng hình ảnh đã kiểm tra
            images: safeImages,
            // Additional props needed by components
            category: productData.category || productData.categoryId?.name || 'Sản phẩm',
            materials: productData.materials || 'Vỏ dừa tự nhiên',
            dimensions: productData.dimensions || 'Đường kính: 10cm, Chiều cao: 12cm',
            stockQuantity: productData.stock || 0,
            sold: productData.sold || 0,
          };
        } else {
          // Fallback data when API fails completely
          setError("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.");
        }
        
        setProduct(formattedProduct);
      } catch (error) {
        console.error("Error loading product:", error);
        setError("Đã xảy ra lỗi khi tải thông tin sản phẩm.");
        addNotification("Không thể tải thông tin sản phẩm", "error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Suppressing ESLint warning for addNotification to prevent excessive re-renders
  
  return (
    <div className="product-detail-page">
      {/* Main Header */}
      <MainHeader />
      
      {loading && (
        <div className="product-loading">
          <div className="product-loading-spinner"></div>
          <h2>Đang tải thông tin sản phẩm...</h2>
        </div>
      )}
      
      {error && !loading && (
        <div className="product-error scroll-container">
          <h2>Lỗi</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-to-home-btn">
            Quay lại Trang chủ
          </button>
        </div>
      )}
      
      {!loading && !error && product && (
        <>
          <main className="product-detail-main">
            {/* Product Top Section with Gallery and Info */}
            <div className="product-detail-top-bg">
              <section className="product-main-wrapper">
                {/* Product Gallery Component */}
                <div className="product-gallery-container">
                  <ProductGallery product={product} />
                </div>
                
                {/* Product Info Component */}
                <div className="product-info-container">
                  <div className="product-breadcrumb">
                    <a href="/">Trang chủ</a>
                    <span className="breadcrumb-separator">/</span>
                    <a href="/#products">Sản phẩm</a>
                    <span className="breadcrumb-separator">/</span>
                    <a href={`/category/${product.category}`}>{product.category}</a>
                    <span className="breadcrumb-separator">/</span>
                    <span>{product.name}</span>
                  </div>
                  <ProductInfo product={product} />
                </div>
              </section>
            </div>
            
            {/* Product Tabs Component */}
            <section className="product-tabs-section">
              <ProductTabs product={product} />
            </section>
            
            {/* Product Suggestions Component */}
            <section className="related-products-section">
              <div className="container">
                <h2 className="section-title">Có thể bạn quan tâm</h2>
                <div className="related-products-wrapper">
                  <ProductSuggestions currentProductId={product.id} />
                </div>
              </div>
            </section>
          </main>
          
          {/* Footer Component */}
          <MainFooter />
        </>
      )}
      
      {!loading && !error && !product && (
        <div className="product-not-found scroll-container">
          <h2>Sản phẩm không tồn tại</h2>
          <p>Sản phẩm bạn đang tìm kiếm không được tìm thấy.</p>
          <button onClick={() => navigate('/')} className="back-to-home-btn">
            Quay lại Trang chủ
          </button>
        </div>
      )}
      
    </div>
  );
};

export default ProductDetail;
