import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  MoreVertical,
  RefreshCw,
  X
} from 'lucide-react';

const AdminTable = ({ 
  title,
  data,
  columns,
  loading = false,
  pagination = true,
  paginationServer = false,
  paginationTotalRows = 0,
  onChangePage,
  onChangeRowsPerPage,
  onSearch,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onExport,
  searchPlaceholder = "Tìm kiếm...",
  customActions = [],
  selectableRows = false,
  onSelectedRowsChange,
  filterComponent = null,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSelectedRowsChange = (state) => {
    setSelectedRows(state.selectedRows);
    if (onSelectedRowsChange) {
      onSelectedRowsChange(state);
    }
  };

  const tableCustomStyles = {
    header: {
      style: {
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        minHeight: '60px',
        paddingLeft: '20px',
        paddingRight: '20px'
      }
    },
    headRow: {
      style: {
        backgroundColor: '#f1f5f9',
        borderBottom: '1px solid #e2e8f0',
        minHeight: '48px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    },
    headCells: {
      style: {
        paddingLeft: '12px',
        paddingRight: '12px',
        color: '#374151',
        fontSize: '14px',
        fontWeight: '600'
      }
    },
    cells: {
      style: {
        paddingLeft: '12px',
        paddingRight: '12px',
        fontSize: '14px',
        color: '#1f2937'
      }
    },
    rows: {
      style: {
        minHeight: '56px',
        borderBottom: '1px solid #f1f5f9',
        '&:hover': {
          backgroundColor: '#f8fafc',
          cursor: 'pointer'
        }
      }
    }
  };

  const ActionButton = ({ icon: Icon, onClick, title, variant = 'default' }) => (
    <button 
      className={`action-btn ${variant}`} 
      onClick={onClick}
      title={title}
      type="button"
    >
      <Icon size={16} />
    </button>
  );

  const createActionsColumn = () => ({
    name: 'Thao tác',
    selector: 'actions',
    sortable: false,
    width: '120px',
    cell: (row) => (
      <div className="actions-cell">
        {onView && (
          <ActionButton 
            icon={Eye} 
            onClick={() => onView(row)} 
            title="Xem chi tiết"
            variant="view"
          />
        )}
        {onEdit && (
          <ActionButton 
            icon={Edit3} 
            onClick={() => onEdit(row)} 
            title="Chỉnh sửa"
            variant="edit"
          />
        )}
        {onDelete && (
          <ActionButton 
            icon={Trash2} 
            onClick={() => onDelete(row)} 
            title="Xóa"
            variant="delete"
          />
        )}
        {customActions.map((action, index) => (
          <ActionButton
            key={index}
            icon={action.icon}
            onClick={() => action.onClick(row)}
            title={action.title}
            variant={action.variant || 'default'}
          />
        ))}
      </div>
    )
  });

  const enhancedColumns = [
    ...columns,
    ...(onView || onEdit || onDelete || customActions.length > 0 ? [createActionsColumn()] : [])
  ];

  return (
    <div className={`admin-table-container ${className}`}>
      {/* Header */}
      <div className="table-header">
        <div className="table-title-section">
          <h2 className="table-title">{title}</h2>
          {selectedRows.length > 0 && (
            <div className="bulk-actions">
              <span className="selected-count">
                {selectedRows.length} mục đã chọn
              </span>
            </div>
          )}
        </div>
        
        <div className="table-actions">
          {/* Search */}
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => handleSearch('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Button */}
          {filterComponent && (
            <button
              className={`filter-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              Lọc
            </button>
          )}

          {/* Export Button */}
          {onExport && (
            <button className="export-btn" onClick={onExport}>
              <Download size={18} />
              Xuất Excel
            </button>
          )}

          {/* Add Button */}
          {onAdd && (
            <button className="add-btn" onClick={onAdd}>
              <Plus size={18} />
              Thêm mới
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && filterComponent && (
        <div className="table-filters">
          {filterComponent}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="table-loading">
          <RefreshCw className="spinner" size={24} />
          <span>Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Data Table */}
      <div className="data-table-wrapper">
        <DataTable
          columns={enhancedColumns}
          data={data}
          pagination={pagination}
          paginationServer={paginationServer}
          paginationTotalRows={paginationTotalRows}
          onChangePage={onChangePage}
          onChangeRowsPerPage={onChangeRowsPerPage}
          selectableRows={selectableRows}
          onSelectedRowsChange={handleSelectedRowsChange}
          customStyles={tableCustomStyles}
          noDataComponent={
            <div className="no-data">
              <p>Không có dữ liệu để hiển thị</p>
            </div>
          }
          progressPending={loading}
          progressComponent={
            <div className="table-loading">
              <RefreshCw className="spinner" size={24} />
            </div>
          }
          responsive
          highlightOnHover
          pointerOnHover
          fixedHeader
          fixedHeaderScrollHeight="400px"
          paginationComponentOptions={{
            rowsPerPageText: 'Hiển thị:',
            rangeSeparatorText: 'của',
            selectAllRowsItem: true,
            selectAllRowsItemText: 'Tất cả'
          }}
        />
      </div>
    </div>
  );
};

export default AdminTable;
