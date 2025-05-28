import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { wishlistAPI } from '../../services/apiService';
import './css/Wishlist.css';
import { FaHeart, FaTrash, FaShoppingCart } from 'react-icons/fa';
import defaultProductImage from '../../assets/logo-placeholder.png';

const Wishlist = () => {
  const { user, wishlist, fetchWishlistFromServer, addToCart, removeFromWishlist } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchWishlistFromServer()
      .then(() => setLoading(false))
      .catch(err => {
        setError(err?.message || 'Có lỗi xảy ra khi tải danh sách yêu thích.');
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [user]);

  const handleRemove = (productId) => {
    wishlistAPI.removeFromWishlist(productId).then(() => {
      removeFromWishlist(productId);
    });
  };

  const handleMoveToCart = (product) => {
    addToCart(product);
    handleRemove(product.id);
  };

  if (loading) return <div className="wishlist-page"><p>Đang tải danh sách yêu thích...</p></div>;
  if (error) return <div className="wishlist-page"><p className="error-message">{error}</p></div>;

  return (
    <div className="wishlist-page">
      <h2><FaHeart color="#43a047" /> Danh Sách Yêu Thích</h2>
      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <p>Bạn chưa có sản phẩm nào trong danh sách yêu thích.</p>
        </div>
      ) : (
        <div className="wishlist-list">
          {wishlist.map(product => (
            <div className="wishlist-card" key={product.id}>
              <div className="wishlist-img" style={{ backgroundImage: `url(${product.thumbnailImage || product.imageUrl || defaultProductImage})` }} />
              <div className="wishlist-info">
                <h3>{product.name}</h3>
                <div className="wishlist-actions">
                  <button className="move-to-cart" onClick={() => handleMoveToCart(product)}><FaShoppingCart /> Thêm vào giỏ</button>
                  <button className="remove-btn" onClick={() => handleRemove(product.id)}><FaTrash /> Xóa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
