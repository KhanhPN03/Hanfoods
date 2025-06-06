import React, { useState, useEffect } from 'react';
import { Package, Eye, Truck, X, Check, Clock, RefreshCw, FileText, Download } from 'lucide-react';
import AdminTable from '../components/AdminTable';
import StatCard from '../components/StatCard';
import '../css/OrderManagement.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippingOrders: 0,
    completedOrders: 0
  });

  // Order status configurations
  const orderStatuses = {
    pending: { label: 'Pending', color: '#f59e0b', icon: Clock },
    confirmed: { label: 'Confirmed', color: '#3b82f6', icon: Check },
    shipping: { label: 'Shipping', color: '#8b5cf6', icon: Truck },
    delivered: { label: 'Delivered', color: '#10b981', icon: Package },
    cancelled: { label: 'Cancelled', color: '#ef4444', icon: X }
  };

  // Mock data - replace with API calls
  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const mockOrders = [
        {
          id: 1,
          orderNumber: 'ORD-2024-001',
          customer: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          items: [
            { name: 'iPhone 15 Pro', quantity: 1, price: 999.00 },
            { name: 'AirPods Pro', quantity: 1, price: 249.00 }
          ],
          total: 1248.00,
          status: 'pending',
          paymentStatus: 'paid',
          shippingAddress: '123 Main St, City, State 12345',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          orderNumber: 'ORD-2024-002',
          customer: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+0987654321',
          items: [
            { name: 'MacBook Air M2', quantity: 1, price: 1199.00 }
          ],
          total: 1199.00,
          status: 'shipping',
          paymentStatus: 'paid',
          shippingAddress: '456 Oak Ave, Town, State 67890',
          createdAt: '2024-01-14T14:15:00Z',
          updatedAt: '2024-01-15T09:20:00Z'
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      // Replace with actual API call
      setStats({
        totalOrders: 156,
        pendingOrders: 23,
        shippingOrders: 15,
        completedOrders: 118
      });
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      // Replace with actual API call
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus, updatedAt: new Date().toISOString() }));
      }
      
      // Refresh stats
      fetchOrderStats();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status) => {
    const config = orderStatuses[status] || orderStatuses.pending;
    const Icon = config.icon;
    
    return (
      <span 
        className="status-badge"
        style={{ 
          backgroundColor: `${config.color}15`,
          color: config.color,
          border: `1px solid ${config.color}30`
        }}
      >
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      name: 'Order #',
      selector: row => row.orderNumber,
      sortable: true,
      width: '140px'
    },
    {
      name: 'Customer',
      selector: row => row.customer,
      sortable: true,
      cell: row => (
        <div>
          <div className="font-medium">{row.customer}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      name: 'Items',
      selector: row => row.items.length,
      sortable: true,
      cell: row => (
        <div>
          <div>{row.items.length} item(s)</div>
          <div className="text-sm text-gray-500">
            {row.items[0]?.name}{row.items.length > 1 ? '...' : ''}
          </div>
        </div>
      )
    },
    {
      name: 'Total',
      selector: row => row.total,
      sortable: true,
      cell: row => <span className="font-medium">{formatCurrency(row.total)}</span>
    },
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
      cell: row => getStatusBadge(row.status)
    },
    {
      name: 'Date',
      selector: row => row.createdAt,
      sortable: true,
      cell: row => formatDate(row.createdAt)
    },    {
      name: 'Actions',
      cell: row => (
        <div className="action-buttons">
          <button
            onClick={() => handleViewOrder(row)}
            className="action-btn view"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          
          <div className="status-dropdown">
            <select
              value={row.status}
              onChange={(e) => handleUpdateOrderStatus(row.id, e.target.value)}
              className="status-select"
            >
              {Object.entries(orderStatuses).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
      ),
      width: '200px'
    }
  ];

  const filterOptions = [
    { label: 'All Orders', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Shipping', value: 'shipping' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  const bulkActions = [
    {
      label: 'Mark as Confirmed',
      action: (selectedRows) => {
        selectedRows.forEach(row => handleUpdateOrderStatus(row.id, 'confirmed'));
      }
    },
    {
      label: 'Mark as Shipping',
      action: (selectedRows) => {
        selectedRows.forEach(row => handleUpdateOrderStatus(row.id, 'shipping'));
      }
    },
    {
      label: 'Export Selected',
      action: (selectedRows) => {
        // Export functionality
        console.log('Exporting orders:', selectedRows);
      }
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Order Management</h1>
        <div className="header-actions">
          <button className="btn-secondary">
            <Download size={16} />
            Export Orders
          </button>
          <button className="btn-secondary" onClick={fetchOrders}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          trend={{ value: 12, isPositive: true }}
          icon={Package}
          color="#3b82f6"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          trend={{ value: 5, isPositive: false }}
          icon={Clock}
          color="#f59e0b"
        />
        <StatCard
          title="Shipping"
          value={stats.shippingOrders}
          trend={{ value: 8, isPositive: true }}
          icon={Truck}
          color="#8b5cf6"
        />
        <StatCard
          title="Completed"
          value={stats.completedOrders}
          trend={{ value: 15, isPositive: true }}
          icon={Check}
          color="#10b981"
        />
      </div>

      {/* Orders Table */}
      <div className="content-card">
        <AdminTable
          data={orders}
          columns={columns}
          loading={loading}
          searchable={true}
          searchPlaceholder="Search orders..."
          filterable={true}
          filterOptions={filterOptions}
          selectable={true}
          bulkActions={bulkActions}
          onRefresh={fetchOrders}
        />
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - {selectedOrder.orderNumber}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowOrderModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="order-details-grid">
                {/* Order Info */}
                <div className="order-section">
                  <h3>Order Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Order Number:</label>
                      <span>{selectedOrder.orderNumber}</span>
                    </div>
                    <div className="info-item">
                      <label>Status:</label>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="info-item">
                      <label>Payment Status:</label>
                      <span className="payment-status paid">Paid</span>
                    </div>
                    <div className="info-item">
                      <label>Order Date:</label>
                      <span>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="info-item">
                      <label>Last Updated:</label>
                      <span>{formatDate(selectedOrder.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="order-section">
                  <h3>Customer Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Name:</label>
                      <span>{selectedOrder.customer}</span>
                    </div>
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{selectedOrder.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone:</label>
                      <span>{selectedOrder.phone}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Shipping Address:</label>
                      <span>{selectedOrder.shippingAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="order-section full-width">
                  <h3>Order Items</h3>
                  <div className="items-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>{formatCurrency(item.price)}</td>
                            <td>{formatCurrency(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3"><strong>Total:</strong></td>
                          <td><strong>{formatCurrency(selectedOrder.total)}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Status Update */}
                <div className="order-section full-width">
                  <h3>Update Order Status</h3>
                  <div className="status-update-grid">
                    {Object.entries(orderStatuses).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          className={`status-btn ${selectedOrder.status === key ? 'active' : ''}`}
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, key)}
                          style={{ borderColor: config.color }}
                        >
                          <Icon size={16} style={{ color: config.color }} />
                          <span>{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowOrderModal(false)}
              >
                Close
              </button>
              <button className="btn-primary">
                <FileText size={16} />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;