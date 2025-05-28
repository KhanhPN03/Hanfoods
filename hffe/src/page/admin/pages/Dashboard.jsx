import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  RefreshCw 
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartComponent from '../components/ChartComponent';
import AdminTable from '../components/AdminTable';
import AdminApiService from '../../../services/AdminApiService';
import '../css/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: { totalProducts: 0, lowStockCount: 0 },
    orders: { totalOrders: 0, pendingOrders: 0, totalRevenue: 0 },
    users: { totalUsers: 0, activeUsers: 0 }
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchMockData = useCallback(() => {
    // Mock data as fallback
    setStats({
      products: { totalProducts: 156, lowStockCount: 12 },
      orders: { totalOrders: 89, pendingOrders: 23, totalRevenue: 125670.50 },
      users: { totalUsers: 1204, activeUsers: 892 }
    });

    setRecentOrders([
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        customer: 'John Doe',
        total: 259.99,
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-002', 
        customer: 'Jane Smith',
        total: 189.50,
        status: 'completed',
        createdAt: new Date().toISOString()
      }
    ]);

    setRevenueData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true
      }]
    });
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all dashboard data
      const [dashboardStats, recentOrdersData, revenueAnalytics] = await Promise.all([
        AdminApiService.getDashboardStats(),
        AdminApiService.getRecentOrders(10),
        AdminApiService.getRevenueAnalytics(timeRange)
      ]);

      setStats(dashboardStats);
      setRecentOrders(recentOrdersData.orders || []);
      setRevenueData(revenueAnalytics.analytics || null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data as fallback
      fetchMockData();
    } finally {
      setLoading(false);
    }
  }, [timeRange, fetchMockData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const orderColumns = [
    {
      name: 'Mã đơn hàng',
      selector: row => row.id,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Khách hàng',
      selector: row => row.customerName,
      sortable: true
    },
    {
      name: 'Sản phẩm',
      selector: row => row.products,
      cell: row => (
        <span className="products-cell" title={row.products}>
          {row.products.length > 50 ? row.products.substring(0, 50) + '...' : row.products}
        </span>
      )
    },
    {
      name: 'Tổng tiền',
      selector: row => row.total,
      sortable: true,
      cell: row => (
        <span className="price-cell">
          {row.total.toLocaleString('vi-VN')} đ
        </span>
      ),
      width: '120px'
    },
    {
      name: 'Trạng thái',
      selector: row => row.status,
      cell: row => (
        <span className={`status-badge status-${row.status}`}>
          {getStatusText(row.status)}
        </span>
      ),
      width: '120px'
    },
    {
      name: 'Thời gian',
      selector: row => row.createdAt,
      cell: row => new Date(row.createdAt).toLocaleDateString('vi-VN'),
      sortable: true,
      width: '100px'
    }
  ];

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipped: 'Đã gửi',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const handleViewOrder = (order) => {
    // Navigate to order detail page
    console.log('View order:', order);
  };

  const chartOptions = {
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Doanh thu (VNĐ)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Số đơn hàng'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Tổng quan hoạt động kinh doanh
          </p>
        </div>
        <div className="dashboard-actions">
          <div className="time-range-selector">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-select"
            >
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
              <option value="90d">3 tháng qua</option>
              <option value="1y">12 tháng qua</option>
            </select>
          </div>          <button 
            className="refresh-btn"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Làm mới
          </button>
        </div>
      </div>      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Tổng sản phẩm"
          value={stats.products?.totalProducts || 0}
          change={8.5}
          changeType="increase"
          icon={Package}
          color="#667eea"
        />
        <StatCard
          title="Tổng khách hàng"
          value={stats.users?.totalUsers || 0}
          change={12.3}
          changeType="increase"
          icon={Users}
          color="#4facfe"
        />
        <StatCard
          title="Tổng đơn hàng"
          value={stats.orders?.totalOrders || 0}
          change={-2.1}
          changeType="decrease"
          icon={ShoppingCart}
          color="#43e97b"
        />
        <StatCard
          title="Tổng doanh thu"
          value={stats.orders?.totalRevenue || 0}
          change={15.7}
          changeType="increase"
          icon={TrendingUp}
          color="#f093fb"
        />
      </div>      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Doanh thu & Đơn hàng</h3>
          </div>
          <div className="chart-content">
            {revenueData ? (
              <ChartComponent
                type="line"
                data={revenueData}
                options={chartOptions}
                height={350}
              />
            ) : (
              <div className="chart-loading">
                <RefreshCw className="spinner" size={24} />
              </div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Phân bố danh mục</h3>
          </div>
          <div className="chart-content">
            {revenueData ? (
              <ChartComponent
                type="doughnut"
                data={{
                  labels: ['Điện thoại', 'Laptop', 'Tablet', 'Phụ kiện'],
                  datasets: [{
                    data: [30, 25, 20, 25],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                  }]
                }}
                height={350}
              />
            ) : (
              <div className="chart-loading">
                <RefreshCw className="spinner" size={24} />
              </div>
            )}
          </div>
        </div>
      </div>      {/* Recent Orders */}
      <div className="recent-orders">
        <AdminTable
          title="Đơn hàng gần đây"
          data={recentOrders}
          columns={orderColumns}
          loading={loading}
          pagination={false}
          onView={handleViewOrder}
          searchPlaceholder="Tìm kiếm đơn hàng..."
        />
      </div>
    </div>
  );
};

export default Dashboard;
