import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './css/AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);  const navigate = useNavigate();
  const { login, user, isLoading: contextLoading } = useAppContext();

  // Check if admin user is already logged in and redirect to admin dashboard
  useEffect(() => {
    // Only redirect if not loading
    if (!contextLoading) {
      if (user && user.role === 'admin') {
        console.log('Admin user already logged in, redirecting to admin dashboard');
        navigate('/admin/dashboard', { replace: true });
      } else if (user && user.role !== 'admin') {
        // If regular user tries to access admin login, redirect to customer login
        console.log('Regular user trying to access admin login, redirecting to customer login');
        navigate('/login', { replace: true });
      }
    }
  }, [user, contextLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
      try {
      const result = await login(formData);

      if (result.success) {
        // Get user from localStorage to check role
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          // Check if user is admin
          if (user.role !== 'admin') {
            toast.error('Bạn không có quyền truy cập trang quản trị');
            return;
          }
          
          // Store admin-specific localStorage keys
          const token = localStorage.getItem('token');
          localStorage.setItem('adminToken', token);
          localStorage.setItem('adminUser', JSON.stringify(user));
          
          toast.success('Đăng nhập thành công!');
          // Redirect to admin dashboard
          navigate('/admin/dashboard');
        }
      } else {
        toast.error(result.message || 'Email hoặc mật khẩu không đúng');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToCustomerLogin = () => {
    navigate('/login');
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          {/* Header */}
          <div className="admin-login-header">
            <div className="admin-login-logo">
              <Shield size={48} className="logo-icon" />
              <h1>ADMIN PANEL</h1>
            </div>
            <p className="admin-login-subtitle">
              Đăng nhập vào hệ thống quản trị
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email admin"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`admin-login-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="admin-login-footer">
            <p>Không phải admin?</p>
            <button 
              type="button" 
              className="customer-login-link"
              onClick={goToCustomerLogin}
            >
              Đăng nhập khách hàng
            </button>
          </div>
        </div>

      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminLogin;
