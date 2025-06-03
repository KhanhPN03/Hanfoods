import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Shield,
  User
} from 'lucide-react';
import AdminApiService from '../../../services/AdminApiService';
import '../css/AdminTable.css';

const ImprovedAccountManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    newUsersThisMonth: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching users...');
      const response = await AdminApiService.getUsers();
      console.log('Users response:', response);
      
      if (response && response.users) {
        setUsers(response.users);
      } else if (Array.isArray(response)) {
        setUsers(response);
      } else {
        throw new Error('Invalid users response format');
      }
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      // Use mock data as fallback
      setUsers([
        {
          _id: '1',
          firstname: 'Nguyễn',
          lastname: 'Văn A',
          email: 'nguyenvana@example.com',
          role: 'user',
          status: 'active',
          createdAt: new Date('2024-01-15').toISOString(),
          lastLogin: new Date('2024-12-20').toISOString()
        },
        {
          _id: '2',
          firstname: 'Admin',
          lastname: 'System',
          email: 'admin@hanfoods.com',
          role: 'admin',
          status: 'active',
          createdAt: new Date('2023-12-01').toISOString(),
          lastLogin: new Date('2024-12-21').toISOString()
        },
        {
          _id: '3',
          firstname: 'Trần',
          lastname: 'Thị B',
          email: 'tranthib@example.com',
          role: 'user',
          status: 'inactive',
          createdAt: new Date('2024-03-10').toISOString(),
          lastLogin: new Date('2024-11-15').toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await AdminApiService.getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Use mock stats
      setStats({
        totalUsers: 1204,
        activeUsers: 892,
        adminUsers: 5,
        newUsersThisMonth: 87
      });
    }
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
    const searchMatch = fullName.includes(filters.search.toLowerCase()) ||
                       user.email.toLowerCase().includes(filters.search.toLowerCase());
    
    const roleMatch = !filters.role || user.role === filters.role;
    const statusMatch = !filters.status || user.status === filters.status;
    
    return searchMatch && roleMatch && statusMatch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Users className="animate-spin" size={32} />
          <p style={{ marginTop: '10px' }}>Đang tải danh sách tài khoản...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý tài khoản</h1>
          <p className="page-subtitle">Quản lý tài khoản người dùng và phân quyền</p>
        </div>
        <button className="btn btn-primary">
          <UserPlus size={16} />
          Thêm tài khoản mới
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          ⚠️ Lỗi khi tải dữ liệu: {error}. Đang hiển thị dữ liệu mẫu.
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#667eea20', color: '#667eea' }}>
            <Users size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Tổng người dùng</p>
            <h3 className="stat-value">{stats.totalUsers}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#4facfe20', color: '#4facfe' }}>
            <User size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Đang hoạt động</p>
            <h3 className="stat-value">{stats.activeUsers}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ff6b6b20', color: '#ff6b6b' }}>
            <Shield size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Quản trị viên</p>
            <h3 className="stat-value">{stats.adminUsers}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#feca5720', color: '#feca57' }}>
            <UserPlus size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Người dùng mới</p>
            <h3 className="stat-value">{stats.newUsersThisMonth}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm tài khoản..."
            value={filters.search}
            onChange={handleSearch}
          />
        </div>
        <select 
          className="filter-select" 
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">Tất cả vai trò</option>
          <option value="user">Người dùng</option>
          <option value="admin">Quản trị viên</option>
        </select>
        <select 
          className="filter-select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
        <button className="btn btn-secondary">
          <Filter size={16} />
          Bộ lọc
        </button>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Đăng nhập cuối</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-cell">
                    <strong>{user.firstname} {user.lastname}</strong>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role role-${user.role}`}>
                    {user.role === 'admin' ? (
                      <>
                        <Shield size={12} />
                        Quản trị viên
                      </>
                    ) : (
                      <>
                        <User size={12} />
                        Người dùng
                      </>
                    )}
                  </span>
                </td>
                <td>
                  <span className={`status status-${user.status}`}>
                    {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{user.lastLogin ? formatDate(user.lastLogin) : 'Chưa đăng nhập'}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action btn-view" title="Xem chi tiết">
                      <Eye size={14} />
                    </button>
                    <button className="btn-action btn-edit" title="Chỉnh sửa">
                      <Edit3 size={14} />
                    </button>
                    <button className="btn-action btn-delete" title="Xóa">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <Users size={48} />
            <h3>Không có tài khoản nào</h3>
            <p>Chưa có tài khoản nào trong hệ thống hoặc không có tài khoản nào phù hợp với tìm kiếm.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovedAccountManagement;
