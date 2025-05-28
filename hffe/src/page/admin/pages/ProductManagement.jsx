import React, { useState, useEffect } from 'react';
import '../css/ProductManagement.css';
import AdminApiService from '../../../services/AdminApiService';

// StatCard component for displaying statistics
const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
  <div className={`stat-card stat-card--${color}`}>
    <div className="stat-card__icon">
      <i className={icon}></i>
    </div>
    <div className="stat-card__content">
      <h3 className="stat-card__value">{value}</h3>
      <p className="stat-card__title">{title}</p>
      {subtitle && <span className="stat-card__subtitle">{subtitle}</span>}
    </div>
  </div>
);

// ProductModal component for creating/editing products
const ProductModal = ({ isOpen, onClose, product, onSave, categories = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    quantity: '',
    categoryId: '',
    imageUrl: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        salePrice: product.salePrice || '',
        quantity: product.quantity || '',
        categoryId: product.categoryId?._id || product.categoryId || '',
        imageUrl: product.imageUrl || '',
        isActive: product.isActive !== undefined ? product.isActive : true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        salePrice: '',
        quantity: '',
        categoryId: '',
        imageUrl: '',
        isActive: true
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert numeric fields
      const processedData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        salePrice: parseFloat(formData.salePrice) || 0,
        quantity: parseInt(formData.quantity) || 0
      };

      await onSave(processedData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter product name"
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter product description"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Regular Price *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Sale Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.salePrice}
                onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              <span>Active Product</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn--secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn--primary">
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ProductViewModal component for viewing product details
const ProductViewModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Product Details</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="product-details">
          {product.imageUrl && (
            <div className="product-image">
              <img src={product.imageUrl} alt={product.name} />
            </div>
          )}
          
          <div className="product-info">
            <div className="info-row">
              <label>Name:</label>
              <span>{product.name}</span>
            </div>
            
            <div className="info-row">
              <label>Category:</label>
              <span>{product.categoryId?.name || 'N/A'}</span>
            </div>
            
            <div className="info-row">
              <label>Description:</label>
              <span>{product.description || 'No description'}</span>
            </div>
            
            <div className="info-row">
              <label>Regular Price:</label>
              <span>${product.price?.toFixed(2)}</span>
            </div>
            
            {product.salePrice > 0 && (
              <div className="info-row">
                <label>Sale Price:</label>
                <span className="sale-price">${product.salePrice?.toFixed(2)}</span>
              </div>
            )}
            
            <div className="info-row">
              <label>Quantity:</label>
              <span className={product.quantity < 10 ? 'low-stock' : ''}>
                {product.quantity}
                {product.quantity < 10 && ' (Low Stock)'}
              </span>
            </div>
            
            <div className="info-row">
              <label>Status:</label>
              <span className={`status ${product.isActive ? 'active' : 'inactive'}`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="info-row">
              <label>Created:</label>
              <span>{new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="info-row">
              <label>Last Updated:</label>
              <span>{new Date(product.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn--primary">Close</button>
        </div>
      </div>
    </div>
  );
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  // Filter and pagination states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsData, statsData] = await Promise.all([
        AdminApiService.getAllProducts(),
        AdminApiService.getProductStats().catch(() => null)
      ]);
      
      setProducts(productsData.products || []);
      setStats(statsData);
      
      // Extract unique categories from products
      const uniqueCategories = [...new Set(
        productsData.products
          ?.map(p => p.categoryId)
          .filter(Boolean)
          .map(cat => typeof cat === 'object' ? cat : null)
          .filter(Boolean)
      )];
      setCategories(uniqueCategories);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = !search || 
      product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = !categoryFilter || 
      (product.categoryId?._id === categoryFilter || product.categoryId === categoryFilter);
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' ? product.isActive : !product.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleViewProduct = (product) => {
    setViewingProduct(product);
    setShowViewModal(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await AdminApiService.updateProduct(editingProduct._id, productData);
      } else {
        await AdminApiService.createProduct(productData);
      }
      await loadData();
      setShowModal(false);
      setEditingProduct(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await AdminApiService.deleteProduct(productId);
      await loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product: ' + (error.message || 'Unknown error'));
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleExport = async () => {
    try {
      await AdminApiService.exportProducts();
      alert('Export started! Check your downloads folder.');
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + (error.message || 'Unknown error'));
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="products-page">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Product Management</h1>
        <div className="page-actions">
          <button onClick={handleExport} className="btn btn--secondary">
            <i className="fas fa-download"></i>
            Export
          </button>
          <button onClick={handleAddProduct} className="btn btn--primary">
            <i className="fas fa-plus"></i>
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <StatCard
            title="Total Products"
            value={stats.totalProducts || 0}
            icon="fas fa-box"
            color="primary"
          />
          <StatCard
            title="Total Categories"
            value={stats.totalCategories || 0}
            icon="fas fa-tags"
            color="success"
          />
          <StatCard
            title="Low Stock"
            value={stats.lowStockCount || 0}
            icon="fas fa-exclamation-triangle"
            color="warning"
          />
          <StatCard
            title="Out of Stock"
            value={stats.outOfStockCount || 0}
            icon="fas fa-times-circle"
            color="danger"
          />
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="filter-group">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map(product => (
                <tr key={product._id}>
                  <td>
                    <div className="product-cell">
                      {product.imageUrl && (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="product-thumbnail"
                        />
                      )}
                      <div className="product-info">
                        <span className="product-name">{product.name}</span>
                        {product.description && (
                          <span className="product-desc">
                            {product.description.substring(0, 50)}
                            {product.description.length > 50 ? '...' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{product.categoryId?.name || 'N/A'}</td>
                  <td>
                    <div className="price-cell">
                      <span className="regular-price">${product.price?.toFixed(2)}</span>
                      {product.salePrice > 0 && (
                        <span className="sale-price">${product.salePrice?.toFixed(2)}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`stock-badge ${product.quantity < 10 ? 'low-stock' : ''}`}>
                      {product.quantity}
                      {product.quantity === 0 && ' (Out)'}
                      {product.quantity > 0 && product.quantity < 10 && ' (Low)'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="btn btn--sm btn--info"
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="btn btn--sm btn--secondary"
                        title="Edit Product"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="btn btn--sm btn--danger"
                        title="Delete Product"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div className="empty-content">
                    <i className="fas fa-box-open"></i>
                    <p>No products found</p>
                    <button onClick={handleAddProduct} className="btn btn--primary">
                      Add First Product
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn--secondary"
          >
            <i className="fas fa-chevron-left"></i>
            Previous
          </button>
          
          <div className="pagination-info">
            <span>
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn--secondary"
          >
            Next
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
        categories={categories}
      />

      <ProductViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingProduct(null);
        }}
        product={viewingProduct}
      />
    </div>
  );
};

export default ProductManagement;