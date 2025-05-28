import React, { useState } from 'react';
import MainHeader from '../../components/shared/MainHeader';
import MainFooter from '../../components/shared/MainFooter';
import './css/Contact.css';
import { 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaClock, 
  FaFacebook, 
  FaTwitter, 
  FaInstagram 
} from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Vui lòng nhập tên của bạn';
    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email của bạn';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    if (!formData.message.trim()) errors.message = 'Vui lòng nhập nội dung tin nhắn';
    
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Mô phỏng gửi thành công
    setFormSuccess('Cảm ơn bạn đã liên hệ với chúng tôi! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });

    // Reset form success message sau 5 giây
    setTimeout(() => {
      setFormSuccess('');
    }, 5000);
  };

  // Scrolls to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="contact-page">
      <MainHeader />
      
      <div className="page-content">
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="container">
            <h1>Liên Hệ Với Chúng Tôi</h1>
            <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="contact-info-section">
          <div className="container">
            <div className="contact-info-grid">
              <div className="contact-card">
                <div className="contact-icon">
                  <FaMapMarkerAlt />
                </div>
                <h3>Địa Chỉ</h3>
                <p>123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">
                  <FaPhoneAlt />
                </div>
                <h3>Điện Thoại</h3>
                <p>1900 1234 56</p>
                <p>+84 901 234 567</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">
                  <FaEnvelope />
                </div>
                <h3>Email</h3>
                <p>hotro@hanfoods.com</p>
                <p>lienhe@hanfoods.com</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">
                  <FaClock />
                </div>
                <h3>Giờ Làm Việc</h3>
                <p>Thứ Hai - Thứ Bảy: 8:00 - 21:00</p>
                <p>Chủ Nhật: 8:00 - 18:00</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form & Map Section */}
        <section className="contact-form-section">
          <div className="container">
            <div className="contact-form-grid">
              <div className="contact-form">
                <h2>Gửi Tin Nhắn</h2>
                <p>Hãy để lại thông tin và chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
                
                {formSuccess && <div className="form-success">{formSuccess}</div>}
                
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Họ và tên *</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name}
                      onChange={handleChange}
                      className={formErrors.name ? 'error' : ''}
                    />
                    {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleChange}
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
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">Chủ đề</label>
                    <input 
                      type="text" 
                      id="subject" 
                      name="subject" 
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">Tin nhắn *</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows="5" 
                      value={formData.message}
                      onChange={handleChange}
                      className={formErrors.message ? 'error' : ''}
                    ></textarea>
                    {formErrors.message && <div className="error-message">{formErrors.message}</div>}
                  </div>
                  
                  <button type="submit" className="submit-btn">Gửi tin nhắn</button>
                </form>
              </div>
              
              <div className="contact-map">
                <div className="map-container">
                  <iframe 
                    title="Han Foods Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5177580457546!2d106.69858927513472!3d10.771717989387894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670702e31%3A0xe4f9240fe56fc7a!2sLe%20Loi%2C%20District%201%2C%20Ho%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2sus!4v1590383590110!5m2!1sen!2sus" 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    allowFullScreen="" 
                    aria-hidden="false" 
                    tabIndex="0"
                  ></iframe>
                </div>
                <div className="social-connect">
                  <h3>Kết Nối Với Chúng Tôi</h3>
                  <div className="social-icons">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="facebook">
                      <FaFacebook />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="twitter">
                      <FaTwitter />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="instagram">
                      <FaInstagram />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="container">
            <h2>Câu Hỏi Thường Gặp</h2>
            
            <div className="faq-grid">
              <div className="faq-item">
                <h3>Làm thế nào để đặt hàng trực tuyến?</h3>
                <p>Bạn có thể dễ dàng đặt hàng trực tuyến bằng cách truy cập mục Sản phẩm, chọn sản phẩm muốn mua, thêm vào giỏ hàng và tiến hành thanh toán. Bạn sẽ nhận được xác nhận đơn hàng qua email.</p>
              </div>
              <div className="faq-item">
                <h3>Thời gian giao hàng là bao lâu?</h3>
                <p>Thời gian giao hàng từ 1-3 ngày làm việc đối với khu vực nội thành và 3-5 ngày đối với các tỉnh thành khác, tùy thuộc vào địa điểm giao hàng.</p>
              </div>
              <div className="faq-item">
                <h3>Phí vận chuyển được tính như thế nào?</h3>
                <p>Phí vận chuyển được tính dựa trên khoảng cách và khối lượng đơn hàng. Chúng tôi áp dụng miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên.</p>
              </div>
              <div className="faq-item">
                <h3>Chính sách đổi trả sản phẩm?</h3>
                <p>Chúng tôi chấp nhận đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm còn nguyên vẹn, chưa sử dụng và có hóa đơn mua hàng.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <MainFooter />
    </div>
  );
};

export default Contact;
