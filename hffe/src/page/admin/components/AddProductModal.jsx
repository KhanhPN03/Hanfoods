import React, { useState } from 'react';
import { X, Upload, Plus, Minus } from 'lucide-react';
import AdminApiService from '../../../services/AdminApiService';
import '../css/Modal.css';

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    sku: '',
    tags: [],
    thumbnailImage: null,
    images: [],
    isActive: true,
    isFeatured: false,
    specifications: [{ name: '', value: '' }]
  });
    const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState([]);

  // Predefined categories
  const categories = [
    'Bánh mì',
    'Đồ uống',
    'Tráng miệng',
    'Đồ ăn nhanh',
    'Combo',
    'Khác'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { name: '', value: '' }]
    }));
  };
  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };
  const removeImage = (index, type = 'additional') => {
    if (type === 'thumbnail') {
      setFormData(prev => ({
        ...prev,
        thumbnailImage: null
      }));
      setThumbnailPreview(null);
    } else {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
      setImagePreview(prev => prev.filter((_, i) => i !== index));
    }
  };
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.description.trim()) newErrors.description = 'Mô tả sản phẩm là bắt buộc';
    if (!formData.category) newErrors.category = 'Danh mục là bắt buộc';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Giá bán phải lớn hơn 0';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Số lượng tồn kho không được âm';
    if (!formData.thumbnailImage) newErrors.thumbnailImage = 'Hình ảnh đại diện là bắt buộc';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add text fields
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('price', formData.price);
      submitData.append('originalPrice', formData.originalPrice || formData.price);
      submitData.append('stock', formData.stock);
      submitData.append('sku', formData.sku);
      submitData.append('isActive', formData.isActive);
      submitData.append('isFeatured', formData.isFeatured);
        // Add arrays as JSON strings
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('specifications', JSON.stringify(formData.specifications.filter(spec => spec.name && spec.value)));
      
      // Add thumbnail image (required)
      if (formData.thumbnailImage) {
        submitData.append('thumbnailImage', formData.thumbnailImage);
      }
      
      // Add additional images
      formData.images.forEach((image, index) => {
        submitData.append('images', image);
      });

      await AdminApiService.createProduct(submitData);
      
      onSuccess?.();
      onClose();
        // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        originalPrice: '',
        stock: '',
        sku: '',
        tags: [],
        thumbnailImage: null,
        images: [],
        isActive: true,
        isFeatured: false,
        specifications: [{ name: '', value: '' }]
      });
      setThumbnailPreview(null);
      setImagePreview([]);
      
    } catch (error) {
      console.error('Error creating product:', error);
      setErrors({ submit: error.message || 'Có lỗi xảy ra khi tạo sản phẩm' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thêm sản phẩm mới</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Basic Information */}
              <div className="form-section">
                <h3>Thông tin cơ bản</h3>
                
                <div className="form-group">
                  <label htmlFor="name">Tên sản phẩm *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="Nhập tên sản phẩm"
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="description">Mô tả *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={errors.description ? 'error' : ''}
                    placeholder="Mô tả chi tiết về sản phẩm"
                    rows={4}
                  />
                  {errors.description && <span className="error-text">{errors.description}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Danh mục *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={errors.category ? 'error' : ''}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <span className="error-text">{errors.category}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="sku">Mã SKU</label>
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="SKU tự động nếu để trống"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="form-section">
                <h3>Giá & Tồn kho</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Giá bán *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={errors.price ? 'error' : ''}
                      placeholder="0"
                      min="0"
                      step="1000"
                    />
                    {errors.price && <span className="error-text">{errors.price}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="originalPrice">Giá gốc</label>
                    <input
                      type="number"
                      id="originalPrice"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      placeholder="Giá trước khi giảm"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="stock">Tồn kho *</label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className={errors.stock ? 'error' : ''}
                      placeholder="0"
                      min="0"
                    />
                    {errors.stock && <span className="error-text">{errors.stock}</span>}
                  </div>
                </div>
              </div>              {/* Images */}
              <div className="form-section">
                <h3>Hình ảnh sản phẩm</h3>
                
                {/* Thumbnail Image */}
                <div className="form-group">
                  <label>Hình ảnh đại diện *</label>
                  <div className="upload-area">
                    <input
                      type="file"
                      id="thumbnailImage"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setFormData(prev => ({ ...prev, thumbnailImage: file }));
                          const reader = new FileReader();
                          reader.onload = (event) => setThumbnailPreview(event.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="thumbnailImage" className="upload-label">
                      <Upload size={24} />
                      <span>Chọn hình ảnh đại diện</span>
                      <small>Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)</small>
                    </label>
                  </div>
                  {errors.thumbnailImage && <span className="error-text">{errors.thumbnailImage}</span>}
                  
                  {thumbnailPreview && (
                    <div className="image-preview-item" style={{ marginTop: '10px', width: '150px' }}>
                      <img src={thumbnailPreview} alt="Thumbnail preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(0, 'thumbnail')}
                        style={{ position: 'absolute', top: '5px', right: '5px' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Images */}
                <div className="form-group">
                  <label>Hình ảnh bổ sung (tùy chọn)</label>
                  <div className="upload-area">
                    <input
                      type="file"
                      id="additionalImages"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 0) {
                          setFormData(prev => ({
                            ...prev,
                            images: [...prev.images, ...files]
                          }));
                          
                          files.forEach(file => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setImagePreview(prev => [...prev, event.target.result]);
                            };
                            reader.readAsDataURL(file);
                          });
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="additionalImages" className="upload-label">
                      <Upload size={24} />
                      <span>Chọn hình ảnh bổ sung</span>
                      <small>Có thể chọn nhiều hình (tối đa 5MB mỗi file)</small>
                    </label>
                  </div>

                  {imagePreview.length > 0 && (
                    <div className="image-preview-grid" style={{ marginTop: '10px' }}>
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={preview} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeImage(index, 'additional')}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="form-section">
                <h3>Tags</h3>
                
                <div className="tag-input-group">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nhập tag và nhấn Enter"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <button type="button" onClick={handleAddTag} className="btn-secondary">
                    <Plus size={16} />
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="tags-list">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="remove-tag"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Specifications */}
              <div className="form-section">
                <h3>Thông số kỹ thuật</h3>
                
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="specification-row">
                    <input
                      type="text"
                      placeholder="Tên thông số"
                      value={spec.name}
                      onChange={(e) => handleSpecificationChange(index, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Giá trị"
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                    />
                    {formData.specifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="remove-spec-btn"
                      >
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addSpecification}
                  className="btn-secondary add-spec-btn"
                >
                  <Plus size={16} />
                  Thêm thông số
                </button>
              </div>

              {/* Settings */}
              <div className="form-section">
                <h3>Cài đặt</h3>
                
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span>Kích hoạt sản phẩm</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                    />
                    <span>Sản phẩm nổi bật</span>
                  </label>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="error-message">
                {errors.submit}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
