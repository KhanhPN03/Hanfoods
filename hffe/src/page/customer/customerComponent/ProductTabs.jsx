import React, { useState } from 'react';
import '../css/productTabs.css';

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');
  
  // Sample reviews - in a real app, these would come from an API
  const reviews = [
    {
      id: 1,
      author: 'Nguyễn Văn A',
      avatar: 'https://via.placeholder.com/40x40',
      date: '10/04/2025',
      rating: 5,
      content: 'Sản phẩm rất đẹp và chất lượng, đúng như mô tả. Tôi rất hài lòng với món đồ này và sẽ mua thêm trong tương lai!',
      images: [
        'https://via.placeholder.com/100x100?text=Review+1',
        'https://via.placeholder.com/100x100?text=Review+2'
      ],
      variant: 'Màu tự nhiên'
    },
    {
      id: 2,
      author: 'Trần Thị B',
      avatar: 'https://via.placeholder.com/40x40',
      date: '05/04/2025',
      rating: 4,
      content: 'Thiết kế độc đáo, chất liệu tốt. Giao hàng hơi chậm một chút nhưng sản phẩm đáng giá để chờ đợi.',
      variant: 'Màu đậm'
    },
    {
      id: 3,
      author: 'Lê Văn C',
      avatar: 'https://via.placeholder.com/40x40',
      date: '28/03/2025',
      rating: 5,
      content: 'Tuyệt vời! Tôi đã tìm kiếm một món quà độc đáo và thân thiện với môi trường, và đây là lựa chọn hoàn hảo.',
      images: [
        'https://via.placeholder.com/100x100?text=Review+3'
      ],
      variant: 'Màu tự nhiên'
    }
  ];
  
  return (
    <div className="product-tabs">
      <div className="tabs-header">
        <button 
          className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
          onClick={() => setActiveTab('description')}
        >
          CHI TIẾT SẢN PHẨM
        </button>
        <button 
          className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          ĐÁNH GIÁ ({product?.reviewCount || 0})
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'description' && (
          <div className="tab-pane description-pane">
            <div className="product-detail">
              <h3 className="detail-section-title">Thông tin chi tiết</h3>
              
              <div className="product-details-table">
                <table>
                  <tbody>
                    <tr>
                      <td>Thương hiệu</td>
                      <td>CocoNature</td>
                    </tr>
                    <tr>
                      <td>Xuất xứ</td>
                      <td>Việt Nam</td>
                    </tr>
                    <tr>
                      <td>Chất liệu</td>
                      <td>{product?.materials || 'Vỏ dừa tự nhiên'}</td>
                    </tr>
                    <tr>
                      <td>Kích thước</td>
                      <td>{product?.dimensions || 'Đường kính: 10cm, Chiều cao: 12cm'}</td>
                    </tr>
                    <tr>
                      <td>Thời gian bảo hành</td>
                      <td>12 tháng</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h3 className="detail-section-title">Mô tả sản phẩm</h3>
              
              <div className="product-description-content">
                <p>{product?.description}</p>
                
                <h4>Đặc điểm nổi bật:</h4>
                <ul className="features-list">
                  <li>Được làm từ vỏ dừa tự nhiên bền đẹp</li>
                  <li>Thân thiện với môi trường, có thể phân hủy sinh học</li>
                  <li>Thiết kế đơn giản, độc đáo, phù hợp với nhiều phong cách nội thất</li>
                  <li>Sản phẩm thủ công mang đậm nét văn hóa Việt Nam</li>
                  <li>Mỗi sản phẩm đều có nét độc đáo riêng vì được làm thủ công</li>
                </ul>
                
                <h4>Hướng dẫn sử dụng và bảo quản:</h4>
                <ul>
                  <li>Rửa sạch bằng nước ấm trước khi sử dụng lần đầu</li>
                  <li>Không nên dùng trong lò vi sóng</li>
                  <li>Rửa bằng tay và tránh các chất tẩy rửa mạnh</li>
                  <li>Lau khô hoàn toàn sau khi rửa để tránh mốc</li>
                  <li>Tránh tiếp xúc trực tiếp với nguồn nhiệt cao</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'reviews' && (
          <div className="tab-pane reviews-pane">
            <div className="reviews-section">
              <div className="reviews-summary">
                <div className="rating-average">
                  <div className="average-score">{product?.rating?.toFixed(1) || '4.8'}</div>
                  <div className="average-stars">
                    {'★'.repeat(Math.floor(product?.rating || 4.8))}
                    {'☆'.repeat(5 - Math.floor(product?.rating || 4.8))}
                  </div>
                  <div className="total-reviews">{product?.reviewCount || reviews.length} đánh giá</div>
                </div>
                
                <div className="rating-filters">
                  <button className="filter-btn active">Tất cả</button>
                  <button className="filter-btn">5 Sao ({Math.round(reviews.filter(r => r.rating === 5).length / reviews.length * product?.reviewCount || 0)})</button>
                  <button className="filter-btn">4 Sao ({Math.round(reviews.filter(r => r.rating === 4).length / reviews.length * product?.reviewCount || 0)})</button>
                  <button className="filter-btn">3 Sao ({Math.round(reviews.filter(r => r.rating === 3).length / reviews.length * product?.reviewCount || 0)})</button>
                  <button className="filter-btn">2 Sao (0)</button>
                  <button className="filter-btn">1 Sao (0)</button>
                  <button className="filter-btn">Có Bình Luận (3)</button>
                  <button className="filter-btn">Có Hình Ảnh / Video (2)</button>
                </div>
              </div>
              
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        <img src={review.avatar} alt={review.author} />
                      </div>
                      <div className="reviewer-name">{review.author}</div>
                    </div>
                    <div className="review-content">
                      <div className="review-rating">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </div>
                      <div className="review-date">{review.date}</div>
                      <div className="review-variant">Phân loại: {review.variant}</div>
                      <p className="review-text">{review.content}</p>
                      
                      {review.images && review.images.length > 0 && (
                        <div className="review-images">
                          {review.images.map((image, index) => (
                            <div key={index} className="review-image-item">
                              <img src={image} alt={`Đánh giá ${review.id} - Ảnh ${index + 1}`} />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="review-actions">
                        <button className="review-helpful-btn">Hữu ích</button>
                        <button className="review-report-btn">Báo cáo</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="load-more-reviews">
                <button className="load-more-btn">Xem thêm đánh giá</button>
              </div>
              
              <div className="write-review">
                <h3 className="review-form-title">Viết đánh giá của bạn</h3>
                <div className="rating-select">
                  <span>Đánh giá của bạn:</span>
                  <div className="rating-stars">
                    {'☆'.repeat(5)}
                  </div>
                </div>
                <textarea 
                  className="review-textarea" 
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                ></textarea>
                <button className="submit-review-btn">Gửi đánh giá</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
