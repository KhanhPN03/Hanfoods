import React from 'react';
import { useAppContext } from '../../../context/AppContext';

const CheckoutSummary = ({ subtotal, shipping, discount, total, showPaymentButton = true }) => {
  const { cart } = useAppContext();
  
  return (
    <div className="checkout-summary">
      <h2 className="summary-title">Đơn hàng của bạn</h2>
      
      <div className="summary-products">
        <h3>Sản phẩm ({cart.length})</h3>
        <ul className="summary-product-list">
          {cart.map((item, index) => (
            <li key={index} className="summary-product-item">
              <div className="product-thumb">
                <img src={item.image} alt={item.name} />
                <span className="product-quantity">{item.quantity}</span>
              </div>
              <div className="product-info">
                <h4>{item.name}</h4>
                <p className="product-price">
                  {item.price.toLocaleString()}đ x {item.quantity}
                </p>
              </div>
              <div className="product-total">
                {(item.price * item.quantity).toLocaleString()}đ
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="summary-details">
        <div className="summary-row">
          <span>Tạm Tính</span>
          <span>{subtotal.toLocaleString()}đ</span>
        </div>
        
        <div className="summary-row">
          <span>Phí Vận Chuyển</span>
          <span>{shipping > 0 ? `${shipping.toLocaleString()}đ` : 'Miễn Phí'}</span>
        </div>
        
        {discount > 0 && (
          <div className="summary-row discount">
            <span>Giảm Giá</span>
            <span>-{discount.toLocaleString()}đ</span>
          </div>
        )}
        
        <div className="summary-total">
          <span>Tổng Cộng</span>
          <span>{total.toLocaleString()}đ</span>
        </div>
      </div>
      
      {showPaymentButton && (
        <div className="payment-methods-preview">
          <p>Phương Thức Thanh Toán</p>
          <div className="payment-icons">
            <span className="payment-icon cod">COD</span>
            <span className="payment-icon vietqr">VietQR</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutSummary;
