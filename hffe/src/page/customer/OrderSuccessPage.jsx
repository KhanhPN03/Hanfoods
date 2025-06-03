import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import './css/OrderSuccessPage.css';
import MainHeader from '../../components/shared/MainHeader';
import MainFooter from '../../components/shared/MainFooter';
import { orderAPI } from '../../services/apiService';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useAppContext();
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let orderId = location.state?.orderId || localStorage.getItem('orderId');
    if (!orderId) {
      setError('Không tìm thấy đơn hàng.');
      setLoading(false);
      return;
    }
    // Lưu lại orderId để reload vẫn còn
    localStorage.setItem('orderId', orderId);
    clearCart();
    setLoading(true);
    orderAPI.getOrderById(orderId)
      .then(res => {
        if (res.data.success && res.data.order) {
          setOrder(res.data.order);
        } else {
          setError(res.data.message || 'Không tìm thấy đơn hàng.');
        }
      })
      .catch(() => setError('Không thể tải thông tin đơn hàng.'))
      .finally(() => setLoading(false));
  }, [clearCart, location.state]);

  if (loading) return (
    <div className="order-success-page">
      <MainHeader />
      <main className="success-main">
        <div className="success-container">
          <div className="success-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="#4caf50"/>
              <path d="M15 25.5L21 31.5L33 19.5" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Đặt hàng thành công!</h1>
          <p className="success-message">Đang tải thông tin đơn hàng...</p>
        </div>
      </main>
      <MainFooter/>
    </div>
  );
  if (error) return (
    <div className="order-success-page">
      <MainHeader />
      <main className="success-main">
        <div className="success-container">
          <div className="success-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="#f44336"/>
              <path d="M15 25.5L21 31.5L33 19.5" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Đặt hàng thành công!</h1>
          <p className="success-message" style={{color:'#c62828'}}>{error}</p>
        </div>
      </main>
      <MainFooter/>
    </div>
  );

  return (
    <div className="order-success-page">
      <MainHeader />
      <main className="success-main">
        <div className="success-container">
          <div className="success-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="#4caf50"/>
              <path d="M15 25.5L21 31.5L33 19.5" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Đặt hàng thành công!</h1>
          <p className="success-message">
            Cám ơn bạn đã đặt hàng tại CocoNature.<br />Chúng tôi sẽ xác nhận và giao hàng trong thời gian sớm nhất.
          </p>
          <div className="order-details">
            <p className="order-number">
              Mã đơn hàng: <strong>{order?.orderCode || order?._id || <span style={{color:'#aaa'}}>Đang xử lý...</span>}</strong>
            </p>
            <p className="order-date">
              Ngày đặt hàng: <strong>{order?.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}</strong>
            </p>
            <p className="order-total">
              Tổng tiền: <strong style={{color:'#2e7d32'}}>{order?.totalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</strong>
            </p>
            <div className="order-items-list">
              <span style={{fontWeight:600, color:'#388e3c'}}>Sản phẩm:</span>
              <ul>
                {order?.items?.map((item, idx) => (
                  <li key={idx} style={{margin:'8px 0', fontSize:'1.05em'}}>
                    <span style={{color:'#2a7d47'}}>{item.name}</span> x{item.quantity} - <span style={{color:'#388e3c'}}>{item.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="success-actions">
            <button className="view-order-button" onClick={() => navigate('/profile', { state: { tab: 'orders' } })}>
              <span role="img" aria-label="order">📦</span> Xem đơn hàng
            </button>
            <button className="continue-shopping-button" onClick={() => navigate('/') }>
              <span role="img" aria-label="shop">🛒</span> Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </main>
      <MainFooter/>
    </div>
  );
};

export default OrderSuccessPage;
