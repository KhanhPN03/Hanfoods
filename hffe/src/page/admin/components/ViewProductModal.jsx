import React from 'react';
import { X, Package, DollarSign, BarChart3, Calendar, Tag, Image as ImageIcon } from 'lucide-react';

const ViewProductModal = ({ isVisible, onClose, product }) => {
  if (!isVisible || !product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Hết hàng', className: 'out-of-stock' };
    if (stock < 10) return { text: 'Sắp hết', className: 'low-stock' };
    return { text: 'Còn hàng', className: 'in-stock' };
  };

  const getProductStatus = (status) => {
    if (status === 'active') return { text: 'Hoạt động', className: 'active' };
    return { text: 'Không hoạt động', className: 'inactive' };
  };

  const stockStatus = getStockStatus(product.stock || 0);
  const productStatus = getProductStatus(product.status);

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div 
        className="view-product-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Header */}
        <div 
          className="modal-header"
          style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280'
              }}
            >
              <Package size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                Chi tiết sản phẩm
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                Thông tin đầy đủ về sản phẩm
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              color: '#6b7280',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#374151'}
            onMouseOut={(e) => e.target.style.color = '#6b7280'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
            {/* Images Section */}
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Hình ảnh sản phẩm</h3>
              <div 
                style={{
                  aspectRatio: '1',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '2px dashed #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {product.thumbnailImage ? (
                  <img 
                    src={product.thumbnailImage} 
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                    <ImageIcon size={48} />
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Không có hình ảnh</p>
                  </div>
                )}
              </div>
              
              {product.images && product.images.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '500' }}>Hình ảnh bổ sung</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
                    {product.images.slice(0, 4).map((image, index) => (
                      <img 
                        key={index}
                        src={image} 
                        alt={`${product.name} ${index + 1}`}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Information */}
            <div>
              {/* Basic Info */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Thông tin cơ bản</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                    Tên sản phẩm
                  </label>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    {product.name}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                    Mã sản phẩm
                  </label>
                  <div style={{ fontSize: '14px', color: '#374151', fontFamily: 'monospace' }}>
                    {product.productId || product._id}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                      Danh mục
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#374151'
                    }}>
                      <Tag size={14} />
                      {product.categoryId?.name || product.category || 'Chưa phân loại'}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                      Trạng thái
                    </label>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: productStatus.className === 'active' ? '#dcfce7' : '#fef2f2',
                      color: productStatus.className === 'active' ? '#166534' : '#dc2626'
                    }}>
                      {productStatus.text}
                    </span>
                  </div>
                </div>

                {product.description && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                      Mô tả
                    </label>
                    <div style={{ 
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#374151',
                      lineHeight: '1.5'
                    }}>
                      {product.description}
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing & Stock */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Giá & Tồn kho</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <DollarSign size={16} color="#166534" />
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#166534' }}>Giá bán</label>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#166534' }}>
                      {formatPrice(product.price)}
                    </div>
                  </div>

                  {product.salePrice && (
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px',
                      border: '1px solid #fcd34d'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <DollarSign size={16} color="#92400e" />
                        <label style={{ fontSize: '12px', fontWeight: '500', color: '#92400e' }}>Giá KM</label>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#92400e' }}>
                        {formatPrice(product.salePrice)}
                      </div>
                    </div>
                  )}

                  <div style={{
                    padding: '16px',
                    backgroundColor: stockStatus.className === 'out-of-stock' ? '#fef2f2' : 
                                   stockStatus.className === 'low-stock' ? '#fef3c7' : '#f0f9ff',
                    borderRadius: '8px',
                    border: `1px solid ${stockStatus.className === 'out-of-stock' ? '#fecaca' : 
                                        stockStatus.className === 'low-stock' ? '#fcd34d' : '#bae6fd'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <BarChart3 size={16} color={
                        stockStatus.className === 'out-of-stock' ? '#dc2626' : 
                        stockStatus.className === 'low-stock' ? '#d97706' : '#0284c7'
                      } />
                      <label style={{ 
                        fontSize: '12px', 
                        fontWeight: '500', 
                        color: stockStatus.className === 'out-of-stock' ? '#dc2626' : 
                               stockStatus.className === 'low-stock' ? '#d97706' : '#0284c7'
                      }}>
                        Tồn kho
                      </label>
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: stockStatus.className === 'out-of-stock' ? '#dc2626' : 
                             stockStatus.className === 'low-stock' ? '#d97706' : '#0284c7'
                    }}>
                      {product.stock || 0}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      marginTop: '4px',
                      color: stockStatus.className === 'out-of-stock' ? '#dc2626' : 
                             stockStatus.className === 'low-stock' ? '#d97706' : '#0284c7'
                    }}>
                      {stockStatus.text}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Thông tin khác</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} color="#6b7280" />
                    <span style={{ color: '#6b7280' }}>Ngày tạo:</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>{formatDate(product.createdAt)}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} color="#6b7280" />
                    <span style={{ color: '#6b7280' }}>Cập nhật:</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>{formatDate(product.updatedAt)}</span>
                  </div>

                  {product.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#6b7280' }}>Đánh giá:</span>
                      <span style={{ color: '#111827', fontWeight: '500' }}>
                        ⭐ {product.rating}/5 ({product.reviewCount || 0} lượt)
                      </span>
                    </div>
                  )}

                  {product.materials && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#6b7280' }}>Chất liệu:</span>
                      <span style={{ color: '#111827', fontWeight: '500' }}>{product.materials}</span>
                    </div>
                  )}

                  {product.dimensions && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#6b7280' }}>Kích thước:</span>
                      <span style={{ color: '#111827', fontWeight: '500' }}>{product.dimensions}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          style={{
            padding: '20px 24px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            ID: {product._id}
          </div>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'backgroundColor 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;
