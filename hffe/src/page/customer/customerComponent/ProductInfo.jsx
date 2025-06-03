import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../context/AppContext';
import withProductValidation from '../hoc/withProductValidation';

const ProductInfo = ({ product }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { addToCart, addNotification } = useAppContext();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);
  
  // Maximum allowed quantity based on stock
  const maxQuantity = product?.stockQuantity || product?.stock || 999;

  const handleQuantityChange = (newQuantity) => {
    // Convert to number if it's a string (from input field)
    const quantity = parseInt(newQuantity, 10);
    
    // Validate the quantity
    if (isNaN(quantity) || quantity < 1) {
      setQuantity(1);
      return;
    }
    
    // Cap at maximum quantity
    if (maxQuantity && quantity > maxQuantity) {
      setQuantity(maxQuantity);
      return;
    }
    
    // Set the validated quantity
    setQuantity(quantity);
  };
  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    console.log('ProductInfo - Adding to cart with quantity:', quantity, typeof quantity);
    
    try {
      // Tạo đối tượng sản phẩm để thêm vào giỏ hàng
      const productToAdd = {
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        quantity: Number(quantity), // Đảm bảo quantity là số
        image: product.images,
        gift: selectedGift
      };
      
      console.log('ProductInfo - Product object to add:', productToAdd);
      
      await addToCart(productToAdd);
      addNotification(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`, "success");
    } catch (error) {
      console.error("Error adding product to cart:", error);
      addNotification("Không thể thêm sản phẩm vào giỏ hàng", "error");
    } finally {
      setIsAddingToCart(false);
    }
  };
    const handleBuyNow = async () => {
    if (!product) return;
    
    try {
      // First add to cart, then navigate to cart page
      setIsBuyingNow(true);
      
      // Tạo đối tượng sản phẩm để thêm vào giỏ hàng
      const productToAdd = {
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        quantity: Number(quantity), // Đảm bảo quantity là số
        image: product.images,
        gift: selectedGift
      };
      
      console.log('ProductInfo - Buy Now with quantity:', quantity, typeof quantity);
      console.log('ProductInfo - Buy Now product object:', productToAdd);
      
      await addToCart(productToAdd);
      navigate('/cart');
    } catch (error) {
      console.error("Error with buy now flow:", error);
      addNotification("Có lỗi xảy ra khi mua ngay", "error");
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Available gift options
  const giftOptions = [
    { id: 'gift-wrap', name: 'Gói quà đẹp', price: 25000 },
    { id: 'gift-card', name: 'Thiệp chúc mừng', price: 15000 },
    { id: 'premium-box', name: 'Hộp quà cao cấp', price: 50000 }
  ];
  
  if (!product) return <div>Đang tải thông tin sản phẩm...</div>;
  
  return (
    <div className="product-info">      
      <h1 className="product-title">{product.name}</h1>
      
      <div className="product-meta">
        <div className="product-rating">
          <span className="stars">
            {Array(Math.floor(product.rating || 0)).fill().map((_, i) => (
              <span key={i} className="star-icon filled">★</span>
            ))}
            {Array(5 - Math.floor(product.rating || 0)).fill().map((_, i) => (
              <span key={i} className="star-icon">☆</span>
            ))}
          </span>
          <span className="rating-value">{product.rating?.toFixed(1)}</span>
          <span className="review-count">({product.reviewCount || 0} đánh giá)</span>
          <span className="review-divider">|</span>
          <span className="sold-count">{product.sold || 85} đã bán</span>
        </div>
      </div>
      
      <div className="product-price-section">
        <span className="current-price">{product.price?.toLocaleString()}₫</span>
        {product.originalPrice && (
          <span className="original-price">{product.originalPrice?.toLocaleString()}₫</span>
        )}
        {product.discount && (
          <span className="discount-label">{product.discount} GIẢM</span>
        )}
      </div>
      
      {/* Shipping section */}
      <div className="shipping-section">
        <div className="section-label">Vận Chuyển</div>
        <div className="shipping-info">
          <div className="shipping-details">
            <div className="shipping-text">Miễn phí vận chuyển</div>
            <div className="shipping-note">Miễn phí vận chuyển cho đơn hàng từ 300.000₫</div>
          </div>
        </div>
      </div>
      
      {/* Gift options section */}
      <div className="gift-section">
        <div className="section-label">Tùy Chọn Quà Tặng</div>
        <div className="gift-options">
          <button 
            className={`gift-option ${selectedGift === null ? 'active' : ''}`}
            onClick={() => setSelectedGift(null)}
          >
            Không cần gói quà
          </button>
          
          {giftOptions.map(option => (
            <button 
              key={option.id} 
              className={`gift-option ${selectedGift === option.id ? 'active' : ''}`}
              onClick={() => setSelectedGift(option.id)}
            >
              {option.name} (+{option.price.toLocaleString()}₫)
            </button>
          ))}
        </div>
      </div>
      
      {/* Quantity selector */}
      <div className="quantity-section">
        <div className="section-label">Số Lượng</div>
        <div className="quantity-actions">
          <div className="quantity-selector">
            <button 
              className="qty-btn"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input 
              type="text" 
              className="qty-input"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              min="1"
              pattern="\d*"
              inputMode="numeric"
            />
            <button 
              className="qty-btn"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              +
            </button>
          </div>
          <div className={`stock-info ${(product.stock || 0) <= 10 && (product.stock || 0) > 0 ? 'low-stock' : ''} ${(product.stock || 0) <= 0 ? 'out-of-stock' : ''}`}>
            {(product.stock || 0) > 0 
              ? `${product.stock} sản phẩm có sẵn${(product.stock || 0) <= 10 ? ' (sắp hết hàng)' : ''}` 
              : 'Hết hàng'}
          </div>
        </div>
      </div>
      
      {/* Action buttons */}      
      <div className="product-actions">
        <button 
          className={`btn btn-add-to-cart ${isAddingToCart ? 'loading' : ''}`}
          onClick={handleAddToCart}
          disabled={!(product.inStock ?? true) || isAddingToCart || isBuyingNow}
          style={{ width: '50%' }}
        >
          <span className="text">
            {isAddingToCart 
              ? 'Đang Thêm...' 
              : 'Thêm Vào Giỏ Hàng'}
          </span>
        </button>
        <button 
          className={`btn btn-buy-now ${isBuyingNow ? 'loading' : ''}`}
          onClick={handleBuyNow}
          disabled={!(product.inStock ?? true) || isAddingToCart || isBuyingNow}
          style={{ width: '50%' }}
        >
          {isBuyingNow 
            ? 'Đang Xử Lý...' 
            : 'Mua Ngay'}
        </button>
      </div>
      
      {/* Promotion section */}
      <div className="promotion-section">
        <div className="promotion-item">
          <span className="text">
            Đảm bảo chính hãng 100%
          </span>
        </div>
        <div className="promotion-item">
          <span className="text">
            Giao hàng toàn quốc
          </span>
        </div>
        <div className="promotion-item">
          <span className="text">
            Đổi trả trong vòng 30 ngày
          </span>
        </div>
      </div>
      
      {/* Product details */}      
      <div className="product-brief-info">
        <div className="info-row">
          <div className="info-label">
            Mã sản phẩm:
          </div>
          <div className="info-value">
            {product.id ? `CN-${String(product.id).padStart(4, '0')}` : 'CN-0000'}
          </div>
        </div>
        
        {product.dimensions && (
          <div className="info-row">
            <div className="info-label">
              Kích thước:
            </div>
            <div className="info-value">
              {product.dimensions}
            </div>
          </div>
        )}
        
        {product.materials && (
          <div className="info-row">
            <div className="info-label">
              Chất liệu:
            </div>
            <div className="info-value">
              {product.materials}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap the component with the HOC
const EnhancedProductInfo = withProductValidation(ProductInfo);

export default EnhancedProductInfo;
