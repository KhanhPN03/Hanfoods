import React, { useState, useEffect } from 'react';
import { Package, Eye, Edit, Truck, X, Check, Clock, RefreshCw, FileText, Search, Filter, Download, MapPin, Phone, Mail } from 'lucide-react';
import AdminTable from '../components/AdminTable';
import StatCard from '../components/StatCard';
import AdminApiService from '../../../services/AdminApiService';
import '../css/OrderManagement.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Order status configurations
  const orderStatuses = {
    pending: { label: 'Pending', color: '#f59e0b', icon: Clock },
    processing: { label: 'Processing', color: '#3b82f6', icon: RefreshCw },
    shipped: { label: 'Shipped', color: '#8b5cf6', icon: Truck },
    delivered: { label: 'Delivered', color: '#10b981', icon: Package },
    cancelled: { label: 'Cancelled', color: '#ef4444', icon: X }
  };

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter
      };

      const response = await AdminApiService.getAllOrders(params);
      
      if (response.success) {
        setOrders(response.data.orders || response.data);
        setTotalPages(response.data.totalPages || Math.ceil((response.data.total || response.data.length) / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await AdminApiService.getOrderStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await AdminApiService.getOrderById(orderId);
      if (response.success) {
        setSelectedOrder(response.data);
        setShowOrderModal(true);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const handleStatusChange = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const updateOrderStatus = async (newStatus, notes = '') => {
    try {
      const response = await AdminApiService.updateOrderStatus(selectedOrder._id, newStatus, notes);
      if (response.success) {
        fetchOrders();
        setShowStatusModal(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleExport = async () => {
    try {
      const filters = {
        search: searchTerm,
        status: statusFilter
      };
      
      const response = await AdminApiService.exportOrders(filters);
      if (response.success) {
        // Convert data to CSV
        const headers = ['Order Code', 'Customer', 'Email', 'Phone', 'Status', 'Payment Method', 'Total Amount', 'Created Date'];
        const csvContent = [
          headers.join(','),
          ...response.data.map(order => [
            order.orderCode,
            order.customerName,
            order.customerEmail,
            order.customerPhone,
            order.status,
            order.paymentMethod,
            order.totalAmount,
            new Date(order.createdAt).toLocaleDateString()
          ].join(','))
        ].join('\n');

        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename || 'orders_export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const config = orderStatuses[status] || { label: status, color: '#6b7280', icon: Clock };
    const Icon = config.icon;
    
    return (
      <span 
        className="status-badge"
        style={{ backgroundColor: `${config.color}20`, color: config.color }}
      >
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      header: 'Order Code',
      accessor: 'orderCode',
      sortable: true
    },
    {
      header: 'Customer',
      accessor: 'customer',
      render: (order) => (
        <div className="customer-info">
          <div className="customer-name">{order.userId?.username || 'Unknown'}</div>
          <div className="customer-email">{order.userId?.email || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Items',
      accessor: 'items',
      render: (order) => (
        <div className="items-count">
          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
        </div>
      )
    },
    {
      header: 'Total',
      accessor: 'totalAmount',
      render: (order) => (
        <div className="order-total">
          {formatCurrency(order.totalAmount)}
        </div>
      ),
      sortable: true
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (order) => getStatusBadge(order.status),
      sortable: true
    },
    {
      header: 'Payment',
      accessor: 'paymentStatus',
      render: (order) => (
        <span className={`payment-status ${order.paymentStatus}`}>
          {order.paymentStatus || 'pending'}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (order) => new Date(order.createdAt).toLocaleDateString(),
      sortable: true
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (order) => (
        <div className="action-buttons">
          <button
            className="btn-action btn-view"
            onClick={() => handleViewOrder(order._id)}
            title="View Order"
          >
            <Eye size={16} />
          </button>
          <button
            className="btn-action btn-edit"
            onClick={() => handleStatusChange(order)}
            title="Update Status"
          >
            <Edit size={16} />
          </button>
        </div>
      )
    }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="order-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Order Management</h1>
          <p>Manage and track customer orders</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchOrders}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={handleExport}>
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={Package}
          color="#3b82f6"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          color="#f59e0b"
        />
        <StatCard
          title="Shipped Orders"
          value={stats.shippedOrders}
          icon={Truck}
          color="#8b5cf6"
        />
        <StatCard
          title="Delivered Orders"
          value={stats.deliveredOrders}
          icon={Check}
          color="#10b981"
        />
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search orders by code, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.entries(orderStatuses).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <AdminTable
          columns={columns}
          data={filteredOrders}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content order-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details</h3>
              <button className="btn-close" onClick={() => setShowOrderModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-details">
                <div className="order-info-grid">
                  <div className="info-section">
                    <h4>Order Information</h4>
                    <div className="info-item">
                      <label>Order Code:</label>
                      <span>{selectedOrder.orderCode}</span>
                    </div>
                    <div className="info-item">
                      <label>Status:</label>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="info-item">
                      <label>Payment Method:</label>
                      <span>{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="info-item">
                      <label>Payment Status:</label>
                      <span className={`payment-status ${selectedOrder.paymentStatus}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Order Date:</label>
                      <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="info-section">
                    <h4>Customer Information</h4>
                    <div className="info-item">
                      <Mail size={16} />
                      <span>{selectedOrder.userId?.email || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <Phone size={16} />
                      <span>{selectedOrder.userId?.phone || 'N/A'}</span>
                    </div>
                    {selectedOrder.addressId && (
                      <div className="info-item">
                        <MapPin size={16} />
                        <span>
                          {selectedOrder.addressId.street}, {selectedOrder.addressId.city}, 
                          {selectedOrder.addressId.state}, {selectedOrder.addressId.country}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-items">
                  <h4>Order Items</h4>
                  <div className="items-list">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="item-row">
                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                          <span className="item-details">Qty: {item.quantity}</span>
                        </div>
                        <div className="item-price">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span>{formatCurrency(selectedOrder.shippingFee || 0)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Discount:</span>
                      <span>-{formatCurrency(selectedOrder.discount || 0)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content status-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Order Status</h3>
              <button className="btn-close" onClick={() => setShowStatusModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="current-status">
                <label>Current Status:</label>
                {getStatusBadge(selectedOrder.status)}
              </div>
              
              <div className="status-options">
                <label>New Status:</label>
                <div className="status-grid">
                  {Object.entries(orderStatuses).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        className={`status-option ${selectedOrder.status === key ? 'current' : ''}`}
                        onClick={() => updateOrderStatus(key)}
                        style={{ borderColor: config.color }}
                      >
                        <Icon size={16} style={{ color: config.color }} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
