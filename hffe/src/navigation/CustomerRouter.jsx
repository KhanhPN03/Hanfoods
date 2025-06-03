import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import HomePage from '../page/customer/HomePage';
import ProductDetail from '../page/customer/ProductDetail';
import CartPage from '../page/customer/CartPage';
import LoginPage from '../page/customer/LoginPage';
import RegisterPage from '../page/customer/RegisterPage';
import CheckoutStepOne from '../page/customer/CheckoutStepOne';
import CheckoutStepTwo from '../page/customer/CheckoutStepTwo';
import OrderSuccessPage from '../page/customer/OrderSuccessPage';
// import ProductsPage from '../page/customer/ProductsPage'; // New component
import AboutUs from '../page/customer/AboutUs'; // Importing About Us page
import Contact from '../page/customer/Contact'; // Importing Contact page
import Profile from '../page/customer/Profile'; // Importing Profile page
// import OrdersPage from '../page/customer/OrdersPage'; // New component
// import WishlistPage from '../page/customer/WishlistPage'; // New component
// import GoogleLoginCallback from '../page/customer/GoogleLoginCallback'; // From previous response

const CustomerRouter = () => {
  const { user, isLoading } = useAppContext();

  if (isLoading) {
    return <div>Đang kiểm tra trạng thái đăng nhập...</div>;
  }

  return (
    <Routes>      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      {/* <Route path="/products" element={<ProductsPage />} /> */}
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />

      {/* Protected routes */}
      <Route
        path="/cart"
        element={user ? <CartPage /> : <Navigate to="/login" state={{ from: '/cart' }} />}
      />
      <Route
        path="/checkout"
        element={user ? <CheckoutStepOne /> : <Navigate to="/login" state={{ from: '/checkout' }} />}
      />
      <Route
        path="/checkout/payment"
        element={user ? <CheckoutStepTwo /> : <Navigate to="/login" state={{ from: '/checkout/payment' }} />}
      />
      <Route
        path="/order-success"
        element={user ? <OrderSuccessPage /> : <Navigate to="/login" state={{ from: '/order-success' }} />}
      />      <Route
        path="/profile"
        element={user ? <Profile /> : <Navigate to="/login" state={{ from: '/profile' }} />}
      />
      <Route
        path="/orders"
        // element={user ? <OrdersPage /> : <Navigate to="/login" state={{ from: '/orders' }} />}
      />
      <Route
        path="/wishlist"
        // element={user ? <WishlistPage /> : <Navigate to="/login" state={{ from: '/wishlist' }} />}
      />

      {/* Auth routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
      {/* <Route path="/auth/google/callback" element={<GoogleLoginCallback />} /> */}
    </Routes>
  );
};

export default CustomerRouter;