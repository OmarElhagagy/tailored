import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import { 
  MdShoppingBag, 
  MdPerson, 
  MdHistory, 
  MdSettings,
  MdShoppingCart,
  MdStore,
  MdStraighten,
  MdArrowBack,
  MdDashboard
} from 'react-icons/md';

const BuyerSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleBackToWebsite = () => {
    navigate('/');
  };

  return (
    <div className="bg-light p-3 rounded mb-4">
      <h5 className="mb-3 ps-3">Buyer Menu</h5>
      <Nav className="flex-column">
        <Nav.Item>
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdDashboard className="me-2" /> Dashboard
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link 
            to="/products" 
            className={`nav-link ${isActive('/products') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdShoppingBag className="me-2" /> Browse Products
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link 
            to="/sellers" 
            className={`nav-link ${isActive('/sellers') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdStore className="me-2" /> Find Tailors
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link 
            to="/cart" 
            className={`nav-link ${isActive('/cart') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdShoppingCart className="me-2" /> Shopping Cart
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link 
            to="/orders/history" 
            className={`nav-link ${isActive('/orders/history') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdHistory className="me-2" /> Order History
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link 
            to="/measurements" 
            className={`nav-link ${isActive('/measurements') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdStraighten className="me-2" /> My Measurements
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link 
            to="/profile" 
            className={`nav-link ${isActive('/profile') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdPerson className="me-2" /> Profile
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link 
            to="/settings" 
            className={`nav-link ${isActive('/settings') ? 'active bg-primary text-white' : 'text-dark'}`}
          >
            <MdSettings className="me-2" /> Settings
          </Link>
        </Nav.Item>
        
        <div className="border-top my-3"></div>
        
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

export default BuyerSidebar; 