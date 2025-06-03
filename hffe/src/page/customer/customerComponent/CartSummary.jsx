import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../context/AppContext';
import { discountAPI } from '../../../services/apiService';

const CartSummary = ({ subtotal, shipping, discount, total, setDiscount }) => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const { addNotification, user } = useAppContext();
  const [isApplying, setIsApplying] = useState(false);

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }
    setIsApplying(true);
    const orderAmount = Number(subtotal) + Number(shipping);
    console.log('DEBUG: orderAmount gửi lên API:', orderAmount);
    try {
      const res = await discountAPI.applyDiscount(couponCode, orderAmount);
      console.log('DEBUG: Kết quả trả về từ API:', res);
      if (res.data.success && res.data.discount.discountValue > 0) {
        setDiscount(res.data.discount.discountValue);
        addNotification('Mã giảm giá đã được áp dụng thành công!', 'success');
        setCouponError('');
      } else {
        setDiscount(0);
        setCouponError(res.data.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn 1');
        addNotification('Mã giảm giá không hợp lệ', 'error');
      }
    } catch (err) {
      setDiscount(0);
      setCouponError(err.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn  2');
      addNotification('Mã giảm giá không hợp lệ', 'error');
      console.log('DEBUG: Lỗi khi gọi API:', err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="cart-summary">
      <h2 className="summary-title">Thông Tin Đơn Hàng</h2>
      
      <div className="coupon-section">
        <form onSubmit={handleCouponSubmit}>
          <input 
            type="text" 
            placeholder="Mã Giảm Giá" 
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="coupon-input"
            disabled={isApplying}
          />
          <button type="submit" className="apply-coupon" disabled={isApplying}>
            {isApplying ? 'Đang áp dụng...' : 'Áp Dụng'}
          </button>
        </form>
        {couponError && <p className="coupon-error">{couponError}</p>}
        {discount > 0 && <p className="coupon-success">Mã giảm giá đã được áp dụng!</p>}
      </div>
      
      <div className="summary-details">
        <div className="summary-row">
          <span>Tạm Tính</span>
          <span>{(Number(subtotal) || 0).toLocaleString()}đ</span>
        </div>
        
        <div className="summary-row">
          <span>Phí Vận Chuyển</span>
          <span>{(Number(shipping) || 0) > 0 ? `${Number(shipping).toLocaleString()}đ` : 'Miễn Phí'}</span>
        </div>
        
        {discount > 0 && (
          <div className="summary-row discount">
            <span>Giảm Giá</span>
            <span>-{(Number(discount) || 0).toLocaleString()}đ</span>
          </div>
        )}
        
        <div className="summary-total">
          <span>Tổng Cộng</span>
          <span>{(Number(total) || 0).toLocaleString()}đ</span>
        </div>
      </div>
        <button 
        className="checkout-button"
        onClick={() => {
          if (!user) {
            addNotification('Bạn cần đăng nhập để thanh toán!', 'warning');
            navigate('/login');
            return;
          }
          navigate('/checkout');
        }}
      >
        Tiến Hành Thanh Toán
      </button>
     
    </div>
  );
};

export default CartSummary;
