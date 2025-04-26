import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './styles.css'; // If any additional styles are needed

// Import our component pages
import DashboardPage from './components/DashboardPage';
import ProductsPage from './components/ProductsPage';
import OrdersPage from './components/OrdersPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';

// Import seller pages
import SellerDashboard from './pages/seller/Dashboard';
import ProductManager from './pages/seller/ProductManager';

// Component for each page
const Products = () => (
  <div className="card">
    <div className="card-header">
      <h3>Products</h3>
    </div>
    <div className="card-body">
      <div className="mb-3">
        <button className="btn btn-primary">Add New Product</button>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>#P-001</td>
            <td>Tailored Suit</td>
            <td>Men's Wear</td>
            <td>$299.99</td>
            <td>15</td>
            <td>
              <button className="btn btn-sm btn-info me-2">Edit</button>
              <button className="btn btn-sm btn-danger">Delete</button>
            </td>
          </tr>
          <tr>
            <td>#P-002</td>
            <td>Evening Dress</td>
            <td>Women's Wear</td>
            <td>$189.99</td>
            <td>8</td>
            <td>
              <button className="btn btn-sm btn-info me-2">Edit</button>
              <button className="btn btn-sm btn-danger">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const Orders = () => (
  <div className="card">
    <div className="card-header">
      <h3>Orders Management</h3>
    </div>
    <div className="card-body">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <select className="form-select">
            <option>All Orders</option>
            <option>Completed</option>
            <option>Processing</option>
            <option>Pending</option>
          </select>
        </div>
        <div>
          <input type="text" className="form-control" placeholder="Search orders..." />
        </div>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>#O-12345</td>
            <td>John Doe</td>
            <td>June 15, 2023</td>
            <td><span className="badge bg-success">Completed</span></td>
            <td>$120.00</td>
            <td>
              <button className="btn btn-sm btn-primary me-2">View</button>
              <button className="btn btn-sm btn-warning">Update</button>
            </td>
          </tr>
          <tr>
            <td>#O-12346</td>
            <td>Jane Smith</td>
            <td>June 16, 2023</td>
            <td><span className="badge bg-warning text-dark">Processing</span></td>
            <td>$85.50</td>
            <td>
              <button className="btn btn-sm btn-primary me-2">View</button>
              <button className="btn btn-sm btn-warning">Update</button>
            </td>
          </tr>
          <tr>
            <td>#O-12347</td>
            <td>Robert Johnson</td>
            <td>June 17, 2023</td>
            <td><span className="badge bg-danger">Cancelled</span></td>
            <td>$220.75</td>
            <td>
              <button className="btn btn-sm btn-primary me-2">View</button>
              <button className="btn btn-sm btn-warning">Update</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const Profile = () => (
  <div className="card">
    <div className="card-header">
      <h3>Your Profile</h3>
    </div>
    <div className="card-body">
      <div className="row">
        <div className="col-md-4 mb-4 text-center">
          <div className="border p-3 rounded">
            <div className="mb-3">
              <img src="https://via.placeholder.com/150" className="rounded-circle" alt="Profile" />
            </div>
            <h4>John Tailor</h4>
            <p className="text-muted">Master Tailor</p>
            <button className="btn btn-sm btn-outline-primary">Change Photo</button>
          </div>
        </div>
        <div className="col-md-8">
          <form>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" value="John Tailor" />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value="john@tailors.com" />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input type="tel" className="form-control" value="+1 (555) 123-4567" />
            </div>
            <div className="mb-3">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={3}>123 Stitch Street, Sewville, NY 10001</textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">Specialization</label>
              <select className="form-select">
                <option>Men's Suits</option>
                <option>Women's Dresses</option>
                <option>Alterations</option>
                <option>Custom Design</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

const Settings = () => (
  <div className="card">
    <div className="card-header">
      <h3>Settings</h3>
    </div>
    <div className="card-body">
      <div className="row">
        <div className="col-md-3">
          <div className="nav flex-column nav-pills">
            <button className="nav-link active mb-2">Account Settings</button>
            <button className="nav-link mb-2">Notifications</button>
            <button className="nav-link mb-2">Privacy & Security</button>
            <button className="nav-link mb-2">Integrations</button>
            <button className="nav-link mb-2">Billing</button>
          </div>
        </div>
        <div className="col-md-9">
          <h4 className="mb-3">Account Settings</h4>
          <form>
            <div className="mb-3">
              <label className="form-label">Change Password</label>
              <input type="password" className="form-control" placeholder="Current password" />
            </div>
            <div className="mb-3">
              <input type="password" className="form-control" placeholder="New password" />
            </div>
            <div className="mb-3">
              <input type="password" className="form-control" placeholder="Confirm new password" />
            </div>
            <div className="mb-3">
              <label className="form-label">Two-Factor Authentication</label>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" />
                <label className="form-check-label">Enable two-factor authentication</label>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Email Preferences</label>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" checked />
                <label className="form-check-label">Order updates</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" checked />
                <label className="form-check-label">Product announcements</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" />
                <label className="form-check-label">Marketing emails</label>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Save Settings</button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => (
  <div>
    <div className="row">
      <div className="col-md-4">
        <div className="card text-white bg-primary mb-3">
          <div className="card-header">Total Products</div>
          <div className="card-body">
            <h5 className="card-title">12</h5>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card text-white bg-success mb-3">
          <div className="card-header">Orders</div>
          <div className="card-body">
            <h5 className="card-title">5</h5>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card text-white bg-info mb-3">
          <div className="card-header">Completed</div>
          <div className="card-body">
            <h5 className="card-title">3</h5>
          </div>
        </div>
      </div>
    </div>
    <div className="mt-4">
      <h4>Recent Orders</h4>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>#O-12345</td>
            <td>John Doe</td>
            <td>June 15, 2023</td>
            <td><span className="badge bg-success">Completed</span></td>
            <td>$120.00</td>
          </tr>
          <tr>
            <td>#O-12346</td>
            <td>Jane Smith</td>
            <td>June 16, 2023</td>
            <td><span className="badge bg-warning text-dark">Processing</span></td>
            <td>$85.50</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

function App() {
  console.log('App component rendering');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  
  const handleGetStarted = () => {
    setShowWelcome(false);
    setShowDashboard(true);
    setActivePage('dashboard');
  };
  
  const handleNavigation = (page: string) => {
    setActivePage(page);
  };
  
  // Render the appropriate content based on active page
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'products':
        return <ProductsPage />;
      case 'orders':
        return <OrdersPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };
  
  return (
    <Routes>
      <Route path="/seller/dashboard" element={<SellerDashboard />} />
      <Route path="/seller/products" element={<ProductManager />} />
      <Route path="*" element={
        <div className="container-fluid">
          {showWelcome && (
            <div className="row">
              <div className="col-12">
                <div className="card mt-5">
                  <div className="card-header bg-primary text-white">
                    <h1 className="text-xl font-bold">Tailors Platform</h1>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">Welcome to the Tailors Platform</h5>
                    <p className="card-text">
                      If you can see this message, the application is running correctly.
                    </p>
                    <p className="card-text">
                      Now that the MongoDB connection is fixed, the platform should work as expected.
                    </p>
                    <button 
                      className="btn btn-primary mt-3" 
                      onClick={handleGetStarted}
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {showDashboard && (
            <div className="row mt-4">
              <div className="col-md-3">
                <div className="list-group">
                  <button 
                    className={`list-group-item list-group-item-action ${activePage === 'dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigation('dashboard')}
                  >
                    Dashboard
                  </button>
                  <button 
                    className={`list-group-item list-group-item-action ${activePage === 'products' ? 'active' : ''}`}
                    onClick={() => handleNavigation('products')}
                  >
                    Products
                  </button>
                  <button 
                    className={`list-group-item list-group-item-action ${activePage === 'orders' ? 'active' : ''}`}
                    onClick={() => handleNavigation('orders')}
                  >
                    Orders
                  </button>
                  <button 
                    className={`list-group-item list-group-item-action ${activePage === 'profile' ? 'active' : ''}`}
                    onClick={() => handleNavigation('profile')}
                  >
                    Profile
                  </button>
                  <button 
                    className={`list-group-item list-group-item-action ${activePage === 'settings' ? 'active' : ''}`}
                    onClick={() => handleNavigation('settings')}
                  >
                    Settings
                  </button>
                </div>
              </div>
              <div className="col-md-9">
                {renderContent()}
              </div>
            </div>
          )}
        </div>
      } />
    </Routes>
  );
}

export default App; 