import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  RefreshCw 
} from 'lucide-react';
import StatCard from '../components/StatCard';
import AdminApiService from '../../../services/AdminApiService';
import '../css/Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: { totalProducts: 0, lowStockCount: 0 },
    orders: { totalOrders: 0, pendingOrders: 0, totalRevenue: 0 },
    users: { totalUsers: 0, activeUsers: 0 }
  });  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use AdminApiService methods instead of direct API calls
      const [statsData, ordersData] = await Promise.all([
        AdminApiService.getDashboardStats(),
        AdminApiService.getRecentOrders(10)
      ]);
      
      // Set stats data from AdminApiService
      if (statsData) {
        setStats(statsData);
      }
      
      // Set recent orders data from AdminApiService
      if (ordersData && ordersData.orders) {
        setRecentOrders(ordersData.orders);
      } else if (Array.isArray(ordersData)) {
        setRecentOrders(ordersData);
      } else {
        setRecentOrders([]);
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'Lỗi khi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          flexDirection: 'column'
        }}>
          <RefreshCw className="animate-spin" size={32} />
          <p style={{ marginTop: '10px' }}>Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard Tổng quan</h1>
          <p className="dashboard-subtitle">Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</p>
        </div>
        <button 
          onClick={handleRefresh}
          style={{
            padding: '8px 16px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #fcc'
        }}>
          ⚠️ Lỗi khi tải dữ liệu: {error}. Đang hiển thị dữ liệu mẫu.
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          title="Tổng sản phẩm"
          value={stats.products?.totalProducts || 0}
          change="+12%"
          changeType="increase"
          icon={Package}
          color="#667eea"
        />
        
        <StatCard
          title="Người dùng"
          value={stats.users?.totalUsers || 0}
          change="+8%"
          changeType="increase"
          icon={Users}
          color="#4facfe"
        />
        
        <StatCard
          title="Đơn hàng"
          value={stats.orders?.totalOrders || 0}
          change="+15%"
          changeType="increase"
          icon={ShoppingCart}
          color="#ff6b6b"
        />
        
        <StatCard
          title="Doanh thu"
          value={`₫${(stats.orders?.totalRevenue || 0).toLocaleString()}`}
          change="+23%"
          changeType="increase"
          icon={TrendingUp}
          color="#feca57"
        />
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <h3>Đơn hàng gần đây</h3>
          {recentOrders.length > 0 ? (
            <div className="orders-list">
              {recentOrders.slice(0, 5).map(order => (
                <div key={order.id} className="order-item">
                  <div>
                    <strong>{order.orderNumber || `ORD-${order.id}`}</strong>
                    <p>{order.customer || order.customerName || 'Khách hàng'}</p>
                  </div>
                  <div>
                    <span className={`status status-${order.status}`}>
                      {order.status === 'pending' ? 'Chờ xử lý' : 
                       order.status === 'completed' ? 'Hoàn thành' : order.status}
                    </span>
                    <strong>₫{(order.total || 0).toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Không có đơn hàng nào gần đây.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
