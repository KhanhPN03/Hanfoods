import React, { useState, useEffect, useCallback } from "react";
import ProductCard from "./ProductCard";
import ProductCategories from "./ProductCategories";
import { productAPI } from "../../../services/apiService";
import { useAppContext } from "../../../context/AppContext";
import "../css/loadingButton.css"; // Import CSS cho nút loading

const ProductShowcase = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, addToWishlist, wishlist, addNotification } = useAppContext();

  // Helper functions
  const getImageClassFromName = useCallback((name) => {
    const nameLower = String(name).toLowerCase();
    if (nameLower.includes("cốc") || nameLower.includes("mug"))
      return "coconutMug";
    if (nameLower.includes("hộp") || nameLower.includes("container"))
      return "coconutContainer";
    if (
      nameLower.includes("ly") ||
      nameLower.includes("rượu") ||
      nameLower.includes("wine")
    )
      return "coconutWineCup";
    if (nameLower.includes("thìa") || nameLower.includes("spoon"))
      return "coconutSpoon";
    return "coconutProduct";
  }, []);

  const getBadgeFromPrice = useCallback((price, salePrice) => {
    if (salePrice && salePrice > 0 && salePrice < price) {
      const discountPercent = Math.round((1 - salePrice / price) * 100);
      return `Giảm ${discountPercent}%`;
    }
    return null;
  }, []);

  const getRatingStars = useCallback((rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      "★".repeat(fullStars) +
      (hasHalfStar ? "★" : "") +
      "☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0))
    );
  }, []);

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  }, []);
  // Format product from API response
  const formatProduct = useCallback(
    (product) => {
      // Kiểm tra URL hình ảnh hợp lệ
      const getValidImageUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '' || 
            (!url.startsWith('http://') && !url.startsWith('https://')) ||
            url.includes('via.placeholder.com')) {
          const productName = product.name ? product.name.replace(/\s+/g, '+') : 'Product';
          return `https://placeholder.pics/svg/500x500/${productName}`;
        }
        return url;
      };

      return {
        id: product._id,
        databaseId: product.productId,
        imageClass: getImageClassFromName(product.name),
        badge: getBadgeFromPrice(product.price, product.salePrice),
        category: product.categoryId?.name || "Sản phẩm",
        name: product.name,
        description: product.description,
        stars: getRatingStars(product.rating || 4.5),
        reviewCount: product.reviewCount || 0,
        price: formatPrice(
          product.salePrice > 0 ? product.salePrice : product.price
        ),
        originalPrice:
          product.salePrice > 0 ? formatPrice(product.price) : null,
        // Sử dụng thumbnailImage với kiểm tra URL hợp lệ
        imageUrl: getValidImageUrl(product.thumbnailImage),
        // Đảm bảo images luôn là mảng URL hợp lệ, không null, không placeholder
        images: (() => {
          let imgs = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
          imgs = imgs.map(getValidImageUrl).filter(url => url && !url.includes('placeholder.pics'));
          if (imgs.length > 0) return imgs;
          const thumb = getValidImageUrl(product.thumbnailImage);
          if (thumb && !thumb.includes('placeholder.pics')) return [thumb];
          // fallback cuối cùng là placeholder
          const productName = product.name ? product.name.replace(/\s+/g, '+') : 'Product';
          return [`https://placeholder.pics/svg/500x500/${productName}`];
        })(),
        rawPrice: product.salePrice > 0 ? product.salePrice : product.price,
        rawOriginalPrice: product.price,
        stock: product.stock,
        inStock: product.stock > 0,
        materials: product.materials || "Vỏ dừa tự nhiên",
        dimensions: product.dimensions || "",
        createdAt: product.createdAt,
      };
    },
    [getImageClassFromName, getBadgeFromPrice, getRatingStars, formatPrice]
  );

  // Generate fallback products when API fails
 

  useEffect(() => {
    // Set initial loading state
    setLoading(true);
    console.log("ProductShowcase: Starting to fetch products");

    const fetchProducts = async () => {
      try {
        console.log("ProductShowcase: Fetching products from API");
        // Set a timeout to handle slow API responses
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        const response = await productAPI.getAllProducts({
          limit: 8,
          sortBy: "createdAt",
          order: "desc",
        }, { signal: controller.signal });
        
        clearTimeout(timeoutId);
        
        // Check if component is still mounted before updating state
        if (response?.data?.products?.length > 0) {
          console.log("ProductShowcase: Products received:", response.data.products.length);
          const formattedProducts = response.data.products.map(formatProduct);
          console.log("ProductShowcase: Products formatted, setting state");
          setProducts(formattedProducts);
        } else {
          // Handle empty response
          console.log("ProductShowcase: No products received from API");
          addNotification("Đang hiển thị sản phẩm mẫu", "info", 3000);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        
        // Add fallback products on error
     
     
        addNotification("Không thể kết nối với máy chủ. Đang hiển thị sản phẩm mẫu.", "warning", 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [formatProduct, addNotification]);

  return (
    <section id="productSection" className="productShowcase">
      <div className="sectionHeader scroll-animation fade-in">
        <h2 className="sectionTitle">Sản Phẩm Bán Chạy Nhất</h2>
        <p className="sectionSubtitle">Thủ công tỉ mỉ từ nguồn dừa bền vững</p>
      </div>

      <ProductCategories />

      <div className="productGrid">
        {loading
          ? // Show loading placeholders
            Array(4)
              .fill()
              .map((_, index) => (
                <div
                  key={index}
                  className="product-card-placeholder scroll-animation fade-in"
                >
                  <div className="image-placeholder"></div>
                  <div className="content-placeholder">
                    <div className="title-placeholder"></div>
                    <div className="price-placeholder"></div>
                  </div>
                </div>              ))
          : // Show actual products
            products.map((product) => (
              <div className="productCardContainer" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
      </div>

      <div className="productCta">
        <button className="viewAll">Xem Tất Cả Sản Phẩm</button>
      </div>
    </section>
  );
};

export default ProductShowcase;