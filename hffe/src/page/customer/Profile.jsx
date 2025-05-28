import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainHeader from '../../components/shared/MainHeader';
import MainFooter from '../../components/shared/MainFooter';
import { useAppContext } from '../../context/AppContext';
import './css/Profile.css';
import { 
  FaUser, 
  FaShoppingBag, 
  FaHeart, 
  FaAddressCard, 
  FaCreditCard,
  FaBell,
  FaLock,
  FaUserEdit,
  FaCamera
} from 'react-icons/fa';
import OrderHistory from './OrderHistory';
import Wishlist from './Wishlist';

const Profile = () => {
  const { user, isLoading, updateProfile } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    avatar: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState('');
  
  // Set initial profile data when user info is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'Vietnam'
        }
      });
    } else if (!isLoading) {
      // Redirect to login if not logged in and not currently loading
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Set initial tab from navigation state (e.g. MainHeader 'Đơn hàng của tôi')
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
    // eslint-disable-next-line
  }, [location.state?.tab]);

  // Handle profile form change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields like address.street
      const [parent, child] = name.split('.');
      setProfileData({
        ...profileData,
        [parent]: {
          ...profileData[parent],
          [child]: value
        }
      });
    } else {
      setProfileData({
        ...profileData,
        [name]: value
      });
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Validate profile form
  const validateForm = () => {
    const errors = {};
    if (!profileData.firstname.trim()) errors.firstname = 'Vui lòng nhập tên';
    if (!profileData.lastname.trim()) errors.lastname = 'Vui lòng nhập họ';
    if (!profileData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    if (profileData.phone && !/^[0-9]{10,11}$/i.test(profileData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }
    
    return errors;
  };
  
  // Handle profile form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setUpdateSuccess('Thông tin cá nhân đã được cập nhật thành công!');
        setEditMode(false);
        setTimeout(() => {
          setUpdateSuccess('');
        }, 3000);
      } else {
        setFormErrors({ general: result.message || 'Có lỗi xảy ra khi cập nhật thông tin' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setFormErrors({ general: 'Có lỗi xảy ra khi cập nhật thông tin' });
    }
  };
  
  // Set active tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'profile') {
      setEditMode(false);
    }
  };
  
  // Handle avatar upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({
          ...profileData,
          avatar: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Scrolls to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // Loading state
  if (isLoading) {
    return (
      <div className="profile-page">
        <MainHeader />
        <div className="page-content">
          <div className="container">
            <div className="loading-spinner">Đang tải thông tin...</div>
          </div>
        </div>
        <MainFooter />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <MainHeader />
      
      <div className="page-content">
        <div className="container">
          <h1 className="page-title">Tài Khoản Của Tôi</h1>
          
          <div className="profile-grid">
            {/* Sidebar */}
            <div className="profile-sidebar">
              <div className="user-info">
                <div className="avatar-container">
                  <img 
                    src={profileData.avatar || '/assets/default-avatar.png'} 
                    alt="User Avatar" 
                    className="user-avatar" 
                  />
                  <div className="user-name">{profileData.firstname} {profileData.lastname}</div>
                </div>
              </div>
              
              <ul className="sidebar-nav">
                <li className={activeTab === 'profile' ? 'active' : ''}>
                  <button onClick={() => handleTabChange('profile')}>
                    <FaUser /> Thông tin cá nhân
                  </button>
                </li>
                <li className={activeTab === 'orders' ? 'active' : ''}>
                  <button onClick={() => handleTabChange('orders')}>
                    <FaShoppingBag /> Đơn hàng của tôi
                  </button>
                </li>
                <li className={activeTab === 'wishlist' ? 'active' : ''}>
                  <button onClick={() => handleTabChange('wishlist')}>
                    <FaHeart /> Danh sách yêu thích
                  </button>
                </li>
                <li className={activeTab === 'address' ? 'active' : ''}>
                  <button onClick={() => handleTabChange('address')}>
                    <FaAddressCard /> Địa chỉ giao hàng
                  </button>
                </li>
                <li className={activeTab === 'payment' ? 'active' : ''}>
                  <button onClick={() => handleTabChange('payment')}>
                    <FaCreditCard /> Phương thức thanh toán
                  </button>
                </li>
                <li className={activeTab === 'notifications' ? 'active' : ''}>
                  <button onClick={() => handleTabChange('notifications')}>
                    <FaBell /> Thông báo
                  </button>
                </li>
                <li className={activeTab === 'security' ? 'active' : ''}>
                  <button onClick={() => handleTabChange('security')}>
                    <FaLock /> Bảo mật
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Content Area */}
            <div className="profile-content">
              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Thông Tin Cá Nhân</h2>
                    {!editMode && (
                      <button 
                        className="edit-button"
                        onClick={() => setEditMode(true)}
                      >
                        <FaUserEdit /> Chỉnh sửa
                      </button>
                    )}
                  </div>
                  
                  {updateSuccess && <div className="success-message">{updateSuccess}</div>}
                  {formErrors.general && <div className="error-message general-error">{formErrors.general}</div>}
                  
                  {editMode ? (
                    <form onSubmit={handleSubmit} className="profile-form">
                      <div className="avatar-upload">
                        <div className="avatar-preview">
                          <img 
                            src={profileData.avatar || '/assets/default-avatar.png'} 
                            alt="Avatar Preview" 
                          />
                          <label className="avatar-upload-button">
                            <FaCamera />
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleAvatarUpload} 
                              style={{ display: 'none' }} 
                            />
                          </label>
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="firstname">Tên *</label>
                          <input 
                            type="text" 
                            id="firstname" 
                            name="firstname" 
                            value={profileData.firstname} 
                            onChange={handleInputChange}
                            className={formErrors.firstname ? 'error' : ''}
                          />
                          {formErrors.firstname && <div className="error-message">{formErrors.firstname}</div>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="lastname">Họ *</label>
                          <input 
                            type="text" 
                            id="lastname" 
                            name="lastname" 
                            value={profileData.lastname} 
                            onChange={handleInputChange}
                            className={formErrors.lastname ? 'error' : ''}
                          />
                          {formErrors.lastname && <div className="error-message">{formErrors.lastname}</div>}
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="email">Email *</label>
                          <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={profileData.email} 
                            onChange={handleInputChange}
                            className={formErrors.email ? 'error' : ''}
                          />
                          {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="phone">Số điện thoại</label>
                          <input 
                            type="tel" 
                            id="phone" 
                            name="phone" 
                            value={profileData.phone} 
                            onChange={handleInputChange}
                            className={formErrors.phone ? 'error' : ''}
                          />
                          {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="dateOfBirth">Ngày sinh</label>
                          <input 
                            type="date" 
                            id="dateOfBirth" 
                            name="dateOfBirth" 
                            value={profileData.dateOfBirth} 
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="gender">Giới tính</label>
                          <select 
                            id="gender" 
                            name="gender" 
                            value={profileData.gender} 
                            onChange={handleInputChange}
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                          </select>
                        </div>
                      </div>
                      
                      <h3 className="address-heading">Địa chỉ giao hàng</h3>
                      
                      <div className="form-group">
                        <label htmlFor="street">Địa chỉ</label>
                        <input 
                          type="text" 
                          id="street" 
                          name="address.street" 
                          value={profileData.address?.street || ''} 
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="city">Thành phố</label>
                          <input 
                            type="text" 
                            id="city" 
                            name="address.city" 
                            value={profileData.address?.city || ''} 
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="state">Tỉnh/Thành phố</label>
                          <input 
                            type="text" 
                            id="state" 
                            name="address.state" 
                            value={profileData.address?.state || ''} 
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="postalCode">Mã bưu điện</label>
                          <input 
                            type="text" 
                            id="postalCode" 
                            name="address.postalCode" 
                            value={profileData.address?.postalCode || ''} 
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="country">Quốc gia</label>
                          <input 
                            type="text" 
                            id="country" 
                            name="address.country" 
                            value={profileData.address?.country || ''} 
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>
                          Hủy
                        </button>
                        <button type="submit" className="save-btn">
                          Lưu thay đổi
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-info">
                      <div className="info-row">
                        <div className="info-label">Họ và tên:</div>
                        <div className="info-value">{profileData.firstname} {profileData.lastname}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Email:</div>
                        <div className="info-value">{profileData.email}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Số điện thoại:</div>
                        <div className="info-value">{profileData.phone || 'Chưa cập nhật'}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Ngày sinh:</div>
                        <div className="info-value">
                          {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                        </div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Giới tính:</div>
                        <div className="info-value">
                          {profileData.gender === 'male' ? 'Nam' : 
                           profileData.gender === 'female' ? 'Nữ' : 
                           profileData.gender === 'other' ? 'Khác' : 
                           'Chưa cập nhật'}
                        </div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Địa chỉ:</div>
                        <div className="info-value">
                          {profileData.address?.street ? (
                            <>
                              {profileData.address.street},
                              {' '}{profileData.address.city && `${profileData.address.city}, `}
                              {' '}{profileData.address.state && `${profileData.address.state}, `}
                              {' '}{profileData.address.postalCode && `${profileData.address.postalCode}, `}
                              {' '}{profileData.address.country || ''}
                            </>
                          ) : (
                            'Chưa cập nhật'
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Đơn Hàng Của Tôi</h2>
                  </div>
                  <OrderHistory />
                </div>
              )}
              
              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="content-section">
                  <Wishlist />
                </div>
              )}
              
              {/* Address Tab */}
              {activeTab === 'address' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Địa Chỉ Giao Hàng</h2>
                  </div>
                  
                  <div className="placeholder-message">
                    <p>Tính năng quản lý nhiều địa chỉ giao hàng sẽ sớm được cập nhật.</p>
                    <p>Hiện tại, bạn có thể cập nhật địa chỉ giao hàng chính trong phần "Thông tin cá nhân".</p>
                  </div>
                </div>
              )}
              
              {/* Payment Tab */}
              {activeTab === 'payment' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Phương Thức Thanh Toán</h2>
                  </div>
                  
                  <div className="placeholder-message">
                    <p>Tính năng quản lý phương thức thanh toán sẽ sớm được cập nhật.</p>
                    <p>Hiện tại, bạn có thể lựa chọn phương thức thanh toán khi tiến hành đặt hàng.</p>
                  </div>
                </div>
              )}
              
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Thông Báo</h2>
                  </div>
                  
                  <div className="placeholder-message">
                    <p>Tính năng quản lý thông báo sẽ sớm được cập nhật.</p>
                  </div>
                </div>
              )}
              
              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Bảo Mật</h2>
                  </div>
                  
                  <div className="placeholder-message">
                    <p>Tính năng đổi mật khẩu và cài đặt bảo mật sẽ sớm được cập nhật.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <MainFooter />
    </div>
  );
};

export default Profile;
