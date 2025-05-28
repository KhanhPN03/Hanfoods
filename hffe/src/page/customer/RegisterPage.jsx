import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import AddressDataService from "../../services/addressDataService";

import "./css/AuthPages.css";
import "./css/fixScrollbars.css";
import MainFooter from "../../components/shared/MainFooter";
import MainHeader from "../../components/shared/MainHeader";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    addNotification,
    isLoading: contextLoading,
  } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    firstname: "",
    lastname: "",
    password: "",
    confirmPassword: "",
    DOB: "",
    gender: "",
    phone: "",
    termsAgreed: false,    // Address fields (required)
    address: {
      street: "",
      city: "",
      district: "",
      ward: "",
      provinceCode: "",
      districtCode: "",
      wardCode: ""
    }
  });

  const [errors, setErrors] = useState({});
  
  // Address state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  
  // State để theo dõi độ mạnh của mật khẩu (0-100)
  const [passwordStrength, setPasswordStrength] = useState(0);

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

  // Load districts when province changes
  const loadDistricts = async (provinceCode) => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }
    
    setIsLoadingDistricts(true);
    try {
      const data = await AddressDataService.getDistricts(provinceCode);
      setDistricts(data);
      
      // Clear district and ward selection
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          district: '',
          districtCode: '',
          ward: '',
          wardCode: ''
        }
      }));
      
      setWards([]);
    } catch (error) {
      console.error(`Failed to load districts for province ${provinceCode}:`, error);
      addNotification('Không thể tải danh sách quận/huyện', 'error');
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  // Load wards when district changes
  const loadWards = async (districtCode) => {
    if (!districtCode) {
      setWards([]);
      return;
    }
    
    setIsLoadingWards(true);
    try {
      const data = await AddressDataService.getWards(districtCode);
      setWards(data);
      
      // Clear ward selection
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          ward: '',
          wardCode: ''
        }
      }));
    } catch (error) {
      console.error(`Failed to load wards for district ${districtCode}:`, error);
      addNotification('Không thể tải danh sách phường/xã', 'error');
    } finally {
      setIsLoadingWards(false);
    }
  };  // Tính toán độ mạnh của mật khẩu (thang điểm 0-100)
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let score = 0;
    
    // Độ dài cơ bản
    if (password.length >= 8) score += 20;
    if (password.length >= 10) score += 10;
    if (password.length >= 12) score += 10;
    
    // Đa dạng ký tự
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 15;
    
    // Sự đa dạng trong mật khẩu
    const uniqueChars = [...new Set(password.split(''))].length;
    const variety = uniqueChars / password.length;
    score += Math.round(variety * 10);
    
    // Giới hạn ở mức 100
    return Math.min(score, 100);
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Cập nhật độ mạnh mật khẩu nếu đang thay đổi trường mật khẩu
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
    
    // Handle address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      
      // Handle province selection for address
      if (addressField === 'city') {
        const selectedProvince = provinces.find(p => p.name === value);
        if (selectedProvince) {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              city: value,
              provinceCode: selectedProvince.code,
              district: '',
              districtCode: '',
              ward: '',
              wardCode: ''
            }
          }));
          
          // Load districts for the selected province
          loadDistricts(selectedProvince.code);
        } else {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              city: value,
              provinceCode: '',
              district: '',
              districtCode: '',
              ward: '',
              wardCode: ''
            }
          }));
          setDistricts([]);
          setWards([]);
        }
      }
      // Handle district selection for address
      else if (addressField === 'district') {
        const selectedDistrict = districts.find(d => d.name === value);
        if (selectedDistrict) {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              district: value,
              districtCode: selectedDistrict.code,
              ward: '',
              wardCode: ''
            }
          }));
          
          // Load wards for the selected district
          loadWards(selectedDistrict.code);
        } else {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              district: value,
              districtCode: '',
              ward: '',
              wardCode: ''
            }
          }));
          setWards([]);
        }
      }
      // Handle ward selection for address
      else if (addressField === 'ward') {
        const selectedWard = wards.find(w => w.name === value);
        if (selectedWard) {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              ward: value,
              wardCode: selectedWard.code
            }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              ward: value,
              wardCode: ''
            }
          }));
        }
      }
      // Handle other address fields
      else {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [addressField]: value
          }
        }));
      }
    } else {
      // Handle regular form fields
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };  // Hàm kiểm tra tính mạnh của mật khẩu theo tiêu chuẩn quốc tế
  const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Mật khẩu phải có ít nhất ${minLength} ký tự`);
    }
    if (!hasUpperCase) {
      errors.push("Phải có ít nhất 1 chữ cái viết hoa (A-Z)");
    }
    if (!hasLowerCase) {
      errors.push("Phải có ít nhất 1 chữ cái viết thường (a-z)");
    }
    if (!hasNumbers) {
      errors.push("Phải có ít nhất 1 số (0-9)");
    }
    if (!hasSpecialChars) {
      errors.push("Phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)");
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  const validateForm = () => {
    const newErrors = {};    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.username) {
      newErrors.username = "Tên đăng nhập là bắt buộc";
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên đăng nhập cần ít nhất 3 ký tự";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else {
      // Kiểm tra tính mạnh của mật khẩu
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors.join(", ");
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    if (formData.firstname && formData.firstname.trim().length < 2) {
      newErrors.firstname = "Tên cần ít nhất 2 ký tự";
    }
    if (formData.lastname && formData.lastname.trim().length < 2) {
      newErrors.lastname = "Họ cần ít nhất 2 ký tự";
    }

    if (
      formData.phone &&
      !/^[0-9]{10,11}$/.test(formData.phone.replace(/\D/g, ""))
    ) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }    if (!formData.termsAgreed) {
      newErrors.termsAgreed = "Bạn cần đồng ý với điều khoản để đăng ký";
    }    // Address validation (required)
    if (!formData.address.street) {
      newErrors['address.street'] = "Địa chỉ cụ thể là bắt buộc";
    }
    if (!formData.address.city) {
      newErrors['address.city'] = "Tỉnh/Thành phố là bắt buộc";
    }
    if (!formData.address.district) {
      newErrors['address.district'] = "Quận/Huyện là bắt buộc";
    }
    if (!formData.address.ward) {
      newErrors['address.ward'] = "Phường/Xã là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;  };
    const handleSubmit = async (e) => {
    // Ngăn chặn hành vi submit mặc định của form
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { confirmPassword, termsAgreed, ...registerData } = formData;
      
      // Map địa chỉ sang định dạng backend
      registerData.address = {
        ...registerData.address,
        province: registerData.address.city,
        district: registerData.address.district,
        ward: registerData.address.ward,
        address: registerData.address.street
      };

      const response = await register(registerData);
      
      if (response && response.success) {
        addNotification(
          "Đăng ký thành công! Chào mừng bạn đến với CocoNature.",
          "success"
        );
        const from = location.state?.from || "/";
        navigate(from);
      } else {
        // Hiển thị lỗi và giữ nguyên form
        const errorMessage = response?.message || "Email này đã được đăng ký. Vui lòng sử dụng email khác.";
        handleRegistrationError(errorMessage);
        setIsLoading(false); // Đảm bảo tắt trạng thái loading nếu có lỗi
      }
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";
      
      // Xử lý thông báo lỗi từ API
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }      
      handleRegistrationError(errorMessage);
      setIsLoading(false); // Đảm bảo tắt trạng thái loading nếu có lỗi
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${
      process.env.REACT_APP_API_URL || "http://localhost:5000/api"
    }/auth/google`;
  };
  // Hàm xử lý lỗi đăng ký
  const handleRegistrationError = (errorMessage) => {
    // Hiển thị thông báo lỗi dưới dạng toast
    addNotification(errorMessage, "error");
    
    // Khởi tạo object lỗi mới (không dùng prev để tránh giữ lại các lỗi cũ)
    let newErrors = {};
    
    // Kiểm tra loại lỗi và xử lý tương ứng
    if (errorMessage.toLowerCase().includes('email')) {
      // Lỗi liên quan đến email
      newErrors.email = "Email này đã được đăng ký. Vui lòng sử dụng email khác.";
      
      // Focus vào trường email để người dùng dễ sửa
      setTimeout(() => {
        document.getElementById('email')?.focus();
      }, 100);
    } else if (errorMessage.toLowerCase().includes('username')) {
      // Lỗi liên quan đến username
      newErrors.username = "Tên đăng nhập này đã tồn tại. Vui lòng chọn tên đăng nhập khác.";
      
      setTimeout(() => {
        document.getElementById('username')?.focus();
      }, 100);
    } else if (errorMessage.toLowerCase().includes('mật khẩu') || errorMessage.toLowerCase().includes('password')) {
      // Lỗi liên quan đến mật khẩu
      newErrors.password = errorMessage;
      
      setTimeout(() => {
        document.getElementById('password')?.focus();
      }, 100);
    } else {
      // Nếu không nhận diện được loại lỗi cụ thể, hiển thị lỗi chung
      newErrors.general = errorMessage;
    }
    
    // Cập nhật state errors
    setErrors(prevErrors => ({
      ...prevErrors, // Giữ lại các lỗi validate từ các trường khác nếu có
      ...newErrors // Thêm hoặc ghi đè lỗi mới
    }));
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
            <h1 className="auth-title">Đăng Ký</h1>
            <p className="auth-subtitle">
              Tạo tài khoản để trải nghiệm mua sắm cùng CocoNature
            </p>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email của bạn"
                    className={errors.email ? "error" : ""}
                  />
                </div>
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="username">Tên đăng nhập *</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Nhập tên đăng nhập"
                    className={errors.username ? "error" : ""}
                  />
                </div>
                {errors.username && (
                  <span className="error-message">{errors.username}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstname">Tên</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📝</span>
                    <input
                      type="text"
                      id="firstname"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      placeholder="Nhập tên của bạn"
                      className={errors.firstname ? "error" : ""}
                    />
                  </div>
                  {errors.firstname && (
                    <span className="error-message">{errors.firstname}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastname">Họ</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📝</span>
                    <input
                      type="text"
                      id="lastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      placeholder="Nhập họ của bạn"
                      className={errors.lastname ? "error" : ""}
                    />
                  </div>
                  {errors.lastname && (
                    <span className="error-message">{errors.lastname}</span>
                  )}
                </div>
              </div>              <div className="form-group">
                <label htmlFor="password">Mật khẩu *</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu"
                    className={errors.password ? "error" : ""}
                  />
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
                  {/* Hiển thị độ mạnh mật khẩu */}
                {formData.password && (
                  <div className="password-strength-container">
                    <div className="password-strength-bar">
                      <div 
                        className="password-strength-progress" 
                        style={{ 
                          width: `${passwordStrength}%`,
                          backgroundColor: 
                            passwordStrength < 30 ? '#e74c3c' : 
                            passwordStrength < 60 ? '#f39c12' : 
                            passwordStrength < 80 ? '#3498db' : '#2ecc71'
                        }}
                      ></div>
                    </div>
                    <span className="password-strength-text">
                      {passwordStrength < 30 ? 'Yếu' : 
                       passwordStrength < 60 ? 'Trung bình' : 
                       passwordStrength < 80 ? 'Khá mạnh' : 'Mạnh'}
                    </span>
                  </div>
                )}
                
                {/* Hiển thị yêu cầu mật khẩu */}
                <div className="password-requirements">
                  <p className="password-requirements-title">Mật khẩu phải có:</p>
                  <ul>
                    <li className={formData.password.length >= 8 ? "requirement-met" : ""}>
                      Ít nhất 8 ký tự
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? "requirement-met" : ""}>
                      Ít nhất 1 chữ cái viết hoa (A-Z)
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? "requirement-met" : ""}>
                      Ít nhất 1 chữ cái viết thường (a-z)
                    </li>
                    <li className={/\d/.test(formData.password) ? "requirement-met" : ""}>
                      Ít nhất 1 số (0-9)
                    </li>
                    <li className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password) ? "requirement-met" : ""}>
                      Ít nhất 1 ký tự đặc biệt (!@#$%^&*...)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    className={errors.confirmPassword ? "error" : ""}
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="DOB">Ngày sinh</label>
                <div className="input-wrapper">
                  <span className="input-icon">📅</span>
                  <input
                    type="date"
                    id="DOB"
                    name="DOB"
                    value={formData.DOB}
                    onChange={handleChange}
                    className={errors.DOB ? "error" : ""}
                  />
                </div>
                {errors.DOB && (
                  <span className="error-message">{errors.DOB}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="gender">Giới tính</label>
                <div className="input-wrapper">
                  <span className="input-icon">👥</span>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={errors.gender ? "error" : ""}
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
                {errors.gender && (
                  <span className="error-message">{errors.gender}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <div className="input-wrapper">
                  <span className="input-icon">📱</span>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className={errors.phone ? "error" : ""}
                  />
                </div>
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}              </div>

              {/* Địa chỉ: Gộp vào layout chung */}
              <div className="form-group">
                <label htmlFor="address.city">Tỉnh/Thành phố *</label>
                <div className="input-wrapper">
                  <span className="input-icon">🏙️</span>
                  <select
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className={errors['address.city'] ? "error" : ""}
                    disabled={isLoadingProvinces}
                  >
                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors['address.city'] && (
                  <span className="error-message">{errors['address.city']}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address.district">Quận/Huyện *</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🏘️</span>
                    <select
                      id="address.district"
                      name="address.district"
                      value={formData.address.district}
                      onChange={handleChange}
                      className={errors['address.district'] ? "error" : ""}
                      disabled={isLoadingDistricts || !formData.address.city}
                    >
                      <option value="">-- Chọn Quận/Huyện --</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors['address.district'] && (
                    <span className="error-message">{errors['address.district']}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="address.ward">Phường/Xã *</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🏠</span>
                    <select
                      id="address.ward"
                      name="address.ward"
                      value={formData.address.ward}
                      onChange={handleChange}
                      className={errors['address.ward'] ? "error" : ""}
                      disabled={isLoadingWards || !formData.address.district}
                    >
                      <option value="">-- Chọn Phường/Xã --</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.name}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors['address.ward'] && (
                    <span className="error-message">{errors['address.ward']}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address.street">Địa chỉ cụ thể *</label>
                <div className="input-wrapper">
                  <span className="input-icon">📍</span>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường..."
                    className={errors['address.street'] ? "error" : ""}
                  />
                </div>
                {errors['address.street'] && (
                  <span className="error-message">{errors['address.street']}</span>
                )}
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="termsAgreed"
                  name="termsAgreed"
                  checked={formData.termsAgreed}
                  onChange={handleChange}
                />
                <label htmlFor="termsAgreed">
                  Tôi đồng ý với{" "}
                  <Link to="/terms-and-conditions">Điều khoản dịch vụ</Link> và{" "}
                  <Link to="/privacy-policy">Chính sách bảo mật</Link>
                </label>
              </div>              {errors.termsAgreed && (
                <span className="error-message">{errors.termsAgreed}</span>
              )}

              {errors.general && (
                <div className="error-message general-error">{errors.general}</div>
              )}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={isLoading || contextLoading}
              >
                {isLoading ? <span className="spinner"></span> : "Đăng Ký"}
              </button>

              <div className="auth-divider">
                <span>Hoặc</span>
              </div>

              <button
                type="button"
                className="google-login-button"
                onClick={handleGoogleLogin}
              >
                <img
                  src="/google-icon.png"
                  alt="Google"
                  className="google-icon"
                />
                Đăng ký với Google
              </button>
            </form>

            <div className="auth-switch">
              <p>
                Đã có tài khoản?{" "}
                <Link to="/login" className="auth-switch-link">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>

          <div className="auth-image-container">
            <div
              className="auth-image"
              style={{ backgroundImage: 'url("/images/register-image.jpg")' }}
            ></div>
          </div>
        </div>
      </main>

      <MainFooter />
    </div>
  );
};

export default RegisterPage;
