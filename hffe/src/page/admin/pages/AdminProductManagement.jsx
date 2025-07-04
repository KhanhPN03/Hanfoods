import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Package, 
  Edit3, 
  Trash2, 
  Eye,
  Search,
  Filter
} from 'lucide-react';
import AdminApiService from '../../../services/AdminApiService';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';
import ViewProductModal from '../components/ViewProductModal';
import '../css/AdminTable.css';

const AdminProductManagement = () => {  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    totalValue: 0
  });const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
        console.log('Fetching products...');
      const response = await AdminApiService.getProducts();
      console.log('Products response:', response);
      
      if (response && response.success && response.products && Array.isArray(response.products)) {
        setProducts(response.products);
      } else if (response && response.products && Array.isArray(response.products)) {
        setProducts(response.products);
      } else if (Array.isArray(response)) {
        setProducts(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        console.warn('Unexpected response format:', response);
        throw new Error('Invalid products response format');
      }
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
      // Use mock data as fallback
      setProducts([
        {
          _id: '1',
          name: 'Bánh mì thịt nướng',
          price: 25000,
          category: 'Bánh mì',
          stock: 50,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'Trà sữa trân châu',
          price: 35000,
          category: 'Đồ uống',
          stock: 0,
          status: 'inactive',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await AdminApiService.getProductStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching product stats:', error);
      // Use mock stats
      setStats({
        totalProducts: 156,
        activeProducts: 142,
        outOfStock: 14,
        totalValue: 12560000
      });
    }
  };
  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };  const handleAddProduct = () => {
    setShowAddModal(true);
  };
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };
  const handleDeleteProduct = async (product) => {
    try {
      setLoading(true);
      
      // First check if product has existing orders
      const orderCheck = await AdminApiService.checkProductOrders(product._id);
      
      if (orderCheck.success && orderCheck.data.hasOrders) {
        const { totalOrders, activeOrders, canDelete, orders } = orderCheck.data;
        
        if (!canDelete) {
          // Product has active orders, show detailed warning
          const activeOrdersList = orders
            .filter(order => ['pending', 'processing', 'shipped'].includes(order.status))
            .map(order => `- Đơn hàng ${order.orderId} (${order.status})`)
            .join('\n');
            
          alert(
            `Không thể xóa sản phẩm "${product.name}" vì có ${activeOrders} đơn hàng đang hoạt động:\n\n${activeOrdersList}\n\nVui lòng hoàn thành hoặc hủy các đơn hàng này trước khi xóa sản phẩm.`
          );
          setLoading(false);
          return;
        } else if (totalOrders > 0) {
          // Product has completed orders, ask for confirmation
          const confirmMessage = `Sản phẩm "${product.name}" đã có ${totalOrders} đơn hàng trong lịch sử.\n\nViệc xóa sản phẩm sẽ không ảnh hưởng đến các đơn hàng đã hoàn thành, nhưng sản phẩm sẽ không thể được đặt hàng mới.\n\nBạn có chắc chắn muốn xóa?`;
          
          if (!window.confirm(confirmMessage)) {
            setLoading(false);
            return;
          }
        }
      }
      
      // Proceed with deletion if no active orders or user confirmed
      const finalConfirmation = `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?\n\nHành động này không thể hoàn tác.`;
      
      if (window.confirm(finalConfirmation)) {
        await AdminApiService.deleteProduct(product._id);
        await fetchProducts(); // Refresh the products list
        await fetchStats(); // Refresh the stats
        alert('Xóa sản phẩm thành công!');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleProductAdded = () => {
    fetchProducts(); // Refresh the products list
    fetchStats(); // Refresh the stats
  };

  const handleProductUpdated = () => {
    fetchProducts(); // Refresh the products list
    fetchStats(); // Refresh the stats
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product => {
    return product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
           product.category.toLowerCase().includes(filters.search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Package className="animate-spin" size={32} />
          <p style={{ marginTop: '10px' }}>Đang tải danh sách sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý sản phẩm</h1>
          <p className="page-subtitle">Quản lý toàn bộ sản phẩm trong hệ thống</p>
        </div>        <button className="btn btn-primary" onClick={handleAddProduct}>
          <Plus size={16} />
          Thêm sản phẩm mới
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          ⚠️ Lỗi khi tải dữ liệu: {error}. Đang hiển thị dữ liệu mẫu.
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#667eea20', color: '#667eea' }}>
            <Package size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Tổng sản phẩm</p>
            <h3 className="stat-value">{stats.totalProducts}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#4facfe20', color: '#4facfe' }}>
            <Eye size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Đang hoạt động</p>
            <h3 className="stat-value">{stats.activeProducts}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ff6b6b20', color: '#ff6b6b' }}>
            <Package size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Hết hàng</p>
            <h3 className="stat-value">{stats.outOfStock}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#feca5720', color: '#feca57' }}>
            <Package size={20} />
          </div>          <div className="stat-info">
            <p className="stat-label">Tổng giá trị</p>
            <h3 className="stat-value">₫{(stats.totalValue || 0).toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={filters.search}
            onChange={handleSearch}
          />
        </div>
        <button className="btn btn-secondary">
          <Filter size={16} />
          Bộ lọc
        </button>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>          <tbody>
            {filteredProducts.map(product => (
              <tr key={product._id}>
                <td>
                  <div className="product-cell">
                    <strong>{product.name}</strong>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>₫{(product.price || 0).toLocaleString()}</td>
                <td>
                  <span className={`stock ${product.stock === 0 ? 'out-of-stock' : product.stock < 10 ? 'low-stock' : 'in-stock'}`}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <span className={`status status-${product.status}`}>
                    {product.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-action btn-view" 
                      title="Xem chi tiết"
                      onClick={() => handleViewProduct(product)}
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      className="btn-action btn-edit" 
                      title="Chỉnh sửa"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      className="btn-action btn-delete" 
                      title="Xóa"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <h3>Không có sản phẩm nào</h3>
            <p>Chưa có sản phẩm nào trong hệ thống hoặc không có sản phẩm nào phù hợp với tìm kiếm.</p>
          </div>
        )}
      </div>      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleProductAdded}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isVisible={showEditModal}
        onClose={handleCloseEditModal}
        product={selectedProduct}
        onSuccess={handleProductUpdated}
      />

      {/* View Product Modal */}
      <ViewProductModal
        isVisible={showViewModal}
        onClose={handleCloseViewModal}
        product={selectedProduct}
      />
    </div>
  );
};

export default AdminProductManagement;
