import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import '../css/CartItemLoading.css';

const CartItem = ({ item }) => {
  console.log(item);
  
  const { updateCartItemQuantity, removeFromCart, user, addNotification } = useAppContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Helper function để lấy URL ảnh chính xác
  const getImageUrl = (item) => {
    if (item.image) {
      if (typeof item.image === 'string') {
        return item.image;
      } else if (Array.isArray(item.image) && item.image.length > 0) {
        return item.image[0];
      }
    }
    if (item.imageUrl && typeof item.imageUrl === 'string') {
      return item.imageUrl;
    }
    // Fallback placeholder
    return `https://via.placeholder.com/100x100?text=${encodeURIComponent(item.name || 'Sản phẩm')}`;
  };

  const handleQuantityChange = async (newQuantity) => {
    if (!user) {
      addNotification('Bạn cần đăng nhập để thay đổi số lượng sản phẩm!', 'warning');
      return;
    }
    // Đảm bảo quantity luôn là số nguyên dương
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 1) {
      return; // Không cho phép số lượng không hợp lệ
    }
    
    setIsUpdating(true);
    try {
      await updateCartItemQuantity(item.id, quantity);
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleRemoveItem = async () => {
    setIsRemoving(true);
    try {
      await removeFromCart(item.id);
    } catch (error) {
      console.error("Error removing cart item:", error);
    }
  };

  return (
    <div className="cart-item">
      <div className="item-product">        <div className="item-image">
          <img src={getImageUrl(item)} alt={item.name} />
        </div>
        <div className="item-details">
          <h3 className="item-name">{item.name}</h3>
          <p className="item-category">{item.category}</p>          <button 
            className={`remove-item ${isRemoving ? 'removing' : ''}`}
            onClick={handleRemoveItem}
            disabled={isRemoving}
          >
            {isRemoving ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>      <div className="item-price">
        {(Number(item.productId?.price) || Number(item.price) || 0).toLocaleString()}đ
      </div>
        <div className="item-quantity">
        <div className={`quantity-selector ${isUpdating ? 'updating' : ''}`}>
          <button 
            className="quantity-btn decrease" 
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
            aria-label="Giảm số lượng"
          >
            -
          </button>
          <input 
            type="number" 
            className="quantity-input" 
            value={item.quantity || 1}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            disabled={isUpdating}
            min="1"
          />
          <button 
            className="quantity-btn increase" 
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating}
            aria-label="Tăng số lượng"
          >
            +
          </button>
          {isUpdating && <div className="quantity-loader"></div>}
        </div>
      </div>
        <div className="item-total">
        {((Number(item.productId?.price) || Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()}đ
      </div>
    </div>
  );
};

export default CartItem;
