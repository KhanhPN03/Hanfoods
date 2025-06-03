import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Percent, 
  Edit3, 
  Trash2, 
  Eye,
  Calendar,
  DollarSign,
  Tag,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Download
} from 'lucide-react';
import AdminTable from '../components/AdminTable';
import AdminApiService from '../../../services/AdminApiService';
import StatCard from '../components/StatCard';
import '../css/DiscountManagement.css';

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    upcoming: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalRows: 0,
    perPage: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    dateRange: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  useEffect(() => {
    fetchDiscounts();
    fetchDiscountStats();
  }, [pagination.currentPage, pagination.perPage, filters]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = {
        page: pagination.currentPage,
        limit: pagination.perPage,
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateRange && { dateRange: filters.dateRange })
      };

      const response = await AdminApiService.getAllDiscounts(queryParams);
      
      if (response.success) {
        setDiscounts(response.discounts || []);
        setPagination(prev => ({
          ...prev,
          totalRows: response.count || response.discounts?.length || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      alert('Có lỗi xảy ra khi tải danh sách mã khuyến mãi!');
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscountStats = async () => {
    try {
      const statsData = await AdminApiService.getDiscountStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching discount stats:', error);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleAdd = () => {
    setSelectedDiscount(null);
    setShowAddModal(true);
  };

  const handleEdit = (discount) => {
    setSelectedDiscount(discount);
    setShowEditModal(true);
  };

  const handleDelete = async (discount) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mã khuyến mãi "${discount.code}"?`)) {
      try {
        const response = await AdminApiService.deleteDiscount(discount._id);
        
        if (response.success) {
          alert('Xóa mã khuyến mãi thành công!');
          fetchDiscounts();
          fetchDiscountStats();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi xóa mã khuyến mãi!');
        }
      } catch (error) {
        console.error('Error deleting discount:', error);
        alert('Có lỗi xảy ra khi xóa mã khuyến mãi!');
      }
    }
  };

  const handleView = (discount) => {
    setSelectedDiscount(discount);
    setShowViewModal(true);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Đã sao chép mã khuyến mãi!');
  };

  const handleExport = async () => {
    try {
      const response = await AdminApiService.exportDiscounts();
      
      if (response) {
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `discounts_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting discounts:', error);
      alert('Có lỗi xảy ra khi xuất file!');
    }
  };

  const handleChangePage = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleChangeRowsPerPage = (newPerPage) => {
    setPagination(prev => ({ 
      ...prev, 
      perPage: newPerPage,
      currentPage: 1
    }));
  };

  const getStatusBadge = (discount) => {
    const now = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = new Date(discount.endDate);

    if (discount.deleted) {
      return <span className="status-badge status-inactive">Vô hiệu hóa</span>;
    } else if (now < startDate) {
      return <span className="status-badge status-pending">Chưa bắt đầu</span>;
    } else if (now > endDate) {
      return <span className="status-badge status-expired">Đã hết hạn</span>;
    } else {
      return <span className="status-badge status-active">Đang hoạt động</span>;
    }
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      percentage: { label: 'Phần trăm', class: 'type-percentage', icon: Percent },
      fixed: { label: 'Số tiền cố định', class: 'type-fixed', icon: DollarSign }
    };
    
    const config = typeConfig[type] || typeConfig.percentage;
    const Icon = config.icon;
    
    return (
      <span className={`type-badge ${config.class}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const formatDiscountValue = (discount) => {
    if (discount.discountType === 'percentage') {
      return `${discount.discountValue}%`;
    } else {
      return `${discount.discountValue.toLocaleString('vi-VN')}đ`;
    }
  };

  const columns = [
    {
      name: 'Mã KM',
      selector: row => row.code,
      sortable: true,
      cell: row => (
        <div className="discount-code">
          <span className="code-text">{row.code}</span>
          <button 
            className="copy-btn"
            onClick={() => handleCopyCode(row.code)}
            title="Sao chép mã"
          >
            <Copy size={14} />
          </button>
        </div>
      ),
      width: '140px'
    },
    {
      name: 'Mô tả',
      selector: row => row.description,
      sortable: true,
      cell: row => (
        <div className="discount-info">
          <div className="discount-name">{row.description}</div>
          {row.discountId && <div className="discount-id">ID: {row.discountId}</div>}
        </div>
      ),
      width: '200px'
    },
    {
      name: 'Loại & Giá trị',
      selector: row => row.discountType,
      cell: row => (
        <div className="discount-value">
          {getTypeBadge(row.discountType)}
          <div className="value-text">{formatDiscountValue(row)}</div>
        </div>
      ),
      width: '150px'
    },
    {
      name: 'Điều kiện',
      selector: row => row.minOrderValue,
      cell: row => (
        <div className="discount-conditions">
          <div className="min-order">
            Đơn tối thiểu: {row.minOrderValue?.toLocaleString('vi-VN') || 0}đ
          </div>
        </div>
      ),
      width: '150px'
    },
    {
      name: 'Thời gian',
      selector: row => row.startDate,
      sortable: true,
      cell: row => (
        <div className="discount-period">
          <div className="start-date">
            Từ: {new Date(row.startDate).toLocaleDateString('vi-VN')}
          </div>
          <div className="end-date">
            Đến: {new Date(row.endDate).toLocaleDateString('vi-VN')}
          </div>
        </div>
      ),
      width: '140px'
    },
    {
      name: 'Trạng thái',
      selector: row => row.deleted,
      cell: row => getStatusBadge(row),
      width: '120px'
    },
    {
      name: 'Ngày tạo',
      selector: row => row.createdAt,
      sortable: true,
      cell: row => new Date(row.createdAt).toLocaleDateString('vi-VN'),
      width: '100px'
    }
  ];

  const FilterComponent = () => (
    <div className="filters-row">
      <select
        value={filters.type}
        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
        className="filter-select"
      >
        <option value="">Tất cả loại</option>
        <option value="percentage">Phần trăm</option>
        <option value="fixed">Số tiền cố định</option>
      </select>

      <select
        value={filters.status}
        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        className="filter-select"
      >
        <option value="">Tất cả trạng thái</option>
        <option value="active">Đang hoạt động</option>
        <option value="pending">Chưa bắt đầu</option>
        <option value="expired">Đã hết hạn</option>
        <option value="inactive">Vô hiệu hóa</option>
      </select>

      <select
        value={filters.dateRange}
        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
        className="filter-select"
      >
        <option value="">Tất cả thời gian</option>
        <option value="today">Hôm nay</option>
        <option value="week">Tuần này</option>
        <option value="month">Tháng này</option>
        <option value="year">Năm này</option>
      </select>

      <button
        className="clear-filters-btn"
        onClick={() => setFilters({ search: '', type: '', status: '', dateRange: '' })}
      >
        <X size={16} />
        Xóa bộ lọc
      </button>
    </div>
  );

  return (
    <div className="discount-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý khuyến mãi</h1>
          <p className="page-subtitle">
            Tạo và quản lý các mã giảm giá cho khách hàng
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Tổng mã KM"
          value={stats.total}
          icon={Tag}
          color="blue"
        />
        <StatCard
          title="Đang hoạt động"
          value={stats.active}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Sắp diễn ra"
          value={stats.upcoming}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Đã hết hạn"
          value={stats.expired}
          icon={XCircle}
          color="red"
        />
      </div>

      <AdminTable
        title={`Danh sách mã khuyến mãi (${pagination.totalRows})`}
        data={discounts}
        columns={columns}
        loading={loading}
        pagination={true}
        paginationServer={true}
        paginationTotalRows={pagination.totalRows}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        onSearch={handleSearch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onExport={handleExport}
        searchPlaceholder="Tìm kiếm theo mã, mô tả..."
        filterComponent={<FilterComponent />}
        selectableRows={true}
        className="discounts-table"
      />

      {/* Add Discount Modal */}
      {showAddModal && (
        <DiscountModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            fetchDiscounts();
            fetchDiscountStats();
          }}
          title="Tạo mã khuyến mãi mới"
        />
      )}

      {/* Edit Discount Modal */}
      {showEditModal && (
        <DiscountModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            fetchDiscounts();
            fetchDiscountStats();
          }}
          discount={selectedDiscount}
          title="Chỉnh sửa mã khuyến mãi"
        />
      )}

      {/* View Discount Modal */}
      {showViewModal && (
        <DiscountViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          discount={selectedDiscount}
        />
      )}
    </div>
  );
};

// Discount Modal Component
const DiscountModal = ({ isOpen, onClose, onSave, discount = null, title }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    startDate: '',
    endDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (discount) {
      setFormData({
        code: discount.code || '',
        description: discount.description || '',
        discountType: discount.discountType || 'percentage',
        discountValue: discount.discountValue || '',
        minOrderValue: discount.minOrderValue || '',
        startDate: discount.startDate ? new Date(discount.startDate).toISOString().slice(0, 16) : '',
        endDate: discount.endDate ? new Date(discount.endDate).toISOString().slice(0, 16) : ''
      });
    }
  }, [discount]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code) {
      newErrors.code = 'Mã khuyến mãi là bắt buộc';
    }

    if (!formData.description) {
      newErrors.description = 'Mô tả là bắt buộc';
    }

    if (!formData.discountValue) {
      newErrors.discountValue = 'Giá trị giảm giá là bắt buộc';
    } else {
      const value = parseFloat(formData.discountValue);
      if (formData.discountType === 'percentage' && (value <= 0 || value > 100)) {
        newErrors.discountValue = 'Phần trăm giảm giá phải từ 0 đến 100';
      } else if (formData.discountType === 'fixed' && value <= 0) {
        newErrors.discountValue = 'Số tiền giảm phải lớn hơn 0';
      }
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc là bắt buộc';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const response = discount 
        ? await AdminApiService.updateDiscount(discount._id, formData)
        : await AdminApiService.createDiscount(formData);

      if (response.success) {
        alert(discount ? 'Cập nhật mã khuyến mãi thành công!' : 'Tạo mã khuyến mãi thành công!');
        onSave();
        onClose();
      } else {
        alert(response.message || 'Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error saving discount:', error);
      alert('Có lỗi xảy ra khi lưu mã khuyến mãi!');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="discount-form">
          <div className="form-row">
            <div className="form-group">
              <label>Mã khuyến mãi *</label>
              <div className="code-input-group">
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className={errors.code ? 'error' : ''}
                  placeholder="VD: GIAM20"
                  required
                />
                <button type="button" className="generate-btn" onClick={generateCode}>
                  Tự động
                </button>
              </div>
              {errors.code && <span className="error-message">{errors.code}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={errors.description ? 'error' : ''}
              placeholder="Mô tả chi tiết về chương trình khuyến mãi"
              rows={3}
              required
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Loại giảm giá *</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Giá trị giảm *</label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                className={errors.discountValue ? 'error' : ''}
                placeholder={formData.discountType === 'percentage' ? '20' : '100000'}
                min="0"
                max={formData.discountType === 'percentage' ? '100' : ''}
                required
              />
              {errors.discountValue && <span className="error-message">{errors.discountValue}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Đơn hàng tối thiểu (VNĐ)</label>
            <input
              type="number"
              value={formData.minOrderValue}
              onChange={(e) => setFormData(prev => ({ ...prev, minOrderValue: e.target.value }))}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu *</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className={errors.startDate ? 'error' : ''}
                required
              />
              {errors.startDate && <span className="error-message">{errors.startDate}</span>}
            </div>
            <div className="form-group">
              <label>Ngày kết thúc *</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className={errors.endDate ? 'error' : ''}
                required
              />
              {errors.endDate && <span className="error-message">{errors.endDate}</span>}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Discount View Modal Component
const DiscountViewModal = ({ isOpen, onClose, discount }) => {
  if (!isOpen || !discount) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết mã khuyến mãi</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="discount-details">
          <div className="detail-row">
            <span className="label">Mã khuyến mãi:</span>
            <span className="value">{discount.code}</span>
          </div>
          <div className="detail-row">
            <span className="label">ID:</span>
            <span className="value">{discount.discountId}</span>
          </div>
          <div className="detail-row">
            <span className="label">Mô tả:</span>
            <span className="value">{discount.description}</span>
          </div>
          <div className="detail-row">
            <span className="label">Loại giảm giá:</span>
            <span className="value">
              {discount.discountType === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Giá trị:</span>
            <span className="value">
              {discount.discountType === 'percentage' 
                ? `${discount.discountValue}%` 
                : `${discount.discountValue.toLocaleString('vi-VN')}đ`}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Đơn hàng tối thiểu:</span>
            <span className="value">{discount.minOrderValue?.toLocaleString('vi-VN') || 0}đ</span>
          </div>
          <div className="detail-row">
            <span className="label">Thời gian áp dụng:</span>
            <span className="value">
              {new Date(discount.startDate).toLocaleString('vi-VN')} - {new Date(discount.endDate).toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Ngày tạo:</span>
            <span className="value">{new Date(discount.createdAt).toLocaleString('vi-VN')}</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscountManagement;
