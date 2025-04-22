const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const paymentsRoutes = require('../../routes/payments');
const PaymentService = require('../../utils/paymentService');
const User = require('../../models/User');
const Order = require('../../models/Order');

// Create a mock Express app for testing
const app = express();
app.use(express.json());
app.use('/api/payments', paymentsRoutes);

// Mock the payment service
jest.mock('../../utils/paymentService');

describe('Payments API', () => {
  let authToken;
  
  beforeAll(async () => {
    // Create a mock user for authentication
    const user = {
      _id: new mongoose.Types.ObjectId(),
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'buyer'
    };
    
    // Generate a JWT for this user
    authToken = jwt.sign(
      { user: { id: user._id, role: user.role, name: `${user.firstName} ${user.lastName}` } },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );
    
    // Mock the User.findById method
    User.findById = jest.fn().mockResolvedValue(user);
  });
  
  afterAll(async () => {
    jest.restoreAllMocks();
  });
  
  describe('POST /api/payments/create', () => {
    it('should create a payment for a valid order', async () => {
      // Mock the Order.findById method
      const mockOrder = {
        _id: new mongoose.Types.ObjectId(),
        buyerId: new mongoose.Types.ObjectId(),
        sellerId: new mongoose.Types.ObjectId(),
        listingId: new mongoose.Types.ObjectId(),
        status: 'pending_payment',
        price: {
          total: 150.5
        },
        save: jest.fn().mockResolvedValue(true)
      };
      
      Order.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockOrder)
      }));
      
      // Mock the payment service response
      PaymentService.createFawryPayment = jest.fn().mockResolvedValue({
        status: 'success',
        referenceNumber: 'test-ref-123',
        paymentUrl: 'https://test-payment-url.com',
        merchantRefNum: mockOrder._id.toString(),
        expiry: new Date()
      });
      
      // Make the request
      const response = await request(app)
        .post('/api/payments/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: mockOrder._id.toString(),
          gateway: 'fawry',
          paymentMethod: 'CARD'
        });
      
      // Assert the response
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('referenceNumber', 'test-ref-123');
      expect(response.body.data).toHaveProperty('paymentUrl');
      
      // Verify the payment service was called with the correct parameters
      expect(PaymentService.createFawryPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: mockOrder._id.toString(),
          amount: mockOrder.price.total,
          paymentMethod: 'CARD'
        })
      );
    });
    
    it('should return 404 for non-existent order', async () => {
      // Mock the Order.findById to return null (order not found)
      Order.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(null)
      }));
      
      // Make the request
      const response = await request(app)
        .post('/api/payments/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: new mongoose.Types.ObjectId().toString(),
          gateway: 'fawry',
          paymentMethod: 'CARD'
        });
      
      // Assert the response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('errors');
    });
    
    it('should return 400 for invalid payment gateway', async () => {
      // Make the request with an invalid gateway
      const response = await request(app)
        .post('/api/payments/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: new mongoose.Types.ObjectId().toString(),
          gateway: 'invalid-gateway',
          paymentMethod: 'CARD'
        });
      
      // Assert the response
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/payments/verify/:gateway/:referenceNumber', () => {
    it('should verify a payment and update the order status', async () => {
      // Mock the payment service verification
      PaymentService.verifyPayment = jest.fn().mockResolvedValue({
        status: 'success',
        paymentStatus: 'PAID',
        amount: 150.5,
        transactionId: 'txn-123'
      });
      
      // Mock finding and updating the order
      const mockOrder = {
        _id: new mongoose.Types.ObjectId(),
        status: 'pending_payment',
        payment: {},
        save: jest.fn().mockResolvedValue(true)
      };
      
      Order.findOne = jest.fn().mockResolvedValue(mockOrder);
      
      // Make the request
      const response = await request(app)
        .get('/api/payments/verify/fawry/test-ref-123')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Assert the response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('paymentStatus', 'PAID');
      
      // Verify the payment service was called correctly
      expect(PaymentService.verifyPayment).toHaveBeenCalledWith('fawry', 'test-ref-123');
      
      // Verify the order was updated
      expect(mockOrder.status).toBe('processing');
      expect(mockOrder.payment).toHaveProperty('status', 'PAID');
      expect(mockOrder.save).toHaveBeenCalled();
    });
    
    it('should return 404 when order not found for reference number', async () => {
      // Mock the payment service verification
      PaymentService.verifyPayment = jest.fn().mockResolvedValue({
        status: 'success',
        paymentStatus: 'PAID',
        amount: 150.5,
        transactionId: 'txn-123'
      });
      
      // Mock finding no order
      Order.findOne = jest.fn().mockResolvedValue(null);
      
      // Make the request
      const response = await request(app)
        .get('/api/payments/verify/fawry/test-ref-123')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Assert the response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
    
    it('should return 400 for failed payment verification', async () => {
      // Mock the payment service verification failure
      PaymentService.verifyPayment = jest.fn().mockRejectedValue(
        new Error('Payment verification failed')
      );
      
      // Make the request
      const response = await request(app)
        .get('/api/payments/verify/fawry/test-ref-123')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Assert the response
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
}); 