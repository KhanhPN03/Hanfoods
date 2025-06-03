import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  FileText
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartComponent from '../components/ChartComponent';
import AdminTable from '../components/AdminTable';
import '../css/Dashboard.css';
import '../css/RevenueManagement.css';

const RevenueManagement = () => {
  const [revenueData, setRevenueData] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('daily');
  const [topProducts, setTopProducts] = useState([]);

  // Date range options
  const dateRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  // Report type options
  const reportTypes = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  useEffect(() => {
    fetchRevenueData();
    fetchAnalytics();
    fetchTopProducts();
  }, [dateRange, reportType]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const mockData = {
        totalRevenue: 125670.50,
        averageOrderValue: 156.80,
        totalOrders: 801,
        conversionRate: 3.45,
        chartData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Revenue',
              data: [12000, 19000, 15000, 25000, 22000, 30000],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true
            },
            {
              label: 'Orders',
              data: [80, 120, 95, 160, 140, 190],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              yAxisID: 'y1'
            }
          ]
        },
        pieData: {
          labels: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'],
          datasets: [{
            data: [35, 25, 15, 15, 10],
            backgroundColor: [
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6'
            ]
          }]
        }
      };
      setRevenueData(mockData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Replace with actual API call
      setAnalytics({
        growth: {
          revenue: 12.5,
          orders: 8.3,
          customers: 15.2,
          averageOrderValue: -2.1
        },
        trends: {
          topSellingCategory: 'Electronics',
          peakSalesHour: '2 PM - 3 PM',
          topCustomerSegment: 'Premium',
          returningCustomerRate: 34.8
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchTopProducts = async () => {
    try {
      // Replace with actual API call
      const mockProducts = [
        {
          id: 1,
          name: 'iPhone 15 Pro',
          category: 'Electronics',
          revenue: 25450.00,
          units: 45,
          averagePrice: 565.55
        },
        {
          id: 2,
          name: 'MacBook Air M2',
          category: 'Electronics',
          revenue: 18900.00,
          units: 15,
          averagePrice: 1260.00
        },
        {
          id: 3,
          name: 'AirPods Pro',
          category: 'Electronics',
          revenue: 12450.00,
          units: 50,
          averagePrice: 249.00
        }
      ];
      setTopProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching top products:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value}%`;
  };

  const exportToExcel = async (type) => {
    try {
      // Replace with actual export API call
      console.log(`Exporting ${type} report...`);
      
      // Mock export process
      const data = {
        revenue: revenueData,
        analytics: analytics,
        products: topProducts,
        dateRange: dateRange,
        reportType: reportType
      };
      
      // In real implementation, this would trigger a download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `revenue-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const productColumns = [
    {
      name: 'Product',
      selector: row => row.name,
      sortable: true,
      cell: row => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-gray-500">{row.category}</div>
        </div>
      )
    },
    {
      name: 'Revenue',
      selector: row => row.revenue,
      sortable: true,
      cell: row => <span className="font-medium text-green-600">{formatCurrency(row.revenue)}</span>
    },
    {
      name: 'Units Sold',
      selector: row => row.units,
      sortable: true
    },
    {
      name: 'Avg. Price',
      selector: row => row.averagePrice,
      sortable: true,
      cell: row => formatCurrency(row.averagePrice)
    }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time Period'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Orders'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue & Orders Trend'
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Revenue by Category'
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Revenue Management</h1>
        <div className="header-actions">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="select-input"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="select-input"
          >
            {reportTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <button 
            className="btn-secondary"
            onClick={() => exportToExcel('detailed')}
          >
            <Download size={16} />
            Export Excel
          </button>
          
          <button 
            className="btn-primary"
            onClick={() => {
              fetchRevenueData();
              fetchAnalytics();
              fetchTopProducts();
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(revenueData.totalRevenue || 0)}
          trend={{ 
            value: analytics.growth?.revenue || 0, 
            isPositive: (analytics.growth?.revenue || 0) > 0 
          }}
          icon={DollarSign}
          color="#10b981"
        />
        <StatCard
          title="Total Orders"
          value={revenueData.totalOrders || 0}
          trend={{ 
            value: analytics.growth?.orders || 0, 
            isPositive: (analytics.growth?.orders || 0) > 0 
          }}
          icon={BarChart3}
          color="#3b82f6"
        />
        <StatCard
          title="Avg. Order Value"
          value={formatCurrency(revenueData.averageOrderValue || 0)}
          trend={{ 
            value: analytics.growth?.averageOrderValue || 0, 
            isPositive: (analytics.growth?.averageOrderValue || 0) > 0 
          }}
          icon={TrendingUp}
          color="#f59e0b"
        />
        <StatCard
          title="Conversion Rate"
          value={`${revenueData.conversionRate || 0}%`}
          trend={{ value: 0.3, isPositive: true }}
          icon={PieChart}
          color="#8b5cf6"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Revenue & Orders Trend</h3>
            <button 
              className="btn-secondary btn-sm"
              onClick={() => exportToExcel('trend')}
            >
              <Download size={14} />
              Export
            </button>
          </div>
          <div className="chart-container">
            {revenueData.chartData && (
              <ChartComponent
                type="line"
                data={revenueData.chartData}
                options={chartOptions}
                height={300}
              />
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Revenue by Category</h3>
            <button 
              className="btn-secondary btn-sm"
              onClick={() => exportToExcel('category')}
            >
              <Download size={14} />
              Export
            </button>
          </div>
          <div className="chart-container">
            {revenueData.pieData && (
              <ChartComponent
                type="doughnut"
                data={revenueData.pieData}
                options={pieOptions}
                height={300}
              />
            )}
          </div>
        </div>
      </div>

      {/* Analytics Insights */}
      <div className="content-card">
        <h3>Revenue Analytics</h3>
        <div className="analytics-grid">
          <div className="analytics-section">
            <h4>Growth Metrics</h4>
            <div className="metrics-list">
              <div className="metric-item">
                <span>Revenue Growth:</span>
                <span className={`metric-value ${(analytics.growth?.revenue || 0) > 0 ? 'positive' : 'negative'}`}>
                  {formatPercentage(analytics.growth?.revenue || 0)}
                </span>
              </div>
              <div className="metric-item">
                <span>Order Growth:</span>
                <span className={`metric-value ${(analytics.growth?.orders || 0) > 0 ? 'positive' : 'negative'}`}>
                  {formatPercentage(analytics.growth?.orders || 0)}
                </span>
              </div>
              <div className="metric-item">
                <span>Customer Growth:</span>
                <span className={`metric-value ${(analytics.growth?.customers || 0) > 0 ? 'positive' : 'negative'}`}>
                  {formatPercentage(analytics.growth?.customers || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="analytics-section">
            <h4>Key Insights</h4>
            <div className="insights-list">
              <div className="insight-item">
                <strong>Top Category:</strong> {analytics.trends?.topSellingCategory || 'N/A'}
              </div>
              <div className="insight-item">
                <strong>Peak Sales:</strong> {analytics.trends?.peakSalesHour || 'N/A'}
              </div>
              <div className="insight-item">
                <strong>Returning Customers:</strong> {analytics.trends?.returningCustomerRate || 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="content-card">
        <div className="card-header">
          <h3>Top Performing Products</h3>
          <button 
            className="btn-secondary"
            onClick={() => exportToExcel('products')}
          >
            <FileText size={16} />
            Export Products Report
          </button>
        </div>
        
        <AdminTable
          data={topProducts}
          columns={productColumns}
          loading={loading}
          searchable={true}
          searchPlaceholder="Search products..."
          pagination={false}
          className="revenue-table"
        />
      </div>

      {/* Export Options */}
      <div className="content-card">
        <h3>Export Reports</h3>
        <div className="export-options">
          <div className="export-option">
            <div className="export-info">
              <h4>Detailed Revenue Report</h4>
              <p>Complete revenue analysis with all metrics and trends</p>
            </div>
            <button 
              className="btn-primary"
              onClick={() => exportToExcel('detailed')}
            >
              <Download size={16} />
              Download Excel
            </button>
          </div>
          
          <div className="export-option">
            <div className="export-info">
              <h4>Product Performance Report</h4>
              <p>Top products by revenue, units sold, and profitability</p>
            </div>
            <button 
              className="btn-primary"
              onClick={() => exportToExcel('products')}
            >
              <Download size={16} />
              Download Excel
            </button>
          </div>
          
          <div className="export-option">
            <div className="export-info">
              <h4>Category Analysis Report</h4>
              <p>Revenue breakdown by product categories and trends</p>
            </div>
            <button 
              className="btn-primary"
              onClick={() => exportToExcel('category')}
            >
              <Download size={16} />
              Download Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueManagement;
