import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmptyCart = () => {
  const navigate = useNavigate();
  
  return (
    <div className="empty-cart">
      <div className="empty-cart-icon">🛒</div>
      <h2>Giỏ Hàng Trống</h2>
      <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
      <button 
        className="start-shopping"
        onClick={() => navigate('/')}
      >
        Bắt Đầu Mua Sắm
      </button>
    </div>
  );
};

export default EmptyCart;
