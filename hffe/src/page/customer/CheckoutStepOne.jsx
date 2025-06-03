import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
  
import CartItemsList from './customerComponent/CartItemsList';
import CheckoutSummary from './customerComponent/CheckoutSummary';
 
import './css/checkoutPage.css';
import './css/checkoutScrollFix.css'; // Fix scrolling issues
import MainFooter from '../../components/shared/MainFooter';
import MainHeader from '../../components/shared/MainHeader';
import AddressDataService from '../../services/addressDataService';
import addressService from '../../services/addressService';

const CheckoutStepOne = () => {
  const navigate = useNavigate();
  const { cart, addNotification, user } = useAppContext();
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(30000);
  // eslint-disable-next-line no-unused-vars
  const [discount, setDiscount] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '', // Thêm trường họ
    lastName: '',  // Thêm trường tên
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    notes: '',
    provinceCode: '',
    districtCode: '',
    wardCode: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [userAddress, setUserAddress] = useState(null);
  const [isLoadingUserAddress, setIsLoadingUserAddress] = useState(false);
  
  // State for address data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
    // Check if cart is empty, redirect to cart page
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
      addNotification('Giỏ hàng của bạn đang trống', 'warning');
    }
  }, [cart, navigate, addNotification]);
  // Load districts when province changes
  const loadDistricts = useCallback(async (provinceCode) => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }
    
    setIsLoadingDistricts(true);
    try {
      const data = await AddressDataService.getDistricts(provinceCode);
      setDistricts(data);
      
      // Only clear selections if not loading from saved data
      if (!formData.districtCode) {
        setWards([]);
      }
    } catch (error) {
      console.error(`Failed to load districts for province ${provinceCode}:`, error);
      addNotification('Không thể tải danh sách quận/huyện', 'error');
    } finally {
      setIsLoadingDistricts(false);
    }
  }, [addNotification, formData.districtCode]);
  
  // Load wards when district changes
  const loadWards = useCallback(async (districtCode) => {
    if (!districtCode) {
      setWards([]);
      return;
    }
    
    setIsLoadingWards(true);
    try {
      const data = await AddressDataService.getWards(districtCode);
      setWards(data);
    } catch (error) {
      console.error(`Failed to load wards for district ${districtCode}:`, error);
      addNotification('Không thể tải danh sách phường/xã', 'error');
    } finally {
      setIsLoadingWards(false);
    }
  }, [addNotification]);
    // Load provinces when component mounts
  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const data = await AddressDataService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Failed to load provinces:', error);
        addNotification('Không thể tải danh sách tỉnh thành', 'error');
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    
    loadProvinces();
  }, [addNotification]);

  // Load user address when user is logged in
  useEffect(() => {
    const loadUserAddress = async () => {
      if (!user || !user.addressId) {
        return;
      }

      setIsLoadingUserAddress(true);
      try {
        const addressData = await addressService.getAddressById(user.addressId);
        if (addressData && addressData.success) {
          const address = addressData.address;
          setUserAddress(address);
          
          // Auto-fill form with user address data
          const formData = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: address.phone || '',
            address: address.address || '',
            city: address.province || '',
            district: address.district || '',
            ward: address.ward || '',
            notes: address.notes || '',
            provinceCode: address.provinceCode || '',
            districtCode: address.districtCode || '',
            wardCode: address.wardCode || ''
          };
          
          setFormData(formData);
          
          // Load districts and wards based on saved address
          if (address.provinceCode) {
            await loadDistricts(address.provinceCode);
            if (address.districtCode) {
              await loadWards(address.districtCode);
            }
          }
          
          // Save to localStorage for persistence
          localStorage.setItem('checkoutAddress', JSON.stringify(formData));
        }
      } catch (error) {
        console.error('Failed to load user address:', error);
        // Don't show error notification - it's not critical
      } finally {
        setIsLoadingUserAddress(false);
      }
    };

    // Load saved form data if no user or user has no address
    const loadSavedFormData = () => {
      const savedFormData = localStorage.getItem('checkoutAddress');
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          setFormData(parsedData);
          
          // If we have province code, load districts
          if (parsedData.provinceCode) {
            loadDistricts(parsedData.provinceCode);
            
            // If we have district code, load wards
            if (parsedData.districtCode) {
              loadWards(parsedData.districtCode);
            }
          }
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
    };

    if (user && user.addressId) {
      loadUserAddress();
    } else {
      loadSavedFormData();
    }  }, [user, addNotification]);
  
  // Calculate totals
  useEffect(() => {
    const calculatedSubtotal = cart.reduce(
      (total, item) => total + item.price * item.quantity, 
      0
    );
    setSubtotal(calculatedSubtotal);
    
    if (calculatedSubtotal >= 1000000) {
      setShipping(0);
    } else {
      setShipping(30000);
    }
  }, [cart]);
  
  const total = subtotal + shipping - discount;
    // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle province selection
    if (name === 'city') {
      const selectedProvince = provinces.find(p => p.name === value);
      if (selectedProvince) {
        setFormData({
          ...formData,
          city: value,
          provinceCode: selectedProvince.code
        });
        
        // Load districts for the selected province
        loadDistricts(selectedProvince.code);
      } else {
        setFormData({
          ...formData,
          city: value,
          provinceCode: '',
          district: '',
          districtCode: '',
          ward: '',
          wardCode: ''
        });
        setDistricts([]);
        setWards([]);
      }
    }
    // Handle district selection
    else if (name === 'district') {
      const selectedDistrict = districts.find(d => d.name === value);
      if (selectedDistrict) {
        setFormData({
          ...formData,
          district: value,
          districtCode: selectedDistrict.code
        });
        
        // Load wards for the selected district
        loadWards(selectedDistrict.code);
      } else {
        setFormData({
          ...formData,
          district: value,
          districtCode: '',
          ward: '',
          wardCode: ''
        });
        setWards([]);
      }
    }
    // Handle ward selection
    else if (name === 'ward') {
      const selectedWard = wards.find(w => w.name === value);
      if (selectedWard) {
        setFormData({
          ...formData,
          ward: value,
          wardCode: selectedWard.code
        });
      } else {
        setFormData({
          ...formData,
          ward: value,
          wardCode: ''
        });
      }
    }
    // Handle other inputs
    else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'Vui lòng nhập họ';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Vui lòng nhập tên';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ';
    }
    
    if (!formData.city.trim()) {
      errors.city = 'Vui lòng chọn tỉnh/thành phố';
    }
    
    if (!formData.district.trim()) {
      errors.district = 'Vui lòng chọn quận/huyện';
    }
    
    if (!formData.ward.trim()) {
      errors.ward = 'Vui lòng chọn phường/xã';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Thêm trường fullName khi lưu vào localStorage
      const dataToSave = {
        ...formData,
        fullName: formData.firstName + ' ' + formData.lastName
      };
      localStorage.setItem('checkoutAddress', JSON.stringify(dataToSave));
      // Navigate to payment method selection
      navigate('/checkout/payment');
    } else {
      addNotification('Vui lòng điền đầy đủ thông tin', 'error');
    }
  };
    return (
    <div className="checkout-page checkout-page-wrapper">
      <MainHeader />
      
      <main className="checkout-main">
        <div className="checkout-steps">
          <div className="step active">
            <div className="step-number">1</div>
            <div className="step-title">Thông tin giao hàng</div>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-title">Phương thức thanh toán</div>
          </div>
        </div>
        
        <div className="checkout-content">
          <div className="checkout-form-section">
            <h2>Thông tin giao hàng</h2>
            
            <form onSubmit={handleSubmit} className="shipping-form">
              {/* Hàng 1: Họ + Tên */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Họ <span className="required">*</span></label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={formErrors.firstName ? 'error' : ''}
                  />
                  {formErrors.firstName && <div className="error-message">{formErrors.firstName}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Tên <span className="required">*</span></label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={formErrors.lastName ? 'error' : ''}
                  />
                  {formErrors.lastName && <div className="error-message">{formErrors.lastName}</div>}
                </div>
              </div>
              {/* Hàng 2: Email + Số điện thoại */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại <span className="required">*</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={formErrors.phone ? 'error' : ''}
                  />
                  {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                </div>
              </div>
              {/* Hàng 3: Tỉnh/Thành phố + Quận/Huyện */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">Tỉnh/Thành phố <span className="required">*</span></label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={formErrors.city ? 'error' : ''}
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map(province => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.city && <div className="error-message">{formErrors.city}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="district">Quận/Huyện <span className="required">*</span></label>
                  <select
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={formErrors.district ? 'error' : ''}
                    disabled={!formData.provinceCode}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map(district => (
                      <option key={district.code} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.district && <div className="error-message">{formErrors.district}</div>}
                </div>
              </div>
              {/* Hàng 4: Phường/Xã + Địa chỉ */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ward">Phường/Xã <span className="required">*</span></label>
                  <select
                    id="ward"
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    className={formErrors.ward ? 'error' : ''}
                    disabled={!formData.districtCode}
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards.map(ward => (
                      <option key={ward.code} value={ward.name}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.ward && <div className="error-message">{formErrors.ward}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="address">Địa chỉ <span className="required">*</span></label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={formErrors.address ? 'error' : ''}
                    placeholder="Số nhà, đường, tòa nhà, v.v."
                  />
                  {formErrors.address && <div className="error-message">{formErrors.address}</div>}
                </div>
              </div>
              {/* Hàng 5: Ghi chú đơn hàng */}
              <div className="form-group">
                <label htmlFor="notes">Ghi chú đơn hàng (tùy chọn)</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Ghi chú về đơn hàng hoặc yêu cầu đặc biệt khi giao hàng"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="back-button"
                  onClick={() => navigate('/cart')}
                >
                  Quay lại giỏ hàng
                </button>
                <button type="submit" className="continue-button">
                  Tiếp tục
                </button>
              </div>
            </form>
          </div>
          
          <CheckoutSummary
            subtotal={subtotal}
            shipping={shipping}
            discount={discount}
            total={total}
            showPaymentButton={false}
          />
        </div>
      </main>
      
      <MainFooter />
    </div>
  );
};

export default CheckoutStepOne;
