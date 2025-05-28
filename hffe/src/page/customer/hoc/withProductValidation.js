import React from 'react';

// HOC to ensure product has all required properties
const withProductValidation = (WrappedComponent) => {
  return function WithProductValidation(props) {
    const { product, ...otherProps } = props;
    
    // If product is not provided or is loading
    if (!product) {
      return <div className="loading-product">Đang tải thông tin sản phẩm...</div>;
    }
    
    // Log validation start for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('Product validation started for:', product.name || 'Unknown product');
    }
      // Ensure product has all required fields with default values
    const validatedProduct = {
      id: product.id || '',
      name: product.name || 'Sản phẩm',
      description: product.description || 'Không có mô tả',
      price: product.price || 0,
      originalPrice: product.originalPrice || null,
      discount: product.discount || null,
      rating: product.rating || 4.5,
      reviewCount: product.reviewCount || 0,
      stock: product.stock || 0,
      inStock: product.inStock ?? (product.stock > 0),
      // Use thumbnailImage as the primary image
      thumbnailImage: product.thumbnailImage || product.mainImage || product.imageUrl || '',
      // Maintain backward compatibility
      mainImage: product.thumbnailImage || product.mainImage || product.imageUrl || '',
      imageUrl: product.thumbnailImage || product.imageUrl || product.mainImage || '',
      // Ensure images array exists
      images: Array.isArray(product.images) ? product.images : 
              (product.thumbnailImage ? [product.thumbnailImage] : []),
      category: product.category || 'Sản phẩm',
      materials: product.materials || 'Vỏ dừa tự nhiên',
      dimensions: product.dimensions || 'Đường kính: 10cm, Chiều cao: 12cm',
      stockQuantity: product.stockQuantity || product.stock || 0,
      sold: product.sold || 0,
      // Product card specific properties
      stars: product.stars || '★★★★☆',
      rawPrice: product.rawPrice || (typeof product.price === 'number' ? product.price : 0),
      rawOriginalPrice: product.rawOriginalPrice || 
                       (typeof product.originalPrice === 'number' ? product.originalPrice : null),
      imageClass: product.imageClass || 'coconutProduct',
      badge: product.badge || null,
      // Preserve any other properties from the original product
      ...product
    };
    
    // Remove any undefined values
    Object.keys(validatedProduct).forEach(key => {
      if (validatedProduct[key] === undefined) {
        delete validatedProduct[key];
      }
    });
    
    return <WrappedComponent product={validatedProduct} {...otherProps} />;
  };
};

export default withProductValidation;
