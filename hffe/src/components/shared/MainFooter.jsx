import React from 'react';
import { Link } from 'react-router-dom';
import './MainFooter.css';
import { 
  FaFacebook, FaTwitter, FaInstagram, FaYoutube,
  FaPhoneAlt, FaMapMarkerAlt, FaEnvelope
} from 'react-icons/fa';
import logoImage from "../../assets/logo-placeholder.png";
import paymentMethodsImage from "../../assets/payment-methods-placeholder.png";

const MainFooter = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-top">          <div className="footer-column company-info">
            <div className="footer-logo">
              <img src={logoImage} alt="Han Foods Logo" />
              <h3>Han Foods</h3>
            </div>
            <p className="company-description">
              Han Foods tự hào cung cấp các sản phẩm thực phẩm sạch,
              an toàn và giàu dinh dưỡng từ nguồn nguyên liệu thiên nhiên,
              góp phần xây dựng một cuộc sống khỏe mạnh cho cộng đồng.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
            </div>
          </div>

          <div className="footer-column quick-links">
            <h4>Điều Hướng</h4>
            <ul>
              <li><Link to="/">Trang Chủ</Link></li>
              <li><Link to="/san-pham">Sản Phẩm</Link></li>
              <li><Link to="/aboutus">Về Chúng Tôi</Link></li>
              <li><Link to="/contact">Liên Hệ</Link></li>
              <li><Link to="/tin-tuc">Tin Tức & Khuyến Mãi</Link></li>
            </ul>
          </div>

          <div className="footer-column policies">
            <h4>Chính Sách</h4>
            <ul>
              <li><Link to="/chinh-sach-giao-hang">Chính Sách Giao Hàng</Link></li>
              <li><Link to="/chinh-sach-doi-tra">Đổi Trả & Hoàn Tiền</Link></li>
              <li><Link to="/chinh-sach-bao-mat">Bảo Mật Thông Tin</Link></li>
              <li><Link to="/dieu-khoan-dich-vu">Điều Khoản Dịch Vụ</Link></li>
              <li><Link to="/thanh-toan">Phương Thức Thanh Toán</Link></li>
            </ul>
          </div>

          <div className="footer-column contact-info">
            <h4>Liên Hệ</h4>
            <div className="contact-item">
              <FaMapMarkerAlt />
              <span>123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</span>
            </div>
            <div className="contact-item">
              <FaPhoneAlt />
              <span>1900 1234 56</span>
            </div>
            <div className="contact-item">
              <FaEnvelope />
              <span>hotro@hanfoods.com</span>
            </div>
            <div className="business-hours">
              <h5>Giờ làm việc:</h5>
              <p>Thứ Hai - Thứ Bảy: 8:00 - 21:00</p>
              <p>Chủ Nhật: 8:00 - 18:00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container">
          <div className="copyright">
            <p>&copy; {new Date().getFullYear()} Han Foods. Tất cả các quyền được bảo lưu.</p>
          </div>          <div className="payment-methods">
            <span>Chấp nhận thanh toán:</span>
            <img src={paymentMethodsImage} alt="Payment Methods" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;
