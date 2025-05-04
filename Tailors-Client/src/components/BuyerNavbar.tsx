import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const BuyerNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/products" className="nav-link">Browse Products</Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/sellers" className="nav-link">Find Tailors</Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/cart" className="nav-link">Shopping Cart</Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/orders/history" className="nav-link">Orders</Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/measurements" className="nav-link">Measurements</Link>
            </Nav.Item>
          </Nav>
          <div className="d-flex align-items-center">
            {user ? (
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
                      Buyer Account
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  
                  <Dropdown.Item as={Link} to="/profile">
                    Profile Settings
                  </Dropdown.Item>
                  
                  <Dropdown.Item as={Link} to="/settings">
                    Account Settings
                  </Dropdown.Item>
                  
                  <Dropdown.Divider />
                  
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    Sign Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Link to="/login">
                <Button variant="outline-primary">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default BuyerNavbar; 