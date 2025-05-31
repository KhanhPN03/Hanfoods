import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import AccountManagement from './pages/AccountManagement';
import DiscountManagement from './pages/DiscountManagement';
import OrderManagement from './pages/OrderManagement';
import RevenueManagement from './pages/RevenueManagement';
import SettingsManagement from './pages/SettingsManagement';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  
  // Check if user is admin
  if (!token || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Admin login route - không cần protected */}
      <Route path="/login" element={<AdminLogin />} />
      
      {/* Protected admin routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <AdminLayout>
            <Routes>
              {/* Default route - redirect to dashboard */}
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              
              {/* Admin Dashboard Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<ProductManagement />} />
              <Route path="/accounts" element={<AccountManagement />} />
              <Route path="/discounts" element={<DiscountManagement />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/revenue" element={<RevenueManagement />} />
              <Route path="/settings" element={<SettingsManagement />} />
              
              {/* Catch all route - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AdminRoutes;
