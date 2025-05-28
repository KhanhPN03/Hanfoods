import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../context/AppContext';
import { productAPI } from '../../../services/apiService';
import ProductCard from './ProductCard';

// Chỉ giữ lại CSS chính cần thiết
import '../css/productGrid.css';

const ProductSuggestions = ({ currentProductId }) => {
  // We don't use navigate but keep it for potential future use when clicking on products
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const { 
    // eslint-disable-next-line no-unused-vars
    addToCart, // Keep for potential future quick-add functionality
    cacheProducts, 
    getCachedProducts, 
    isCacheValid 
  } = useAppContext();
  
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
    // Format product from API response with useCallback to prevent re-renders
  const formatProduct = useCallback((product) => {
    // Hàm kiểm tra URL hợp lệ cho hình ảnh
    const getValidImageUrl = (url) => {
      if (!url || typeof url !== 'string' || url.trim() === '' || 
          (!url.startsWith('http://') && !url.startsWith('https://'))) {
        const productName = product.name ? encodeURIComponent(product.name.replace(/\s+/g, '+')) : 'Product';
        return `https://placeholder.pics/svg/300x300/${productName}`;
      }
      return url;
    };

    // Xử lý hình ảnh
    const imageUrl = getValidImageUrl(product.thumbnailImage || product.imageUrl);

    return {
      id: product._id,
      name: product.name,
      price: product.salePrice > 0 ? product.salePrice : product.price,
      originalPrice: product.salePrice > 0 ? product.price : null,
      description: product.description,
      imageUrl: imageUrl,
      thumbnailImage: imageUrl,
      images: Array.isArray(product.images) ? product.images.map(getValidImageUrl) : [imageUrl],
      category: product.categoryId?.name || 'Sản phẩm',
      stock: product.stock || 0,
      inStock: (product.stock || 0) > 0,
      reviewCount: product.reviewCount || 0,
      stars: '★★★★☆'
    };
  }, []);
  
  // Fetch related products with stable dependencies
  useEffect(() => {
    // Keep track of fetch status locally
    const abortController = new AbortController();
    let isMounted = true;
    
    const fetchSuggestedProducts = async () => {
      // Cache key for related products
      const cacheKey = `relatedProducts_${currentProductId}`;
      
      try {
        // Check if we have valid cached products
        if (isCacheValid(cacheKey)) {
          const cachedProducts = getCachedProducts(cacheKey);
          if (cachedProducts && cachedProducts.length > 0) {
            console.log('Using cached related products');
            setSuggestedProducts(cachedProducts);
            setLoading(false);
            return;
          }
        }
        
        // Show loading only if necessary
        setLoading(true);
        
        // Set timeout for fetch operation
        const timeoutId = setTimeout(() => {
          if (isMounted) {
            abortController.abort();
          }
        }, 5000); // 5 second timeout
        
        // Fetch recent products as suggestions
        const response = await productAPI.getAllProducts({ 
          limit: 8,
          sortBy: 'createdAt',
          order: 'desc',
          signal: abortController.signal
        });
        
        clearTimeout(timeoutId);
        
        // Only continue if component still mounted
        if (!isMounted) return;
        
        let productsToShow = [];
        
        if (response.data && response.data.products && Array.isArray(response.data.products)) {
          // Filter out the current product
          const filteredProducts = response.data.products
            .filter(product => product._id !== currentProductId)
            .slice(0, 4); // Ensure we have max 4 products
          
          // Format products for display
          productsToShow = filteredProducts.map(formatProduct);
          
          // If we got less than 4 suggestions, use sample data to supplement
          if (productsToShow.length < 4) {        // Sample product data if API returns insufficient results
            const sampleProducts = [
              {
                id: 'sample1',
                name: 'Bình hoa vỏ dừa handmade',
                price: 159000,
                originalPrice: 190000,
                description: 'Bình hoa vỏ dừa thủ công đẹp',
                imageUrl: 'https://placeholder.pics/svg/300x300/Binh+Hoa+Dua',
                thumbnailImage: 'https://placeholder.pics/svg/300x300/Binh+Hoa+Dua',
                images: ['https://placeholder.pics/svg/300x300/Binh+Hoa+Dua'],
                category: 'Đồ trang trí',
                stock: 15,
                inStock: true,
                reviewCount: 12,
                stars: '★★★★☆'
              },
              {
                id: 'sample2',
                name: 'Tô salad vỏ dừa tự nhiên',
                price: 129000,
                description: 'Tô đựng salad từ vỏ dừa tự nhiên',
                imageUrl: 'https://placeholder.pics/svg/300x300/To+Dua',
                thumbnailImage: 'https://placeholder.pics/svg/300x300/To+Dua',
                images: ['https://placeholder.pics/svg/300x300/To+Dua'],
                category: 'Đồ nhà bếp',
                stock: 20,
                inStock: true,
                reviewCount: 8,
                stars: '★★★★★'
              },
              {                id: 'sample3',
                name: 'Bộ muỗng vỏ dừa (6 cái)',
                price: 99000,
                originalPrice: 120000,
                description: 'Bộ muỗng làm từ vỏ dừa tự nhiên',
                imageUrl: 'https://placeholder.pics/svg/300x300/Muong+Dua',
                thumbnailImage: 'https://placeholder.pics/svg/300x300/Muong+Dua',
                images: ['https://placeholder.pics/svg/300x300/Muong+Dua'],
                category: 'Đồ nhà bếp',
                stock: 10,
                inStock: true,
                reviewCount: 15,
                stars: '★★★★☆'
              },
              {
                id: 'sample4',
                name: 'Đèn trang trí vỏ dừa',
                price: 289000,
                description: 'Đèn trang trí từ vỏ dừa tự nhiên',
                imageUrl: 'https://placeholder.pics/svg/300x300/Den+Dua',
                thumbnailImage: 'https://placeholder.pics/svg/300x300/Den+Dua',
                images: ['https://placeholder.pics/svg/300x300/Den+Dua'],
                category: 'Đồ trang trí',
                stock: 5,
                inStock: true,
                reviewCount: 7,
                stars: '★★★★☆'
              }
            ];
            
            // Add sample products until we have 4
            let sampleIndex = 0;
            while (productsToShow.length < 4 && sampleIndex < sampleProducts.length) {
              if (sampleProducts[sampleIndex].id !== currentProductId) {
                productsToShow.push(sampleProducts[sampleIndex]);
              }
              sampleIndex++;
            }
          }
          
          // Cache the results for future requests
          cacheProducts(cacheKey, productsToShow);
        } else {          // Fallback data if API fails
          productsToShow = [
            {
              id: 'fb1',
              name: 'Khay đựng vỏ dừa nhỏ',
              price: 79000,
              description: 'Khay đựng làm từ vỏ dừa tự nhiên',
              imageUrl: 'https://placeholder.pics/svg/300x300/Khay+Dua',
              thumbnailImage: 'https://placeholder.pics/svg/300x300/Khay+Dua',
              images: ['https://placeholder.pics/svg/300x300/Khay+Dua'],
              category: 'Đồ nhà bếp',
              stock: 10,
              inStock: true,
              reviewCount: 5,
              stars: '★★★★☆'
            },
            {
              id: 'fb2',
              name: 'Ly vỏ dừa có quai',
              price: 99000,
              description: 'Ly uống nước làm từ vỏ dừa tự nhiên',
              imageUrl: 'https://placeholder.pics/svg/300x300/Ly+Dua',
              thumbnailImage: 'https://placeholder.pics/svg/300x300/Ly+Dua',
              images: ['https://placeholder.pics/svg/300x300/Ly+Dua'],
              category: 'Đồ nhà bếp',
              stock: 15,
              inStock: true,
              reviewCount: 9,
              stars: '★★★★★'
            }
          ];
        }
        
        setSuggestedProducts(productsToShow);
      } catch (error) {
        console.error('Error fetching suggested products:', error);
          // Fallback products if fetch fails
        setSuggestedProducts([
          {
            id: 'error1',
            name: 'Tranh treo tường từ vỏ dừa',
            price: 199000,
            description: 'Tranh trang trí làm từ vỏ dừa tự nhiên',
            imageUrl: 'https://placeholder.pics/svg/300x300/Tranh+Dua',
            thumbnailImage: 'https://placeholder.pics/svg/300x300/Tranh+Dua',
            images: ['https://placeholder.pics/svg/300x300/Tranh+Dua'],
            category: 'Đồ trang trí',
            stock: 5,
            inStock: true,
            reviewCount: 6,
            stars: '★★★★☆'
          },
          {
            id: 'error2',
            name: 'Thớt hình tròn vỏ dừa',
            price: 129000,
            description: 'Thớt gỗ hình tròn từ cây dừa',
            imageUrl: 'https://placeholder.pics/svg/300x300/Thot+Dua',
            thumbnailImage: 'https://placeholder.pics/svg/300x300/Thot+Dua',
            images: ['https://placeholder.pics/svg/300x300/Thot+Dua'],
            category: 'Đồ nhà bếp', 
            stock: 8,
            inStock: true,
            reviewCount: 11,
            stars: '★★★★★'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSuggestedProducts();
      return () => {
      isMounted = false;
      abortController.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProductId]); // Only depend on the product ID changing, other dependencies are stable functions
  if (loading) {
    return (
      <div className="productGrid relatedProductGrid">
        {[...Array(4)].map((_, index) => (
          <div className="productCardContainer" key={`placeholder-${index}`}>
            <div className="productCardPlaceholder"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="productGrid relatedProductGrid">
      {suggestedProducts.map(product => (
        <div className="productCardContainer" key={product.id}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductSuggestions;
