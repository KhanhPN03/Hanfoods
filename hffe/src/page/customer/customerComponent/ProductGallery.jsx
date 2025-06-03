import React, { useState, useEffect, useCallback, useRef } from 'react';

// Hàm kiểm tra URL hợp lệ và fallback nếu cần
const getValidImageUrl = (url, fallbackText = 'Không+Có+Hình+Ảnh') => {
  if (!url || typeof url !== 'string' || url.trim() === '' || 
      (!url.startsWith('http://') && !url.startsWith('https://')) ||
      url.includes('via.placeholder.com')) {
    return `https://placeholder.pics/svg/450x450/${fallbackText.replace(/\s+/g, '+')}`;
  }
  return url;
};

const ProductGallery = ({ product }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true); // Enable auto-play by default
  const autoPlayRef = useRef();
  
  // Get images from product or use defaults
  const thumbnailImage = product?.thumbnailImage || '';
  const productImages = product?.images || [];
  
  // Ensure thumbnailImage is included in the gallery
  const allImages = thumbnailImage 
    ? [thumbnailImage, ...productImages.filter(img => img !== thumbnailImage)]
    : productImages;
    
  // If no images are available, use placeholders
  const displayImages = allImages.length > 0 
    ? allImages.map(img => getValidImageUrl(img, product?.name || 'Sản phẩm'))
    : [getValidImageUrl(null, product?.name || 'Không có hình ảnh')];

  const goToNextImage = useCallback(() => {
    setActiveImageIndex((current) => 
      current === displayImages.length - 1 ? 0 : current + 1
    );
  }, [displayImages.length]);

  const goToPrevImage = useCallback(() => {
    setActiveImageIndex((current) => 
      current === 0 ? displayImages.length - 1 : current - 1
    );
  }, [displayImages.length]);

  // Auto-sliding functionality
  useEffect(() => {
    if (!isAutoPlaying || displayImages.length <= 1) return;
    autoPlayRef.current = setInterval(goToNextImage, 8000);
    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlaying, goToNextImage, displayImages.length]);

  // Pause auto-play when hovering over the gallery
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Reset timer on manual click
  const handleManualSelect = (index) => {
    setActiveImageIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 1000); // Resume after 1s
  };

  const handleNavClick = (direction) => {
    if (direction === 'prev') goToPrevImage();
    else goToNextImage();
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 1000);
  };

  // Get the currently active image
  const activeImage = displayImages[activeImageIndex] || displayImages[0];

  return (
    <div 
      className="product-gallery"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main image container */}
      <div className="main-image-container" style={{ border: '2px solid var(--color-accent)', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(60,60,40,0.04)' }}>
        <img 
          src={activeImage} 
          alt={product?.name || 'Sản phẩm'} 
        />
        
        {/* Navigation buttons */}
        {displayImages.length > 1 && (
          <>
            <button 
              className="gallery-nav-button prev"
              onClick={() => handleNavClick('prev')}
              aria-label="Hình ảnh trước"
              tabIndex={0}
            >
              &#10094;
            </button>
            <button 
              className="gallery-nav-button next"
              onClick={() => handleNavClick('next')}
              aria-label="Hình ảnh tiếp theo"
              tabIndex={0}
            >
              &#10095;
            </button>
          </>
        )}

        {/* Discount badge if exists */}
        {product?.discount && (
          <span className="discount-badge">{product.discount}</span>
        )}
      </div>
      
      {/* Horizontal thumbnails */}
      <div className="product-thumbnails">
        {displayImages.map((image, index) => (
          <button 
            key={index}
            className={`thumbnail-item ${index === activeImageIndex ? 'active' : ''}`}
            onClick={() => handleManualSelect(index)}
            tabIndex={0}
          >
            <img 
              src={image} 
              alt={`${product?.name || 'Sản phẩm'} - Ảnh ${index + 1}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
