import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Nav, Collapse, Button } from 'react-bootstrap';
import { 
  MdDashboard, 
  MdInventory, 
  MdShoppingCart, 
  MdPerson, 
  MdSettings, 
  MdAnalytics,
  MdAdd,
  MdCategory,
  MdExpandMore,
  MdExpandLess,
  MdPublic,
  MdAttachMoney,
  MdArrowBack
} from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';

const SellerSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [productsOpen, setProductsOpen] = React.useState(
    location.pathname.startsWith('/seller/products/')
  );
  
  const isActive = (path: string) => {
    if (path === '/seller/products' && location.pathname.startsWith('/seller/products/')) {
      return true;
    }
    if (path === '/seller/orders' && location.pathname.startsWith('/seller/orders/')) {
      return true;
    }
    return location.pathname === path;
  };

  const handleBackToWebsite = () => {
    navigate('/');
  };

  const handleViewProfile = () => {
    // Use a default ID for demo or the user's ID if available
    const sellerProfileId = user?._id || 'sample-seller-id';
    window.open(`/seller/${sellerProfileId}`, '_blank');
  };

  return (
    <div className="bg-light p-3 rounded mb-4">
      <h5 className="mb-3 ps-3">Seller Menu</h5>
      <Nav className="flex-column">
        <Nav.Item>
          <Link 
            to="/seller/dashboard" 
            className={`nav-link ${isActive('/seller/dashboard') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdDashboard className="me-2" /> Dashboard
          </Link>
        </Nav.Item>
        
        {/* Products section with submenu */}
        <Nav.Item>
          <div
            className={`nav-link d-flex justify-content-between align-items-center ${
              isActive('/seller/products') || location.pathname.startsWith('/seller/products/')
                ? 'active bg-primary text-white'
                : 'text-dark'
            } cursor-pointer`}
            onClick={() => setProductsOpen(!productsOpen)}
          >
            <div>
              <MdInventory className="me-2" /> Products
            </div>
            {productsOpen ? <MdExpandLess /> : <MdExpandMore />}
          </div>
          
          <Collapse in={productsOpen}>
            <div>
              <Nav className="flex-column ms-3 mt-1 border-start border-2 ps-2">
                <Nav.Item>
                  <Link
                    to="/seller/products"
                    className={`nav-link py-1 ${location.pathname === '/seller/products' ? 'text-primary' : 'text-dark'}`}
                  >
                    All Products
                  </Link>
                </Nav.Item>
                <Nav.Item>
                  <Link
                    to="/seller/products/new"
                    className={`nav-link py-1 ${location.pathname === '/seller/products/new' ? 'text-primary' : 'text-dark'}`}
                  >
                    <MdAdd className="me-1" size="0.9em" /> Add New Product
                  </Link>
                </Nav.Item>
                <Nav.Item>
                  <Link
                    to="/seller/products/categories"
                    className={`nav-link py-1 ${location.pathname === '/seller/products/categories' ? 'text-primary' : 'text-dark'}`}
                  >
                    <MdCategory className="me-1" size="0.9em" /> Categories
                  </Link>
                </Nav.Item>
              </Nav>
            </div>
          </Collapse>
        </Nav.Item>
        
        <Nav.Item>
          <Link 
            to="/seller/orders" 
            className={`nav-link ${isActive('/seller/orders') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdShoppingCart className="me-2" /> Orders
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link 
            to="/seller/inventory" 
            className={`nav-link ${isActive('/seller/inventory') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdInventory className="me-2" /> Inventory
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link 
            to="/seller/sales" 
            className={`nav-link ${isActive('/seller/sales') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdAttachMoney className="me-2" /> Sales Report
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link 
            to="/seller/analytics" 
            className={`nav-link ${isActive('/seller/analytics') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdAnalytics className="me-2" /> Analytics
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link 
            to="/seller/profile" 
            className={`nav-link ${isActive('/seller/profile') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdPerson className="me-2" /> Profile
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link 
            to="/seller/settings" 
            className={`nav-link ${isActive('/seller/settings') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdSettings className="me-2" /> Settings
          </Link>
        </Nav.Item>
        
        <div className="border-top my-3"></div>
        
        <Nav.Item className="mb-2">
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="w-100 d-flex align-items-center"
            onClick={handleViewProfile}
          >
            <MdPublic className="me-2" /> View Public Profile
          </Button>
        </Nav.Item>
        <Nav.Item>
          <Button
            variant="outline-primary"
            size="sm"
            className="w-100 d-flex align-items-center"
            onClick={handleBackToWebsite}
          >
            <MdArrowBack className="me-2" /> Back to Website
          </Button>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default SellerSidebar; 