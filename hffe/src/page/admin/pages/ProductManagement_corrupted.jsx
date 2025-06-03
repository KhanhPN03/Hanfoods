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

const ProductManagement = () => {  const [products, setProducts] = useState([]);
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

        if (response.ok) {
          alert('Xóa sản phẩm thành công!');
          fetchProducts();
        } else {
          alert('Có lỗi xảy ra khi xóa sản phẩm!');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Có lỗi xảy ra khi xóa sản phẩm!');
      }
    }
  };

  const handleView = (product) => {
    // Navigate to product detail or show modal
    console.log('View product:', product);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/products/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting products:', error);
      alert('Có lỗi xảy ra khi xuất file!');
    }
  };

  const handleChangePage = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleChangeRowsPerPage = (newPerPage) => {
    setPagination(prev => ({ 
      ...prev, 
      perPage: newPerPage,
      currentPage: 1
    }));
  };

  const getStatusBadge = (product) => {
    if (product.stock <= 0) {
      return <span className="status-badge status-danger">Hết hàng</span>;
    } else if (product.stock <= 10) {
      return <span className="status-badge status-warning">Sắp hết</span>;
    } else {
      return <span className="status-badge status-success">Còn hàng</span>;
    }
  };

  const columns = [
    {
      name: 'Hình ảnh',
      selector: row => row.thumbnailImage,
      cell: row => (
        <div className="product-image">
          <img 
            src={row.thumbnailImage || '/placeholder-image.jpg'} 
            alt={row.name}
            className="product-thumbnail"
          />
        </div>
      ),
      width: '80px',
      sortable: false
    },
    {
      name: 'Tên sản phẩm',
      selector: row => row.name,
      sortable: true,
      cell: row => (
        <div className="product-info">
          <div className="product-name">{row.name}</div>
          <div className="product-description">
            {row.description?.substring(0, 100)}...
          </div>
        </div>
      ),
      width: '250px'
    },
    {
      name: 'Danh mục',
      selector: row => row.category?.name,
      sortable: true,
      cell: row => (
        <span className="category-badge">
          {row.category?.name || 'Chưa phân loại'}
        </span>
      ),
      width: '120px'
    },
    {
      name: 'Giá gốc',
      selector: row => row.price,
      sortable: true,
      cell: row => (
        <span className="price-cell">
          {row.price?.toLocaleString('vi-VN')} đ
        </span>
      ),
      width: '120px'
    },
    {
      name: 'Giá KM',
      selector: row => row.salePrice,
      sortable: true,
      cell: row => (
        <span className="sale-price-cell">
          {row.salePrice ? `${row.salePrice.toLocaleString('vi-VN')} đ` : '-'}
        </span>
      ),
      width: '120px'
    },
    {
      name: 'Tồn kho',
      selector: row => row.stock,
      sortable: true,
      cell: row => (
        <div className="stock-cell">
          <span className="stock-number">{row.stock}</span>
          {getStatusBadge(row)}
        </div>
      ),
      width: '120px'
    },
    {
      name: 'Trạng thái',
      selector: row => row.isActive,
      cell: row => (
        <span className={`status-badge ${row.isActive ? 'status-success' : 'status-danger'}`}>
          {row.isActive ? 'Hoạt động' : 'Tạm dừng'}
        </span>
      ),
      width: '100px'
    },
    {
      name: 'Ngày tạo',
      selector: row => row.createdAt,
      sortable: true,
      cell: row => new Date(row.createdAt).toLocaleDateString('vi-VN'),
      width: '100px'
    }
  ];

  const FilterComponent = () => (
    <div className="filters-row">
      <select
        value={filters.category}
        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        className="filter-select"
      >
        <option value="">Tất cả danh mục</option>
        <option value="thuc-pham">Thực phẩm</option>
        <option value="do-uong">Đồ uống</option>
        <option value="gia-vi">Gia vị</option>
        <option value="banh-keo">Bánh kẹo</option>
      </select>

      <select
        value={filters.status}
        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        className="filter-select"
      >
        <option value="">Tất cả trạng thái</option>
        <option value="active">Hoạt động</option>
        <option value="inactive">Tạm dừng</option>
        <option value="out-of-stock">Hết hàng</option>
      </select>

      <select
        value={filters.priceRange}
        onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
        className="filter-select"
      >
        <option value="">Tất cả giá</option>
        <option value="0-100000">Dưới 100,000đ</option>
        <option value="100000-500000">100,000đ - 500,000đ</option>
        <option value="500000-1000000">500,000đ - 1,000,000đ</option>
        <option value="1000000+">Trên 1,000,000đ</option>
      </select>

      <button
        className="clear-filters-btn"
        onClick={() => setFilters({ search: '', category: '', status: '', priceRange: '' })}
      >
        <X size={16} />
        Xóa bộ lọc
      </button>
    </div>
  );

  return (
    <div className="product-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý sản phẩm</h1>
          <p className="page-subtitle">
            Quản lý toàn bộ sản phẩm trong cửa hàng
          </p>
        </div>
        <div className="page-actions">
          <button className="import-btn">
            <Upload size={16} />
            Nhập Excel
          </button>
        </div>
      </div>

      <AdminTable
        title={`Danh sách sản phẩm (${pagination.totalRows})`}
        data={products}
        columns={columns}
        loading={loading}
        pagination={true}
        paginationServer={true}
        paginationTotalRows={pagination.totalRows}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        onSearch={handleSearch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onExport={handleExport}
        searchPlaceholder="Tìm kiếm sản phẩm..."
        filterComponent={<FilterComponent />}
        selectableRows={true}
        className="products-table"
      />

      {/* Add Product Modal */}
      {showAddModal && (
        <ProductModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={fetchProducts}
          title="Thêm sản phẩm mới"
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <ProductModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={fetchProducts}
          product={selectedProduct}
          title="Chỉnh sửa sản phẩm"
        />
      )}
    </div>
  );
};

// Product Modal Component
const ProductModal = ({ isOpen, onClose, onSave, product = null, title }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '',
    categoryId: '',
    thumbnailImage: '',
    images: [],
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
        stock: product.stock || '',
        categoryId: product.categoryId || '',
        thumbnailImage: product.thumbnailImage || '',
        images: product.images || [],
        isActive: product.isActive !== undefined ? product.isActive : true
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const url = product ? `/api/products/${product._id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(product ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
        onSave();
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Có lỗi xảy ra khi lưu sản phẩm!');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label>Tên sản phẩm *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Giá gốc *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Giá khuyến mãi</label>
              <input
                type="number"
                value={formData.salePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, salePrice: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Số lượng tồn kho *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              >
                <option value="">Chọn danh mục</option>
                <option value="thuc-pham">Thực phẩm</option>
                <option value="do-uong">Đồ uống</option>
                <option value="gia-vi">Gia vị</option>
                <option value="banh-keo">Bánh kẹo</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Hình ảnh chính</label>
            <input
              type="url"
              value={formData.thumbnailImage}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnailImage: e.target.value }))}
              placeholder="URL hình ảnh"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              Kích hoạt sản phẩm
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductManagement;
