import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Add useLocation
import { useAppContext } from '../../context/AppContext';
import MainHeader from '../../components/shared/MainHeader';
import MainFooter from '../../components/shared/MainFooter';
import './css/AuthPages.css';
import './css/fixScrollbars.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location for redirect
  const { login, addNotification, isLoading: contextLoading } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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
      const result = await login({
        email: formData.email,
        password: formData.password,
      });
      if (result.success) {
        // Redirect to the original destination or homepage
        const from = location.state?.from || '/';
        navigate(from);
      } else {
        addNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      addNotification('Sai tên đăng nhập hoặc mật khẩu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  if (contextLoading) {
    return <div>Đang kiểm tra trạng thái đăng nhập...</div>;
  }

  return (
    <div className="auth-page-container">
      <MainHeader />
      <main className="auth-main">
        <div className="auth-content-wrapper">
          <div className="auth-form-container">
            <div className="auth-logo">
              <h1>CocoNature</h1>
              <p>Sản Phẩm Dừa Hữu Cơ</p>
            </div>
            <h1 className="auth-title">Đăng Nhập</h1>
            <p className="auth-subtitle">Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 3H3C2.175 3 1.5075 3.675 1.5075 4.5L1.5 13.5C1.5 14.325 2.175 15 3 15H15C15.825 15 16.5 14.325 16.5 13.5V4.5C16.5 3.675 15.825 3 15 3ZM15 6L9 9.75L3 6V4.5L9 8.25L15 4.5V6Z" fill="#5A5A3C"/>
                    </svg>
                  </span>
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
                <div className="label-row">
                  <label htmlFor="password">Mật khẩu</label>
                  <Link to="/forgot-password" className="forgot-password-link">Quên mật khẩu?</Link>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12.75C9.99456 12.75 10.8 11.9446 10.8 10.95C10.8 9.95544 9.99456 9.15 9 9.15C8.00544 9.15 7.2 9.95544 7.2 10.95C7.2 11.9446 8.00544 12.75 9 12.75Z" fill="#5A5A3C"/>
                      <path d="M13.5 6.75H12.6V5.85C12.6 3.717 10.8825 1.95 8.7 1.95C6.5175 1.95 4.8 3.6675 4.8 5.85V6.75H3.9C3.4035 6.75 3 7.1535 3 7.65V14.85C3 15.3465 3.4035 15.75 3.9 15.75H14.1C14.5965 15.75 15 15.3465 15 14.85V7.65C15 7.1535 14.5965 6.75 14.1 6.75H13.5ZM6.6 5.85C6.6 4.6665 7.5165 3.75 8.7 3.75C9.8835 3.75 10.8 4.6665 10.8 5.85V6.75H6.6V5.85ZM13.2 13.95H4.8V8.55H13.2V13.95Z" fill="#5A5A3C"/>
                    </svg>
                  </span>
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
                className="auth-submit-button"
                disabled={isLoading || contextLoading}
              >
                {isLoading ? <span className="spinner"></span> : 'Đăng Nhập'}
              </button>
              <div className="auth-divider">
                <span>Hoặc</span>
              </div>
              <button
                type="button"
                className="google-login-button"
                onClick={handleGoogleLogin}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.76 10.2301C19.76 9.46012 19.6939 8.72012 19.5501 8.00012H10.1001V11.7201H15.5801C15.33 12.9201 14.62 13.9401 13.5701 14.6001V17.0401H16.8401C18.7401 15.3401 19.76 12.9901 19.76 10.2301Z" fill="#4285F4"/>
                  <path d="M10.0999 20.0001C12.8199 20.0001 15.1099 19.1201 16.8599 17.0801L13.5899 14.6001C12.6899 15.2201 11.5199 15.6201 10.1099 15.6201C7.4999 15.6201 5.2699 13.8901 4.4699 11.5601H1.0799V14.0701C2.8799 17.6001 6.3999 20.0001 10.0999 20.0001Z" fill="#34A853"/>
                  <path d="M4.47 11.5001C4.04 10.3001 4.04 8.98012 4.47 7.78012V5.27012H1.08C-0.36 7.99012 -0.36 11.3001 1.08 14.0201L4.47 11.5001Z" fill="#FBBC05"/>
                  <path d="M10.0999 4.38006C11.5699 4.38006 12.8999 4.89006 13.9499 5.88006L16.8699 2.96006C15.0999 1.29006 12.7999 0.250061 10.0999 0.250061C6.3999 0.250061 2.8799 2.65006 1.0799 6.18006L4.4699 8.68006C5.2699 6.35006 7.4999 4.38006 10.0999 4.38006Z" fill="#EA4335"/>
                </svg>
                <span>Đăng nhập với Google</span>
              </button>
            </form>
            <div className="auth-switch">
              <p>Chưa có tài khoản? <Link to="/register" className="auth-switch-link">Đăng ký ngay</Link></p>
            </div>
          </div>
          <div className="auth-image-container">
            <div className="auth-image" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1583386797829-dada3499a9a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")' }}></div>
            <div className="auth-image-overlay">
              <div className="auth-image-content">
                <h2>Khám phá thế giới sản phẩm dừa hữu cơ</h2>
                <p>Sản phẩm thiên nhiên, lành mạnh cho cuộc sống xanh của bạn</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MainFooter />
    </div>
  );
};

export default LoginPage;