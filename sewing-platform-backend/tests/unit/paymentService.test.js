const axios = require('axios');
const crypto = require('crypto');
const PaymentService = require('../../utils/paymentService');

// Mock axios
jest.mock('axios');

describe('PaymentService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFawryPayment', () => {
    it('should create a Fawry payment with correct signature', async () => {
      // Mock the axios response
      axios.post.mockResolvedValueOnce({
        data: {
          statusCode: 200,
          referenceNumber: 'test-ref-123'
        }
      });

      // Test order data
      const order = {
        orderId: 'order-123',
        customerName: 'Test User',
        customerPhone: '01234567890',
        customerEmail: 'test@example.com',
        amount: 150.5,
        description: 'Test Order',
        paymentMethod: 'CARD'
      };

      // Call the method
      const result = await PaymentService.createFawryPayment(order);

      // Verify the result
      expect(result.status).toBe('success');
      expect(result.referenceNumber).toBe('test-ref-123');
      expect(result.merchantRefNum).toBe('order-123');
      expect(result.paymentUrl).toContain('order-123');

      // Verify the signature calculation
      const expectedSignatureString = 
        PaymentService.configurations.fawry.merchantCode +
        order.orderId +
        order.customerPhone +
        order.amount.toFixed(2) +
        PaymentService.configurations.fawry.securityKey;
        
      const expectedSignature = crypto
        .createHash('sha256')
        .update(expectedSignatureString)
        .digest('hex');

      // Verify axios was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          merchantCode: expect.any(String),
          merchantRefNum: order.orderId,
          customerProfileId: order.customerPhone,
          customerName: order.customerName,
          customerMobile: order.customerPhone,
          customerEmail: order.customerEmail,
          paymentMethod: order.paymentMethod,
          amount: order.amount,
          signature: expectedSignature
        })
      );
    });

    it('should handle Fawry payment creation errors', async () => {
      // Mock the axios error
      axios.post.mockRejectedValueOnce(new Error('API error'));

      // Test order data
      const order = {
        orderId: 'order-123',
        customerName: 'Test User',
        customerPhone: '01234567890',
        amount: 150.5,
        description: 'Test Order',
        paymentMethod: 'CARD'
      };

      // Verify that the method throws an error
      await expect(PaymentService.createFawryPayment(order)).rejects.toThrow('Failed to create Fawry payment');
    });
  });

  describe('createPayMobPayment', () => {
    it('should create a PayMob payment successfully', async () => {
      // Mock authentication response
      axios.post.mockResolvedValueOnce({
        data: {
          token: 'auth-token-123'
        }
      });
      
      // Mock order registration response
      axios.post.mockResolvedValueOnce({
        data: {
          id: 'paymob-order-123'
        }
      });
      
      // Mock payment key response
      axios.post.mockResolvedValueOnce({
        data: {
          token: 'payment-key-123'
        }
      });

      // Test order data
      const order = {
        orderId: 'order-123',
        customerName: 'Test User',
        customerPhone: '01234567890',
        customerEmail: 'test@example.com',
        amount: 150,
        description: 'Test Order'
      };

      // Call the method
      const result = await PaymentService.createPayMobPayment(order);

      // Verify the result
      expect(result.status).toBe('success');
      expect(result.orderId).toBe('paymob-order-123');
      expect(result.paymentKey).toBe('payment-key-123');
      expect(result.paymentUrl).toContain('payment-key-123');

      // Verify axios calls
      expect(axios.post).toHaveBeenCalledTimes(3);
      
      // Check authentication request
      expect(axios.post.mock.calls[0][0]).toContain('auth/tokens');
      
      // Check order registration request
      expect(axios.post.mock.calls[1][0]).toContain('ecommerce/orders');
      expect(axios.post.mock.calls[1][1]).toMatchObject({
        auth_token: 'auth-token-123',
        amount_cents: 15000, // 150 * 100
        merchant_order_id: 'order-123'
      });
      
      // Check payment key request
      expect(axios.post.mock.calls[2][0]).toContain('payment_keys');
      expect(axios.post.mock.calls[2][1]).toMatchObject({
        auth_token: 'auth-token-123',
        amount_cents: 15000,
        order_id: 'paymob-order-123'
      });
    });

    it('should handle PayMob payment creation errors', async () => {
      // Mock authentication error
      axios.post.mockRejectedValueOnce(new Error('API error'));

      // Test order data
      const order = {
        orderId: 'order-123',
        customerName: 'Test User',
        customerPhone: '01234567890',
        amount: 150,
        description: 'Test Order'
      };

      // Verify that the method throws an error
      await expect(PaymentService.createPayMobPayment(order)).rejects.toThrow('Failed to create PayMob payment');
    });
  });

  describe('verifyPayment', () => {
    it('should call the correct verification method based on gateway', async () => {
      // Create spies for verification methods
      const verifyFawrySpy = jest.spyOn(PaymentService, 'verifyFawryPayment').mockResolvedValue({ status: 'success' });
      const verifyPayMobSpy = jest.spyOn(PaymentService, 'verifyPayMobPayment').mockResolvedValue({ status: 'success' });
      const verifyPayTabsSpy = jest.spyOn(PaymentService, 'verifyPayTabsPayment').mockResolvedValue({ status: 'success' });

      // Test different gateways
      await PaymentService.verifyPayment('fawry', 'ref-123');
      expect(verifyFawrySpy).toHaveBeenCalledWith('ref-123');

      await PaymentService.verifyPayment('paymob', 'order-123');
      expect(verifyPayMobSpy).toHaveBeenCalledWith('order-123');

      await PaymentService.verifyPayment('paytabs', 'txn-123');
      expect(verifyPayTabsSpy).toHaveBeenCalledWith('txn-123');
    });

    it('should throw error for invalid gateway', async () => {
      await expect(PaymentService.verifyPayment('invalid-gateway', 'ref-123'))
        .rejects.toThrow('Unsupported payment gateway: invalid-gateway');
    });
  });
}); 