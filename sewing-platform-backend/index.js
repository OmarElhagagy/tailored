const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(express.json());

//Enable CORS to allow requests from frontend (localhost:3000 during development)
app.use(cors({
	origin: 'http://localhost:3000', // frontend url during development
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowHeaders: ['Content-Type', 'Authorization']
}));

// serve static files from uploads folder for photos during development
app.use('/upload', express.static(path.join(__dirname, 'uploads')));

// connect to mongodb atlas
mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB atlas')).catch(err => console.error('MongoDB connection error', err));

//Mount route files
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const pricingRoutes = require('./routes/pricing');
const orderRoutes = require('./routes/orders');
const listingRoutes = require('./routes/listings');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// basic route to test
app.get('/', (req, res) => {
	res.send('Sewing platfrom backend is running');
})

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
})
