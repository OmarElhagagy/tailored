const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const cloudStorage = require('./utils/cloudStorage');
const appInsights = require('./utils/appInsights');
const { trackRequest, trackError } = require('./middleware/appInsights');

dotenv.config();

const app = express();

// Initialize Application Insights tracking
app.use(trackRequest);

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Sanitize data against NoSQL injection
app.use(xss()); // Sanitize data against XSS attacks
app.use(cookieParser()); // Parse cookies

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10kb' })); // Body parser with size limit

//Enable CORS with improved security
app.use(cors({
	origin: process.env.FRONTEND_URL || 'http://localhost:3000',
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
	exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Initialize cloud storage (Azure Blob Storage)
(async () => {
  try {
    await cloudStorage.init();
    console.log('Cloud storage initialized successfully');
  } catch (error) {
    console.error('Failed to initialize cloud storage:', error);
  }
})();

// serve static files from uploads folder for photos during development
// (this is a fallback in case cloud storage isn't available)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// connect to mongodb atlas
mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB atlas');
  // Track successful database connection
  appInsights.trackEvent('DatabaseConnected', { database: 'MongoDB Atlas' });
}).catch(err => {
  console.error('MongoDB connection error', err);
  // Track database connection error
  appInsights.trackException(err, { context: 'Database Connection' });
  
  // Try connecting to local MongoDB as fallback
  console.log('Attempting to connect to local MongoDB instance...');
  mongoose.connect('mongodb://localhost:27017/tailors-platform', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to local MongoDB');
    appInsights.trackEvent('DatabaseConnected', { database: 'Local MongoDB' });
  }).catch(localErr => {
    console.error('Local MongoDB connection also failed:', localErr);
    appInsights.trackException(localErr, { context: 'Local Database Connection' });
  });
});

//Mount route files
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const pricingRoutes = require('./routes/pricing');
const orderRoutes = require('./routes/orders');
const listingRoutes = require('./routes/listings');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const businessCredentialRoutes = require('./routes/businessCredentials');
const legalRoutes = require('./routes/legal');
const uploadsRoutes = require('./routes/uploads');
const analyticsRoutes = require('./routes/analytics');
const paymentsRoutes = require('./routes/payments');
const reviewsRoutes = require('./routes/reviews');
const refundsRoutes = require('./routes/refunds');

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/business-credentials', businessCredentialRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/refunds', refundsRoutes);

// Provide application configuration to frontend
app.get('/api/config', (req, res) => {
  res.json({
    analytics: {
      azureAppInsights: {
        connectionString: process.env.AZURE_APP_INSIGHTS_CONNECTION_STRING || '',
        instrumentationKey: process.env.AZURE_APP_INSIGHTS_INSTRUMENTATION_KEY || '',
      }
    },
    paymentGateways: {
      fawry: !!process.env.FAWRY_MERCHANT_CODE,
      paymob: !!process.env.PAYMOB_API_KEY,
      paytabs: !!process.env.PAYTABS_PROFILE_ID,
      vodafoneCash: !!process.env.VODAFONE_MERCHANT_ID,
      instaPay: !!process.env.INSTAPAY_MERCHANT_ID
    }
  });
});

// basic route to test
app.get('/', (req, res) => {
	res.send('Sewing platfrom backend is running');
})

// Add error tracking middleware
app.use(trackError);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    errors: [{ message: 'Server error' }]
  });
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
  // Track application start
  appInsights.trackEvent('ApplicationStarted', { port: PORT });
})

// Handle graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  console.log('Graceful shutdown initiated');
  // Flush telemetry before exiting
  appInsights.flush();
  // Exit the process after a short delay to allow flushing
  setTimeout(() => process.exit(0), 500);
}
