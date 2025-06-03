import React, { useEffect, useState } from 'react';
import './css/OrderHistory.css';
import { FaSearch, FaBoxOpen, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { orderAPI } from '../../services/apiService';

const statusMap = {
  pending: { label: 'Chờ xác nhận', icon: <FaSearch color="#ff9800" /> },
  processing: { label: 'Đang xử lý', icon: <FaBoxOpen color="#2196f3" /> },
  shipped: { label: 'Đang giao', icon: <FaTruck color="#673ab7" /> },
  delivered: { label: 'Đã giao', icon: <FaCheckCircle color="#4caf50" /> },
  cancelled: { label: 'Đã hủy', icon: <FaTimesCircle color="#f44336" /> }
};

function formatCurrency(amount) {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    orderAPI.getUserOrders()
      .then(res => {
        if (res.data.success) {
          setOrders(res.data.orders || []);
        } else {
          setError(res.data.message || 'Không thể tải đơn hàng.');
        }
      })
      .catch(err => {
        setError(err.message || 'Có lỗi xảy ra khi tải đơn hàng.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="order-history-page"><p>Đang tải đơn hàng...</p></div>;
  if (error) return <div className="order-history-page"><p className="error-message">{error}</p></div>;

  return (
    <div className="order-history-page">
      <h2>Lịch sử đơn hàng</h2>
      <div className="order-list" style={{maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 8}}>
        {orders.map(order => (
          <div className="order-card" key={order._id} onClick={() => setSelectedOrder(order)}>
            <div className="order-header">
              <span className="order-code">Mã: {order.orderCode}</span>
              <span className={`order-status status-${order.status}`}>{statusMap[order.status]?.icon} {statusMap[order.status]?.label}</span>
            </div>
            <div className="order-info">
              <span>Ngày đặt: {formatDate(order.createdAt)}</span>
              <span>Tổng tiền: {formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        ))}
      </div>
      {selectedOrder && (
        <div className="order-detail-modal" onClick={() => setSelectedOrder(null)}>
          <div className="order-detail" onClick={e => e.stopPropagation()}>
            <h3>Chi tiết đơn hàng</h3>
            <div><b>Mã đơn hàng:</b> {selectedOrder.orderCode}</div>
            <div><b>Ngày đặt:</b> {formatDate(selectedOrder.createdAt)}</div>
            <div><b>Trạng thái:</b> {statusMap[selectedOrder.status]?.label}</div>
            <div><b>Tổng tiền:</b> {formatCurrency(selectedOrder.totalAmount)}</div>
            <div className="order-items">
              <b>Sản phẩm:</b>
              <ul>
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx}>{item.name} x{item.quantity} - {formatCurrency(item.price)}</li>
                ))}
              </ul>
            </div>
            <button className="close-btn" onClick={() => setSelectedOrder(null)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
