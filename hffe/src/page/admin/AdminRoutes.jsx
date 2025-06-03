import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import ImprovedDashboard from './pages/ImprovedDashboard';
import ImprovedProductManagement from './pages/ImprovedProductManagement';
import ImprovedAccountManagement from './pages/ImprovedAccountManagement';
import DiscountManagement from './pages/DiscountManagement';
import OrderManagement from './pages/OrderManagement';
import RevenueManagement from './pages/RevenueManagement';
import ImprovedSettingsManagement from './pages/ImprovedSettingsManagement';

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
      
      {/* Protected admin routes with AdminLayout */}
      <Route path="/*" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        {/* Default route - redirect to dashboard */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />        {/* Admin Dashboard Routes */}
        <Route path="dashboard" element={<ImprovedDashboard />} />
        <Route path="products" element={<ImprovedProductManagement />} />
        <Route path="accounts" element={<ImprovedAccountManagement />} />
        <Route path="discounts" element={<DiscountManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="revenue" element={<RevenueManagement />} />
        <Route path="settings" element={<ImprovedSettingsManagement />} />
        
        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
