import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Users, 
  Percent, 
  ShoppingCart, 
  TrendingUp, 
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import './css/AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open on desktop
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { 
      path: '/admin/dashboard', 
      icon: Home, 
      label: 'Dashboard',
      color: '#667eea'
    },
    { 
      path: '/admin/products', 
      icon: Package, 
      label: 'Quản lý sản phẩm',
      color: '#4facfe'
    },
    { 
      path: '/admin/accounts', 
      icon: Users, 
      label: 'Quản lý tài khoản',
      color: '#43e97b'
    },
    { 
      path: '/admin/discounts', 
      icon: Percent, 
      label: 'Quản lý khuyến mãi',
      color: '#f093fb'
    },
    { 
      path: '/admin/orders', 
      icon: ShoppingCart, 
      label: 'Quản lý đơn hàng',
      color: '#ff6b6b'
    },
    { 
      path: '/admin/revenue', 
      icon: TrendingUp, 
      label: 'Quản lý doanh thu',
      color: '#feca57'
    },
    { 
      path: '/admin/settings', 
      icon: Settings, 
      label: 'Cài đặt hệ thống',
      color: '#a55eea'
    }
  ];
  useEffect(() => {
    // Get current user from localStorage or API
    const userData = localStorage.getItem('adminUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    } else {
      // Redirect to login if no user data
      navigate('/admin/login');
    }

    // Set initial sidebar state based on screen size
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false); // Closed by default on mobile
      } else {
        setIsSidebarOpen(true); // Open by default on desktop
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const getBreadcrumb = () => {
    const pathMap = {
      '/admin/dashboard': 'Dashboard',
      '/admin/products': 'Quản lý sản phẩm',
      '/admin/accounts': 'Quản lý tài khoản',
      '/admin/discounts': 'Quản lý khuyến mãi',
      '/admin/orders': 'Quản lý đơn hàng',
      '/admin/revenue': 'Quản lý doanh thu',
      '/admin/settings': 'Cài đặt hệ thống'
    };
    
    return pathMap[location.pathname] || 'Admin Panel';
  };
  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="admin-layout">      {/* Sidebar */}
      <div 
        className={`admin-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}
        onClick={(e) => e.stopPropagation()} // Ngăn event bubbling
      >
        <div className="sidebar-header">
          <h1 className="sidebar-logo">HanFoods</h1>
          <p className="sidebar-subtitle">Admin Panel</p>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <div key={item.path} className="nav-item">                <a
                  href={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                    // Chỉ đóng sidebar trên mobile
                    if (window.innerWidth <= 768) {
                      closeSidebar();
                    }
                  }}
                >
                  <IconComponent className="nav-icon" style={{ color: isActive ? '#ffd700' : 'inherit' }} />
                  <span className="nav-text">{item.label}</span>
                </a>
              </div>
            );
          })}
        </nav>
      </div>      {/* Main Content */}
      <div className={`admin-main ${!isSidebarOpen ? 'expanded' : ''}`}>
        {/* Header */}
        <header className="admin-header">
          <div className="header-content">
            <div className="header-left">
              <button className="menu-toggle" onClick={toggleSidebar}>
                {isSidebarOpen ? <X /> : <Menu />}
              </button>
              
              <div className="breadcrumb">
                <span className="breadcrumb-item">Admin</span>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">{getBreadcrumb()}</span>
              </div>
            </div>

            <div className="header-right">
              <div className="header-search">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="search-input"
                />
                <Search className="search-icon" />
              </div>

              <div className="header-actions">
                <button className="header-notification">
                  <Bell />
                  <span className="notification-badge">3</span>
                </button>

                <div className="user-menu">
                  <div className="user-avatar">
                    {currentUser?.firstname?.charAt(0) || 'A'}
                  </div>
                  <div className="user-info">
                    <p className="user-name">
                      {currentUser?.firstname} {currentUser?.lastname}
                    </p>
                    <p className="user-role">
                      {currentUser?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                    </p>
                  </div>
                  <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}
    </div>
  );
};

export default AdminLayout;