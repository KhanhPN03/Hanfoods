import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import '../css/Dashboard.css';

const SimplifiedDashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Đang tải Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Tổng quan</h1>
        <p className="dashboard-subtitle">Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ backgroundColor: '#667eea20', color: '#667eea' }}>
              <Package size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Tổng sản phẩm</p>
              <h3 className="stat-value">156</h3>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ backgroundColor: '#4facfe20', color: '#4facfe' }}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Người dùng</p>
              <h3 className="stat-value">1,204</h3>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ backgroundColor: '#ff6b6b20', color: '#ff6b6b' }}>
              <ShoppingCart size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Đơn hàng</p>
              <h3 className="stat-value">89</h3>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ backgroundColor: '#feca5720', color: '#feca57' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Doanh thu</p>
              <h3 className="stat-value">₫125,670</h3>
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        marginTop: '20px'
      }}>
        <h3>Recent Activity</h3>
        <p>Dashboard content is now working properly!</p>
        <ul>
          <li>✅ Routing fixed</li>
          <li>✅ Layout displaying correctly</li>
          <li>✅ Components rendering</li>
          <li>✅ CSS styles applied</li>
        </ul>
      </div>
    </div>
  );
};

export default SimplifiedDashboard;
