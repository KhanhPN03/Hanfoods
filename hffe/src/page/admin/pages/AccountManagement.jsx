import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  Edit3, 
  Trash2, 
  Eye,
  Shield,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  X,
  Lock,
  Unlock,
  UserCheck,
  UserX
} from 'lucide-react';
import AdminTable from '../components/AdminTable';
import AdminApiService from '../../../services/AdminApiService';
import '../css/AdminTable.css';
import '../css/AccountManagement.css';

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalRows: 0,
    perPage: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    dateRange: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  useEffect(() => {
    fetchAccounts();
  }, [pagination.currentPage, pagination.perPage, filters]); // eslint-disable-line react-hooks/exhaustive-deps
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page: pagination.currentPage,
        limit: pagination.perPage,
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateRange && { dateRange: filters.dateRange })
      };

      const response = await AdminApiService.getAllUsers(params);

      if (response.success) {
        setAccounts(response.data.users || []);
        setPagination(prev => ({
          ...prev,
          totalRows: response.data.pagination?.totalCount || 0
        }));
      } else {
        console.error('Failed to fetch accounts');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleAdd = () => {
    setSelectedAccount(null);
    setShowAddModal(true);
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setShowEditModal(true);
  };
  const handleDelete = async (account) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${account.email}"?`)) {
      try {
        const response = await AdminApiService.deleteUser(account._id);

        if (response.success) {
          alert('Xóa tài khoản thành công!');
          fetchAccounts();
        } else {
          alert('Có lỗi xảy ra khi xóa tài khoản!');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Có lỗi xảy ra khi xóa tài khoản!');
      }
    }
  };
  const handleToggleStatus = async (account) => {
    try {
      const newStatus = !account.isActive;
      const response = await AdminApiService.updateUserStatus(account._id, newStatus);

      if (response.success) {
        alert(`${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản thành công!`);
        fetchAccounts();
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error toggling account status:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleView = (account) => {
    // Show account detail modal or navigate to detail page
    console.log('View account:', account);
  };
  const handleExport = async () => {
    try {
      const params = {
        role: filters.role,
        status: filters.status
      };

      const response = await AdminApiService.exportUsers(params);

      if (response.success) {
        // Create and download the file
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accounts_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting accounts:', error);
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

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { label: 'Quản trị viên', class: 'role-admin', icon: ShieldCheck },
      customer: { label: 'Khách hàng', class: 'role-customer', icon: User }
    };
    
    const config = roleConfig[role] || roleConfig.customer;
    const Icon = config.icon;
    
    return (
      <span className={`role-badge ${config.class}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (account) => {
    if (account.isDeleted) {
      return <span className="status-badge status-deleted">Đã xóa</span>;
    } else if (!account.isActive) {
      return <span className="status-badge status-inactive">Vô hiệu hóa</span>;
    } else {
      return <span className="status-badge status-active">Hoạt động</span>;
    }
  };

  const columns = [
    {
      name: 'Avatar',
      selector: row => row.avatar,
      cell: row => (
        <div className="account-avatar">
          <img 
            src={row.avatar || '/default-avatar.png'} 
            alt={row.firstname || row.email}
            className="avatar-image"
          />
        </div>
      ),
      width: '60px',
      sortable: false
    },
    {
      name: 'Thông tin',
      selector: row => row.email,
      sortable: true,
      cell: row => (
        <div className="account-info">
          <div className="account-name">
            {row.firstname && row.lastname 
              ? `${row.firstname} ${row.lastname}` 
              : row.username || 'Chưa có tên'
            }
          </div>
          <div className="account-email">{row.email}</div>
          <div className="account-code">#{row.accountCode}</div>
        </div>
      ),
      width: '200px'
    },
    {
      name: 'Liên hệ',
      selector: row => row.phone,
      cell: row => (
        <div className="contact-info">
          {row.phone && (
            <div className="phone">
              <Phone size={12} />
              {row.phone}
            </div>
          )}
          {row.DOB && (
            <div className="birthday">
              <Calendar size={12} />
              {new Date(row.DOB).toLocaleDateString('vi-VN')}
            </div>
          )}
        </div>
      ),
      width: '150px'
    },
    {
      name: 'Vai trò',
      selector: row => row.role,
      sortable: true,
      cell: row => getRoleBadge(row.role),
      width: '130px'
    },
    {
      name: 'Trạng thái',
      selector: row => row.isActive,
      cell: row => getStatusBadge(row),
      width: '120px'
    },
    {
      name: 'Ngày tạo',
      selector: row => row.createdAt,
      sortable: true,
      cell: row => new Date(row.createdAt).toLocaleDateString('vi-VN'),
      width: '100px'
    },
    {
      name: 'Lần đăng nhập cuối',
      selector: row => row.lastLogin,
      sortable: true,
      cell: row => row.lastLogin 
        ? new Date(row.lastLogin).toLocaleDateString('vi-VN')
        : 'Chưa đăng nhập',
      width: '150px'
    }
  ];

  const customActions = [
    {
      icon: props => props.isActive ? Lock : Unlock,
      onClick: handleToggleStatus,
      title: (row) => row.isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
      variant: 'status'
    }
  ];

  const FilterComponent = () => (
    <div className="filters-row">
      <select
        value={filters.role}
        onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
        className="filter-select"
      >
        <option value="">Tất cả vai trò</option>
        <option value="admin">Quản trị viên</option>
        <option value="customer">Khách hàng</option>
      </select>

      <select
        value={filters.status}
        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        className="filter-select"
      >
        <option value="">Tất cả trạng thái</option>
        <option value="active">Hoạt động</option>
        <option value="inactive">Vô hiệu hóa</option>
        <option value="deleted">Đã xóa</option>
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
        onClick={() => setFilters({ search: '', role: '', status: '', dateRange: '' })}
      >
        <X size={16} />
        Xóa bộ lọc
      </button>
    </div>
  );

  return (
    <div className="account-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý tài khoản</h1>
          <p className="page-subtitle">
            Quản lý tài khoản người dùng và phân quyền
          </p>
        </div>
      </div>

      <AdminTable
        title={`Danh sách tài khoản (${pagination.totalRows})`}
        data={accounts}
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
        searchPlaceholder="Tìm kiếm theo tên, email, số điện thoại..."
        filterComponent={<FilterComponent />}
        selectableRows={true}
        customActions={customActions}
        className="accounts-table"
      />

      {/* Add Account Modal */}
      {showAddModal && (
        <AccountModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={fetchAccounts}
          title="Thêm tài khoản mới"
        />
      )}

      {/* Edit Account Modal */}
      {showEditModal && (
        <AccountModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={fetchAccounts}
          account={selectedAccount}
          title="Chỉnh sửa tài khoản"
        />
      )}
    </div>
  );
};

// Account Modal Component
const AccountModal = ({ isOpen, onClose, onSave, account = null, title }) => {
  const [formData, setFormData] = useState({
    email: '',
    firstname: '',
    lastname: '',
    phone: '',
    DOB: '',
    gender: '',
    role: 'customer',
    password: '',
    confirmPassword: '',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (account) {
      setFormData({
        email: account.email || '',
        firstname: account.firstname || '',
        lastname: account.lastname || '',
        phone: account.phone || '',
        DOB: account.DOB ? new Date(account.DOB).toISOString().split('T')[0] : '',
        gender: account.gender || '',
        role: account.role || 'customer',
        password: '',
        confirmPassword: '',
        isActive: account.isActive !== undefined ? account.isActive : true
      });
    }
  }, [account]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!account && !formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
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
      
      const url = account ? `/api/auth/users/${account._id}` : '/api/auth/register';
      const method = account ? 'PUT' : 'POST';
      
      const submitData = { ...formData };
      if (account && !submitData.password) {
        delete submitData.password;
        delete submitData.confirmPassword;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        alert(account ? 'Cập nhật tài khoản thành công!' : 'Thêm tài khoản thành công!');
        onSave();
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Có lỗi xảy ra khi lưu tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={errors.email ? 'error' : ''}
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Vai trò</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="customer">Khách hàng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Họ</label>
              <input
                type="text"
                value={formData.firstname}
                onChange={(e) => setFormData(prev => ({ ...prev, firstname: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Tên</label>
              <input
                type="text"
                value={formData.lastname}
                onChange={(e) => setFormData(prev => ({ ...prev, lastname: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <label>Giới tính</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Ngày sinh</label>
            <input
              type="date"
              value={formData.DOB}
              onChange={(e) => setFormData(prev => ({ ...prev, DOB: e.target.value }))}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mật khẩu {!account && '*'}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={errors.password ? 'error' : ''}
                placeholder={account ? 'Để trống nếu không đổi' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu {!account && '*'}</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              Kích hoạt tài khoản
            </label>
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

export default AccountManagement;
