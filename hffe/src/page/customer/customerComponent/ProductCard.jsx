import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../context/AppContext';
import withProductValidation from '../hoc/withProductValidation';

const getValidImage = (product) => {
  // Kiểm tra các trường URL trong product
  const checkUrl = (url) => {
    return url && typeof url === 'string' && url.trim() !== '' && 
           (url.startsWith('http://') || url.startsWith('https://')) &&
           !url.includes('via.placeholder.com');
  };
  
  // Kiểm tra theo thứ tự ưu tiên
  if (checkUrl(product.imageUrl)) return product.imageUrl;
  if (checkUrl(product.thumbnailImage)) return product.thumbnailImage;
  if (Array.isArray(product.images) && product.images.length > 0 && checkUrl(product.images[0])) return product.images[0];
  
  // Sử dụng placeholder.pics thay vì via.placeholder.com
  const productName = product.name ? product.name.replace(/\s+/g, '+') : 'Product';
  return `https://placeholder.pics/svg/500x500/${productName}`;
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, wishlist } = useAppContext();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const isInWishlist = wishlist.some(item => item.id === product.id);
  
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    try {
      await addToCart(product);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    addToWishlist(product);
  };
  return (    <div className="productCard">            
      <div className={getValidImage(product) ? 'productImg withImage' : `productImg ${product.imageClass || 'coconutProduct'}`}
           style={getValidImage(product) ? { backgroundImage: `url(${getValidImage(product)})` } : {}}>
        {product.badge && <span className="productBadge">{product.badge}</span>}
        <div className="productHover">
          <button 
            className="wishlistButton" 
            onClick={handleToggleWishlist}
            title={isInWishlist ? "Đã thêm vào danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
          >
            <span className={`heartIcon ${isInWishlist ? 'active' : ''}`}>♥</span>
          </button>
          <button className="quickView" onClick={() => navigate(`/product/${product.id || ''}`)} aria-label="Xem chi tiết sản phẩm">
            Xem Nhanh
          </button>
        </div>
      </div><div className="productInfo">
        <div className="productCategory">{product.category}</div>              
        <h3 className="productName" 
            onClick={() => navigate(`/product/${product.id}`)} 
            style={{cursor: 'pointer',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '3.2em', // Đảm bảo luôn chiếm 2 dòng chiều cao
              lineHeight: '1.6em',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
            }}>
          {product.name}
        </h3>
        <div className="productRating">
          <span className="stars">{product.stars}</span>
          <span className="reviewCount">({product.reviewCount})</span>
        </div>
        <div className="productStock">
          {product.inStock ? (
            <span className="inStock">Còn hàng ({product.stock})</span>
          ) : (
            <span className="outOfStock">Hết hàng</span>
          )}
        </div>
        <p className="productPrice">
          {product.originalPrice && 
            <span className="originalPrice">{product.originalPrice}</span>
          } 
          {product.price}
        </p>        <button 
          className={`addToCartButton ${!product.inStock ? 'disabled' : ''} ${isAddingToCart ? 'loading' : ''}`} 
          onClick={handleAddToCart}
          disabled={!product.inStock || isAddingToCart}
        >
          {isAddingToCart ? 'Đang thêm...' : (product.inStock ? 'Thêm Vào Giỏ' : 'Hết Hàng')}
        </button>
      </div>
    </div>
  );
};

export default withProductValidation(ProductCard);
