import React from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';

const CartItemsList = ({ cartItems }) => {
  const navigate = useNavigate();
  
  return (
    <div className="cart-items">
      <div className="cart-header-row">
        <div className="cart-header-product">Sản Phẩm</div>
        <div className="cart-header-price">Giá</div>
        <div className="cart-header-quantity">Số Lượng</div>
        <div className="cart-header-total">Tổng</div>
      </div>
      
      {cartItems.length > 0 ? (
        <>
          {cartItems.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </>
      ) : (
        <div className="empty-cart-message">
          Chưa có sản phẩm nào trong giỏ hàng
        </div>
      )}
      
      <div className="cart-actions">
        <button 
          className="continue-shopping" 
          onClick={() => navigate('/')}
        >
          ← Tiếp Tục Mua Hàng
        </button>
        <button 
          className="proceed-checkout"
          onClick={() => navigate('/checkout')}
          disabled={cartItems.length === 0}
        >
          Tiến Hành Thanh Toán →
        </button>
      </div>
    </div>
  );
};

export default CartItemsList;
