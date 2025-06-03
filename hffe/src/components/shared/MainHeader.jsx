import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import "./MainHeader.css";
import { FaUser, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
// Import a default logo image
import logoImage from "../../assets/logo-placeholder.png";

const MainHeader = () => {
  const { user, logout, cart } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSticky, setIsSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimer = useRef(null);
  const accountContainerRef = useRef(null);
  const dropdownRef = useRef(null);
  const totalItems = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Xử lý header sticky khi scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  // Xử lý đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownOpen &&
        accountContainerRef.current && 
        !accountContainerRef.current.contains(event.target) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Xử lý đóng dropdown khi dropdown timer hết hạn
  useEffect(() => {
    return () => {
      if (dropdownTimer.current) {
        clearTimeout(dropdownTimer.current);
      }
    };
  }, []);

  // Scroll đến phần sản phẩm
  const scrollToProducts = () => {
    if (location.pathname === "/") {
      const productsSection = document.getElementById("product-showcase");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/#product-showcase");
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate("/login");
    setDropdownOpen(false);
  };

  return (
    <header className={`main-header ${isSticky ? "sticky" : ""}`}>
      <div className="header-container">        {/* Phần 1: Logo và tên công ty */}
        <div className="header-logo">
          <Link to="/" className="logo-container">
            <img
              src={logoImage}
              alt="Han Foods Logo"
              className="logo-image"
            />
            <span className="company-name">Han Foods</span>
          </Link>
        </div>

        {/* Phần 2: Navigation Links - Chỉ hiển thị trên desktop và tablet */}
        <nav className="header-nav">
          <ul className="nav-links">            <li>
              <Link to="/">Trang chủ</Link>
            </li>
            <li>
              <button 
                onClick={scrollToProducts}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 0',
                  font: 'inherit',
                  color: 'inherit',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '16px',
                  position: 'relative'
                }}
              >
                Sản phẩm
              </button>
            </li>
            <li>
              <Link to="/aboutus">Về chúng tôi</Link>
            </li>
            <li>
              <Link to="/contact">Liên hệ</Link>
            </li>
          </ul>
        </nav>

        {/* Phần 3: User Actions */}
        <div className="header-actions">
          {/* Giỏ hàng */}
          <Link to="/cart" className="cart-icon-container">
            <FaShoppingCart className="icon" />
            <span className="action-text">Giỏ hàng</span>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>          {/* User account */}
          <div
            className="user-account-container"
            ref={accountContainerRef}
            onMouseEnter={() => {
              // Xóa timer đóng dropdown nếu có
              if (dropdownTimer.current) {
                clearTimeout(dropdownTimer.current);
                dropdownTimer.current = null;
              }
              setDropdownOpen(true);
            }}
            onMouseLeave={() => {
              // Đặt timer trễ 500ms trước khi đóng dropdown
              dropdownTimer.current = setTimeout(() => {
                setDropdownOpen(false);
              }, 500);
            }}
          >
            <div className="user-account">
              <FaUser className="icon" />
              <span
                className="action-text"
                onClick={() => {
                  if (user) {
                    navigate("/profile");
                  } else {
                    navigate("/login");
                  }
                }}
              >
                {user
                  ? user.username || user.firstname || "Tài khoản"
                  : "Đăng nhập"}
              </span>
              {user && <IoIosArrowDown className="dropdown-arrow" />}
            </div>            {/* Dropdown menu khi đã đăng nhập */}
            {user && dropdownOpen && (
              <div 
                className="user-dropdown"
                ref={dropdownRef}
                onMouseEnter={() => {
                  // Khi chuột vào dropdown, xóa timer đóng
                  if (dropdownTimer.current) {
                    clearTimeout(dropdownTimer.current);
                    dropdownTimer.current = null;
                  }
                }}
                onMouseLeave={() => {
                  // Đặt timer trễ 300ms trước khi đóng dropdown khi rời khỏi nó
                  dropdownTimer.current = setTimeout(() => {
                    setDropdownOpen(false);
                  }, 300);
                }}
              >
                <Link to="/profile" className="dropdown-item">
                  Thông tin cá nhân
                </Link>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/profile', { state: { tab: 'orders' } });
                    setDropdownOpen(false);
                  }}
                >
                  Đơn hàng của tôi
                </button>
                <Link to="/danh-sach-yeu-thich" className="dropdown-item">
                  Danh sách yêu thích
                </Link>
                <button
                  onClick={handleLogout}
                  className="dropdown-item logout-btn"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile navigation sidebar */}
      <div className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-nav-content">
          <ul className="mobile-nav-links">            <li>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                Trang chủ
              </Link>
            </li>
            <li>
              <button
                style={{
                  display: 'block',
                  padding: '12px 24px',
                  color: '#333',
                  textDecoration: 'none',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  font: 'inherit'
                }}
                onClick={() => {
                  scrollToProducts();
                  setMobileMenuOpen(false);
                }}
              >
                Sản phẩm
              </button>
            </li>
            <li>
              <Link to="/aboutus" onClick={() => setMobileMenuOpen(false)}>
                Về chúng tôi
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                Liên hệ
              </Link>
            </li>

            <li className="divider"></li>

            {user ? (
              <>
                <li>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    Thông tin cá nhân
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      navigate('/profile', { state: { tab: 'orders' } });
                      setMobileMenuOpen(false);
                    }}
                  >
                    Đơn hàng của tôi
                  </button>
                </li>
                <li>
                  <Link
                    to="/danh-sach-yeu-thich"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Danh sách yêu thích
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    Đăng xuất
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  Đăng nhập
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Overlay to close mobile nav when clicking outside */}
        <div
          className="mobile-nav-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      </div>
    </header>
  );
};

export default MainHeader;
