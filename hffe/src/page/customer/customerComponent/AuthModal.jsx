import React, { useState } from 'react';
import { authAPI } from '../../../services/apiService';
import { useAppContext } from '../../../context/AppContext';
import '../css/AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  
  const { setUser, addNotification } = useAppContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (isLogin) {
      if (!formData.email) newErrors.email = 'Email là bắt buộc';
      if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc';
    } else {
      if (!formData.username) newErrors.username = 'Tên đăng nhập là bắt buộc';
      if (!formData.email) newErrors.email = 'Email là bắt buộc';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
      
      if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc';
      else if (formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        // Login
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        addNotification('Đăng nhập thành công!', 'success');
        onClose();
      } else {
        // Register
        const response = await authAPI.register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        
        addNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        setIsLogin(true);
        setFormData({
          ...formData,
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        (isLogin ? 'Đăng nhập thất bại' : 'Đăng ký thất bại');
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>
        
        <div className="auth-modal-header">
          <h2>{isLogin ? 'Đăng Nhập' : 'Đăng Ký'}</h2>
          <p>{isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              isLogin ? 'Đăng Nhập' : 'Đăng Ký'
            )}
          </button>
          
          <div className="auth-divider">
            <span>Hoặc</span>
          </div>
          
          <button 
            type="button"
            className="google-login-button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <img src="/google-icon.png" alt="Google" className="google-icon" />
            {isLogin ? 'Đăng nhập với Google' : 'Đăng ký với Google'}
          </button>
        </form>
        
        <div className="auth-switch">
          {isLogin ? (
            <p>Chưa có tài khoản? <button onClick={() => setIsLogin(false)}>Đăng ký</button></p>
          ) : (
            <p>Đã có tài khoản? <button onClick={() => setIsLogin(true)}>Đăng nhập</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
