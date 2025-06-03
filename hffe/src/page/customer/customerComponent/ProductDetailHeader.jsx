import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductDetailHeader = ({ product, cartItemCount }) => {
  const navigate = useNavigate();
  
  return (
    <>
      <header className="product-detail-header">
        <div className="header-content">
          <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-text">CocoNature</span>
            <span className="header-slogan">Sản Phẩm Dừa Hữu Cơ</span>
          </div>
          
          <nav className="header-nav">
            <button onClick={() => navigate('/')} className="nav-link">Trang Chủ</button>
            <button onClick={() => navigate('/products')} className="nav-link">Sản Phẩm</button>
            <button onClick={() => navigate('/about')} className="nav-link">Về Chúng Tôi</button>
            <button onClick={() => navigate('/contact')} className="nav-link">Liên Hệ</button>
          </nav>
          
          <div className="header-icons">
            <button className="icon-btn search-btn" aria-label="Tìm Kiếm">
              <i className="search-icon"></i>
            </button>
            <button className="icon-btn cart-btn" onClick={() => navigate('/cart')} aria-label="Giỏ Hàng">
              <i className="cart-icon"></i>
              {cartItemCount > 0 && <span className="badge">{cartItemCount}</span>}
            </button>
            <button className="icon-btn account-btn" aria-label="Tài Khoản">
              <i className="account-icon"></i>
            </button>
            <button className="mobile-menu-btn" aria-label="Menu">
              <span className="menu-icon"></span>
            </button>
          </div>
        </div>
      </header>

      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <button onClick={() => navigate('/')} className="breadcrumb-link">Trang Chủ</button>
          <span className="breadcrumb-separator">/</span>
          <button onClick={() => navigate('/products')} className="breadcrumb-link">Sản Phẩm</button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product?.name || 'Chi Tiết Sản Phẩm'}</span>
        </div>
      </div>
    </>
  );
};

export default ProductDetailHeader;
