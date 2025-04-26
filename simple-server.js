const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Create simple HTML for demo
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tailors Platform</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        header {
          background-color: #4a6da7;
          color: white;
          padding: 20px 0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        header .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
        }
        .nav-links {
          display: flex;
          gap: 20px;
        }
        .nav-links a {
          color: white;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 4px;
        }
        .nav-links a:hover {
          background-color: rgba(255,255,255,0.1);
        }
        .btn {
          display: inline-block;
          background-color: #3b5998;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
          transition: background-color 0.3s;
        }
        .btn:hover {
          background-color: #2d4373;
        }
        .hero {
          background-color: white;
          padding: 60px 0;
          text-align: center;
        }
        .hero h1 {
          font-size: 3rem;
          margin-bottom: 20px;
          color: #333;
        }
        .hero p {
          font-size: 1.2rem;
          color: #666;
          max-width: 800px;
          margin: 0 auto 30px;
        }
        .features {
          padding: 60px 0;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }
        .feature-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          padding: 30px;
        }
        .feature-icon {
          width: 60px;
          height: 60px;
          background-color: #e3f2fd;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 15px;
          color: #333;
        }
        .feature-card p {
          color: #666;
          line-height: 1.6;
        }
        footer {
          background-color: #333;
          color: white;
          padding: 40px 0;
        }
        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
        }
        .footer-column h3 {
          font-size: 1.2rem;
          margin-bottom: 20px;
          color: #ddd;
        }
        .footer-column ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-column ul li {
          margin-bottom: 10px;
        }
        .footer-column ul li a {
          color: #aaa;
          text-decoration: none;
        }
        .footer-column ul li a:hover {
          color: white;
        }
        .copyright {
          margin-top: 40px;
          text-align: center;
          color: #aaa;
          padding-top: 20px;
          border-top: 1px solid #444;
        }
      </style>
    </head>
    <body>
      <header>
        <div class="container">
          <div class="logo">Tailors Platform</div>
          <div class="nav-links">
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/services">Services</a>
            <a href="/contact">Contact</a>
          </div>
          <div>
            <a href="/login" class="btn">Log In</a>
          </div>
        </div>
      </header>
      
      <section class="hero">
        <div class="container">
          <h1>Connect with Skilled Tailors</h1>
          <p>Find the perfect tailor for your needs, manage orders, and get custom-tailored clothing.</p>
          <a href="/register" class="btn">Get Started</a>
        </div>
      </section>
      
      <section class="features">
        <div class="container">
          <h2 style="text-align: center; font-size: 2rem; margin-bottom: 20px;">Our Features</h2>
          <p style="text-align: center; max-width: 800px; margin: 0 auto 40px; color: #666;">
            Discover how our platform makes connecting with skilled tailors easier than ever before.
          </p>
          
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">🧵</div>
              <h3>Find Skilled Tailors</h3>
              <p>Browse profiles of skilled tailors in your area, read reviews, and find the perfect match for your project.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">📦</div>
              <h3>Order Management</h3>
              <p>Easily place orders, track progress, and communicate with your tailor throughout the process.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">✨</div>
              <h3>Custom Designs</h3>
              <p>Share your design ideas and collaborate with tailors to create the perfect custom garment.</p>
            </div>
          </div>
        </div>
      </section>
      
      <footer>
        <div class="container">
          <div class="footer-content">
            <div class="footer-column">
              <h3>Support</h3>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
            
            <div class="footer-column">
              <h3>Legal</h3>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>
            
            <div class="footer-column">
              <h3>Company</h3>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div class="copyright">
            <p>&copy; ${new Date().getFullYear()} Tailors Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </body>
    </html>
  `);
});

// Create a simple admin route
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Dashboard - Tailors Platform</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .admin-container {
          display: flex;
          min-height: 100vh;
        }
        .sidebar {
          width: 250px;
          background-color: #2c3e50;
          color: white;
          padding: 20px 0;
        }
        .sidebar-header {
          padding: 0 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 20px;
        }
        .sidebar-header h1 {
          font-size: 1.5rem;
          margin: 0;
        }
        .sidebar-menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .sidebar-menu li {
          margin-bottom: 5px;
        }
        .sidebar-menu a {
          display: block;
          padding: 12px 20px;
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          transition: all 0.3s;
        }
        .sidebar-menu a:hover, .sidebar-menu a.active {
          background-color: rgba(255,255,255,0.1);
          color: white;
        }
        .main-content {
          flex: 1;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          font-size: 1.8rem;
          color: #333;
        }
        .user-profile {
          display: flex;
          align-items: center;
        }
        .user-profile img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 10px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          padding: 20px;
        }
        .stat-card h3 {
          margin: 0 0 5px;
          color: #666;
          font-size: 0.9rem;
          font-weight: normal;
        }
        .stat-card p {
          margin: 0;
          font-size: 1.8rem;
          font-weight: bold;
          color: #333;
        }
        .stat-card.users {
          border-top: 3px solid #3498db;
        }
        .stat-card.orders {
          border-top: 3px solid #2ecc71;
        }
        .stat-card.revenue {
          border-top: 3px solid #f1c40f;
        }
        .stat-card.listings {
          border-top: 3px solid #e74c3c;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        th, td {
          padding: 15px;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #333;
        }
        tr:not(:last-child) {
          border-bottom: 1px solid #f0f0f0;
        }
        .status {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          display: inline-block;
        }
        .status.completed {
          background-color: #e3fcef;
          color: #2ecc71;
        }
        .status.pending {
          background-color: #fff8e1;
          color: #f39c12;
        }
        .status.canceled {
          background-color: #fee2e2;
          color: #e74c3c;
        }
        .status.in-progress {
          background-color: #e3f2fd;
          color: #3498db;
        }
      </style>
    </head>
    <body>
      <div class="admin-container">
        <aside class="sidebar">
          <div class="sidebar-header">
            <h1>Admin Panel</h1>
          </div>
          <ul class="sidebar-menu">
            <li><a href="#" class="active">Dashboard</a></li>
            <li><a href="#">Orders</a></li>
            <li><a href="#">Users</a></li>
            <li><a href="#">Tailors</a></li>
            <li><a href="#">Products</a></li>
            <li><a href="#">Analytics</a></li>
            <li><a href="#">Settings</a></li>
          </ul>
        </aside>
        
        <main class="main-content">
          <div class="header">
            <h1>Dashboard</h1>
            <div class="user-profile">
              <img src="https://via.placeholder.com/40" alt="Admin">
              <span>Admin User</span>
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card users">
              <h3>Total Users</h3>
              <p>2,456</p>
            </div>
            <div class="stat-card orders">
              <h3>Total Orders</h3>
              <p>1,823</p>
            </div>
            <div class="stat-card revenue">
              <h3>Revenue</h3>
              <p>$142,789</p>
            </div>
            <div class="stat-card listings">
              <h3>Active Listings</h3>
              <p>583</p>
            </div>
          </div>
          
          <h2>Recent Orders</h2>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Tailor</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ORD-001</td>
                <td>John Smith</td>
                <td>Elite Tailors</td>
                <td>Nov 10, 2023</td>
                <td>$249.99</td>
                <td><span class="status completed">Completed</span></td>
              </tr>
              <tr>
                <td>ORD-002</td>
                <td>Sarah Johnson</td>
                <td>Fashion Studio</td>
                <td>Nov 12, 2023</td>
                <td>$129.50</td>
                <td><span class="status in-progress">In Progress</span></td>
              </tr>
              <tr>
                <td>ORD-003</td>
                <td>Michael Brown</td>
                <td>Custom Suits Co.</td>
                <td>Nov 14, 2023</td>
                <td>$599.99</td>
                <td><span class="status pending">Pending</span></td>
              </tr>
              <tr>
                <td>ORD-004</td>
                <td>Emily Davis</td>
                <td>Stitch Perfect</td>
                <td>Nov 15, 2023</td>
                <td>$349.75</td>
                <td><span class="status canceled">Canceled</span></td>
              </tr>
              <tr>
                <td>ORD-005</td>
                <td>Robert Wilson</td>
                <td>Tailor Masters</td>
                <td>Nov 16, 2023</td>
                <td>$189.99</td>
                <td><span class="status completed">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </main>
      </div>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Tailors Platform is running at http://localhost:${PORT}`);
  console.log(`Admin Dashboard is running at http://localhost:${PORT}/admin`);
}); 