import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { authAPI } from '../../services/apiService';
import '../customer/css/AuthModal.css';

/**
 * AuthModal - Hiển thị modal đăng nhập khi session hết hạn
 */
const AuthModal = () => {
  const navigate = useNavigate();
  const { setUser, addNotification, authModalOpen, setAuthModalOpen, setupTokenRefresh } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Nếu modal mở, ngăn không cho scroll trang
    if (authModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [authModalOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email là bắt buộc';
    if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      });
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      
      // Thiết lập token refresh sau khi đăng nhập thành công
      setupTokenRefresh();
      
      addNotification('Đăng nhập thành công!', 'success');
      setAuthModalOpen(false);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Sai tên đăng nhập hoặc mật khẩu';
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectToLogin = () => {
    setAuthModalOpen(false);
    navigate('/login');
  };

  if (!authModalOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>Phiên đăng nhập đã hết hạn</h2>
          <button className="auth-modal-close" onClick={() => setAuthModalOpen(false)}>×</button>
        </div>
        
        <div className="auth-modal-body">
          <p className="auth-modal-message">
            Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ.
          </p>

          <form onSubmit={handleSubmit} className="auth-modal-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email của bạn"
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  className={errors.password ? 'error' : ''}
                />
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <button 
              type="submit" 
              className="auth-modal-submit-button"
              disabled={isLoading}
            >
              {isLoading ? <span className="spinner"></span> : 'Đăng Nhập'}
            </button>
          </form>
          
          <div className="auth-modal-footer">
            <button 
              className="auth-modal-redirect"
              onClick={handleRedirectToLogin}
            >
              Đến trang đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
