import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';
import PhoneVerification from './pages/PhoneVerification';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './contexts/AuthContext';

// Seller pages
import SellerDashboard from './pages/seller/Dashboard';
import InventoryManager from './pages/seller/InventoryManager';
import InventoryItemForm from './pages/seller/InventoryItemForm';
import ProductManager from './pages/seller/ProductManager';
import OrderManager from './pages/seller/OrderManager';
import SellerAnalytics from './pages/seller/Analytics';

// Buyer pages
import ProductBrowse from './pages/buyer/ProductBrowse';
import ProductDetail from './pages/buyer/ProductDetail';
import Checkout from './pages/buyer/Checkout';
import MeasurementsManager from './pages/buyer/MeasurementsManager';
import OrderHistory from './pages/buyer/OrderHistory';
import ReviewForm from './pages/buyer/ReviewForm';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-phone" element={<PhoneVerification />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          
          {/* Buyer-specific routes */}
          <Route element={<ProtectedRoute requiredRole="buyer" />}>
            <Route path="/buyer/products" element={<ProductBrowse />} />
            <Route path="/buyer/product/:id" element={<ProductDetail />} />
            <Route path="/buyer/checkout" element={<Checkout />} />
            <Route path="/buyer/measurements" element={<MeasurementsManager />} />
            <Route path="/buyer/orders" element={<OrderHistory />} />
            <Route path="/buyer/review/:orderId" element={<ReviewForm />} />
          </Route>
          
          {/* Seller-specific routes */}
          <Route element={<ProtectedRoute requiredRole="seller" />}>
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/inventory" element={<InventoryManager />} />
            <Route path="/seller/inventory/add" element={<InventoryItemForm />} />
            <Route path="/seller/inventory/edit/:id" element={<InventoryItemForm />} />
            <Route path="/seller/products" element={<ProductManager />} />
            <Route path="/seller/orders" element={<OrderManager />} />
            <Route path="/seller/analytics" element={<SellerAnalytics />} />
          </Route>
          
          {/* Admin-specific routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin/*" element={<div>Admin Area</div>} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App; 