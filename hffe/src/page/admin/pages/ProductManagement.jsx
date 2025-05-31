import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Package, 
  Edit3, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import AdminTable from '../components/AdminTable';
import StatCard from '../components/StatCard';
import adminApiService from '../../../services/AdminApiService';
import '../css/AdminTable.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    totalValue: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalRows: 0,
    perPage: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    priceRange: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page: pagination.currentPage,
        limit: pagination.perPage,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
        ...(filters.priceRange && { priceRange: filters.priceRange })
      };

      const response = await adminApiService.getAllProducts(queryParams);
      
      if (response.success) {
        setProducts(response.data.products || response.data);
        setPagination(prev => ({
          ...prev,
          totalRows: response.data.pagination?.total || response.data.length
        }));
        
        // Update stats if available
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, filters]);

  const fetchProductStats = useCallback(async () => {
    try {
      const response = await adminApiService.getProductStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching product stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchProductStats();
  }, [fetchProducts, fetchProductStats]);

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setShowAddModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      try {
        setLoading(true);
        const response = await adminApiService.deleteProduct(product._id);
        
        if (response.success) {
          await fetchProducts();
          await fetchProductStats();
          alert('Đã xóa sản phẩm thành công!');
        } else {
          alert('Có lỗi xảy ra khi xóa sản phẩm');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Có lỗi xảy ra khi xóa sản phẩm');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      setLoading(true);
      let response;
      
      if (selectedProduct) {
        // Update existing product
        response = await adminApiService.updateProduct(selectedProduct._id, productData);
      } else {
        // Create new product
        response = await adminApiService.createProduct(productData);
      }
      
      if (response.success) {
        await fetchProducts();
        await fetchProductStats();
        setShowAddModal(false);
        setShowEditModal(false);
        alert(selectedProduct ? 'Đã cập nhật sản phẩm thành công!' : 'Đã tạo sản phẩm thành công!');
      } else {
        alert('Có lỗi xảy ra khi lưu sản phẩm');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.exportProducts(filters);
      
      if (response.success && response.data) {
        // Create download link
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `products_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting products:', error);
      alert('Có lỗi xảy ra khi xuất dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const columns = [
    {
      Header: 'Hình ảnh',
      accessor: 'thumbnailImage',
      Cell: ({ row }) => (
        <div className="product-image">
          <img 
            src={row.original.thumbnailImage || '/placeholder-image.jpg'} 
            alt={row.original.name}
            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </div>
      )
    },
    {
      Header: 'Tên sản phẩm',
      accessor: 'name',
      sortable: true
    },
    {
      Header: 'Danh mục',
      accessor: 'category',
      sortable: true
    },
    {
      Header: 'Giá gốc',
      accessor: 'price',
      Cell: ({ value }) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0),
      sortable: true
    },
    {
      Header: 'Giá khuyến mãi',
      accessor: 'salePrice',
      Cell: ({ value }) => value ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value) : '-',
      sortable: true
    },
    {
      Header: 'Tồn kho',
      accessor: 'stock',
      Cell: ({ value }) => (
        <span className={`stock-badge ${value > 10 ? 'in-stock' : value > 0 ? 'low-stock' : 'out-of-stock'}`}>
          {value}
        </span>
      ),
      sortable: true
    },
    {
      Header: 'Trạng thái',
      accessor: 'status',
      Cell: ({ value }) => (
        <span className={`status-badge ${value === 'active' ? 'active' : 'inactive'}`}>
          {value === 'active' ? (
            <>
              <CheckCircle size={16} />
              Hoạt động
            </>
          ) : (
            <>
              <XCircle size={16} />
              Ngừng bán
            </>
          )}
        </span>
      ),
      sortable: true
    },
    {
      Header: 'Thao tác',
      Cell: ({ row }) => (
        <div className="action-buttons">
          <button 
            className="btn-action view" 
            onClick={() => handleView(row.original)}
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
          <button 
            className="btn-action edit" 
            onClick={() => handleEdit(row.original)}
            title="Chỉnh sửa"
          >
            <Edit3 size={16} />
          </button>
          <button 
            className="btn-action delete" 
            onClick={() => handleDelete(row.original)}
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const actionButtons = [
    {
      label: 'Thêm sản phẩm',
      icon: Plus,
      onClick: handleAdd,
      className: 'btn-primary'
    },
    {
      label: 'Xuất Excel',
      icon: Download,
      onClick: handleExport,
      className: 'btn-outline'
    }
  ];

  return (
    <div className="product-management">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <Package className="page-icon" />
            Quản lý sản phẩm
          </h1>
          <p>Quản lý toàn bộ sản phẩm trong hệ thống</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          title="Tổng sản phẩm"
          value={stats.totalProducts}
          icon={Package}
          color="#667eea"
          trend={`+${Math.round((stats.totalProducts / 100) * 12)}% so với tháng trước`}
        />
        <StatCard
          title="Đang hoạt động"
          value={stats.activeProducts}
          icon={CheckCircle}
          color="#4facfe"
          trend={`${Math.round((stats.activeProducts / stats.totalProducts) * 100)}% tổng số`}
        />
        <StatCard
          title="Hết hàng"
          value={stats.outOfStock}
          icon={AlertTriangle}
          color="#ff6b6b"
          trend={stats.outOfStock > 0 ? 'Cần nhập thêm hàng' : 'Tình trạng tốt'}
        />
        <StatCard
          title="Giá trị tồn kho"
          value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalValue || 0)}
          icon={Package}
          color="#feca57"
          trend="Tổng giá trị hàng hóa"
        />
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select 
            value={filters.category} 
            onChange={(e) => handleFilter('category', e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            <option value="Trà">Trà</option>
            <option value="Cà phê">Cà phê</option>
            <option value="Bánh kẹo">Bánh kẹo</option>
            <option value="Đồ uống">Đồ uống</option>
          </select>
          
          <select 
            value={filters.status} 
            onChange={(e) => handleFilter('status', e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng bán</option>
          </select>
          
          <select 
            value={filters.priceRange} 
            onChange={(e) => handleFilter('priceRange', e.target.value)}
          >
            <option value="">Tất cả giá</option>
            <option value="0-100000">Dưới 100.000đ</option>
            <option value="100000-500000">100.000đ - 500.000đ</option>
            <option value="500000-1000000">500.000đ - 1.000.000đ</option>
            <option value="1000000-">Trên 1.000.000đ</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {/* Main Table */}
      <AdminTable
        data={products}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        actionButtons={actionButtons}
        title="Danh sách sản phẩm"
      />

      {/* Product Form Modal */}
      {(showAddModal || showEditModal) && (
        <ProductFormModal
          isOpen={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onSave={handleSaveProduct}
          product={selectedProduct}
          loading={loading}
        />
      )}

      {/* Product View Modal */}
      {showViewModal && (
        <ProductViewModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

// Product Form Modal Component
const ProductFormModal = ({ isOpen, onClose, onSave, product, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    salePrice: '',
    stock: '',
    status: 'active',
    thumbnailImage: '',
    images: []
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price || '',
        salePrice: product.salePrice || '',
        stock: product.stock || '',
        status: product.status || 'active',
        thumbnailImage: product.thumbnailImage || '',
        images: product.images || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        salePrice: '',
        stock: '',
        status: 'active',
        thumbnailImage: '',
        images: []
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Tên sản phẩm *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Danh mục *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
              >
                <option value="">Chọn danh mục</option>
                <option value="Trà">Trà</option>
                <option value="Cà phê">Cà phê</option>
                <option value="Bánh kẹo">Bánh kẹo</option>
                <option value="Đồ uống">Đồ uống</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Giá gốc (VND) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Giá khuyến mãi (VND)</label>
              <input
                type="number"
                value={formData.salePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, salePrice: e.target.value }))}
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Số lượng tồn kho *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                required
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngừng bán</option>
              </select>
            </div>
          </div>
          
          <div className="form-group full-width">
            <label>Mô tả sản phẩm</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="4"
            />
          </div>
          
          <div className="form-group full-width">
            <label>URL hình ảnh chính</label>
            <input
              type="url"
              value={formData.thumbnailImage}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnailImage: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : (product ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Product View Modal Component
const ProductViewModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>Chi tiết sản phẩm</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="product-details">
          <div className="product-image-section">
            <img 
              src={product.thumbnailImage || '/placeholder-image.jpg'} 
              alt={product.name}
              className="product-main-image"
            />
          </div>
          
          <div className="product-info-section">
            <h3>{product.name}</h3>
            <p className="product-category">Danh mục: {product.category}</p>
            
            <div className="price-info">
              <div className="price-row">
                <span>Giá gốc:</span>
                <span className="price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}</span>
              </div>
              {product.salePrice && (
                <div className="price-row">
                  <span>Giá khuyến mãi:</span>
                  <span className="sale-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.salePrice)}</span>
                </div>
              )}
            </div>
            
            <div className="stock-info">
              <span>Tồn kho:</span>
              <span className={`stock-value ${product.stock > 10 ? 'high' : product.stock > 0 ? 'low' : 'out'}`}>
                {product.stock} sản phẩm
              </span>
            </div>
            
            <div className="status-info">
              <span>Trạng thái:</span>
              <span className={`status-value ${product.status}`}>
                {product.status === 'active' ? 'Hoạt động' : 'Ngừng bán'}
              </span>
            </div>
            
            {product.description && (
              <div className="description-section">
                <h4>Mô tả sản phẩm</h4>
                <p>{product.description}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
