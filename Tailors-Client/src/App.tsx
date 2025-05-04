import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles.css'; // If any additional styles are needed

// Layouts
import MainLayout from './components/MainLayout';
import BuyerLayout from './components/BuyerLayout';
import SellerLayout from './components/SellerLayout';

// Main pages
import DashboardPage from './components/DashboardPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';

// Seller pages
import SellerDashboard from './pages/seller/Dashboard';
import ProductManager from './pages/seller/ProductManager';
import InventoryManager from './pages/seller/InventoryManager';
import OrderManager from './pages/seller/OrderManager';
import Analytics from './pages/seller/Analytics';
import ProductCategories from './pages/seller/ProductCategories';
import SalesReport from './pages/seller/SalesReport';

// Buyer pages
import SellerList from './pages/buyer/SellerList';
import SellerProfile from './pages/buyer/SellerProfile';
import ProductBrowse from './pages/buyer/ProductBrowse';
import ProductDetail from './pages/buyer/ProductDetail';
import OrderHistory from './pages/buyer/OrderHistory';
import MeasurementsManager from './pages/buyer/MeasurementsManager';
import Checkout from './pages/buyer/Checkout';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Helper function to redirect based on authentication and role
  const getHomeRedirect = () => {
    if (!isAuthenticated) {
      return <SellerList />;
    }
    
    // Redirect based on role
    switch(user?.role) {
      case 'seller':
        return <Navigate to="/seller/dashboard" replace />;
      case 'buyer':
        return <Navigate to="/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <SellerList />;
    }
  };

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          {/* Make SellerList the main entry point */}
          <Route path="/" element={getHomeRedirect()} />
          
          {/* Seller-focused routes */}
          <Route path="/sellers" element={<SellerList />} />
          <Route path="/seller/:id" element={<SellerProfile />} />
          
          {/* Product routes are now secondary */}
          <Route path="/seller/:sellerId/product/:productId" element={<ProductDetail />} />
          <Route path="/products" element={<Navigate to="/sellers" replace />} />
          <Route path="/product/:id" element={<Navigate to="/sellers" replace />} />
          
          {/* Auth routes */}
          <Route path="/login" element={
            isAuthenticated ? (
              <Navigate to={location.state?.from || "/"} replace />
            ) : (
              <Login />
            )
          } />
          
          <Route path="/register" element={
            isAuthenticated ? (
              <Navigate to={location.state?.from || "/"} replace />
            ) : (
              <Register />
            )
          } />
          
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Route>
        
        {/* Protected buyer routes with BuyerLayout */}
        <Route element={<ProtectedRoute requiredRole="buyer" />}>
          <Route element={<BuyerLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cart" element={<Checkout />} />
            <Route path="/orders/history" element={<OrderHistory />} />
            <Route path="/measurements" element={<MeasurementsManager />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        
        {/* Protected seller routes with SellerLayout */}
        <Route element={<ProtectedRoute requiredRole="seller" />}>
          <Route element={<SellerLayout />}>
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            
            {/* Products routes */}
            <Route path="/seller/products" element={<ProductManager />} />
            <Route path="/seller/products/new" element={<ProductManager />} />
            <Route path="/seller/products/categories" element={<ProductCategories />} />
            <Route path="/seller/products/:id" element={<ProductManager />} />
            
            {/* Orders routes */}
            <Route path="/seller/orders" element={<OrderManager />} />
            <Route path="/seller/orders/:id" element={<OrderManager />} />
            
            {/* Other seller routes */}
            <Route path="/seller/inventory" element={<InventoryManager />} />
            <Route path="/seller/analytics" element={<Analytics />} />
            <Route path="/seller/sales" element={<SalesReport />} />
            <Route path="/seller/profile" element={<ProfilePage />} />
            <Route path="/seller/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        
        {/* Legacy routes - redirects for backwards compatibility */}
        <Route path="/dashboard/products" element={<Navigate to="/seller/products" replace />} />
        <Route path="/dashboard/products/new" element={<Navigate to="/seller/products/new" replace />} />
        <Route path="/dashboard/products/categories" element={<Navigate to="/seller/products/categories" replace />} />
        <Route path="/dashboard/sales" element={<Navigate to="/seller/sales" replace />} />
        <Route path="/dashboard/orders" element={<Navigate to="/seller/orders" replace />} />
        <Route path="/dashboard/analytics" element={<Navigate to="/seller/analytics" replace />} />
        <Route path="/dashboard/settings" element={<Navigate to="/seller/settings" replace />} />
        <Route path="/dashboard/profile" element={<Navigate to="/seller/profile" replace />} />
        <Route path="/dashboard/inventory" element={<Navigate to="/seller/inventory" replace />} />
      </Routes>
    </div>
  );
}

export default App; 