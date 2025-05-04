import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const MainNavbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-4 shadow-sm">
      <Container>
        <Navbar.Brand>
          <Link to="/" className="text-decoration-none">
            <span className="fw-bold text-primary">Tailors</span> Platform
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Item>
              <Link to="/products" className="nav-link">Products</Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/sellers" className="nav-link">Find Tailors</Link>
            </Nav.Item>
            {isAuthenticated && (
              <Nav.Item>
                <Link to="/cart" className="nav-link">Cart</Link>
              </Nav.Item>
            )}
            {isAuthenticated && user?.role === 'buyer' && (
              <>
                <Nav.Item>
                  <Link to="/orders/history" className="nav-link">My Orders</Link>
                </Nav.Item>
                <Nav.Item>
                  <Link to="/measurements" className="nav-link">My Measurements</Link>
                </Nav.Item>
              </>
            )}
          </Nav>
          <div className="d-flex align-items-center">
            {isAuthenticated && user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-user" className="d-flex align-items-center">
                  <span className="me-2">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as="div" className="px-4 py-2 text-muted small">
                    Signed in as<br />
                    <strong>{user.email}</strong>
                    <div className="mt-1 small text-primary">
                      {user.role === 'seller' ? 'Seller Account' : 'Buyer Account'}
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  
                  {user.role === 'buyer' ? (
                    <Dropdown.Item as={Link} to="/dashboard">
                      My Dashboard
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item as={Link} to="/seller/dashboard">
                      Seller Dashboard
                    </Dropdown.Item>
                  )}
                  
                  {user.role === 'seller' && (
                    <Dropdown.Item as={Link} to="/seller/products">
                      Manage Products
                    </Dropdown.Item>
                  )}
                  
                  <Dropdown.Item as={Link} to={user.role === 'seller' ? "/seller/orders" : "/orders/history"}>
                    {user.role === 'seller' ? 'Manage Orders' : 'My Orders'}
                  </Dropdown.Item>
                  
                  <Dropdown.Item as={Link} to={user.role === 'seller' ? "/seller/profile" : "/profile"}>
                    Profile Settings
                  </Dropdown.Item>
                  
                  <Dropdown.Divider />
                  
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    Sign Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <Link to="/login" className="me-2">
                  <Button variant="outline-primary">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar; 