const axios = require('axios');
const appInsights = require('./appInsights');

/**
 * Payment Gateway Integration Service
 * Handles interactions with various payment providers
 */
class PaymentGatewayService {
  constructor() {
    this.supportedGateways = {
      paymob: process.env.PAYMOB_API_KEY ? true : false,
      fawry: process.env.FAWRY_MERCHANT_CODE ? true : false,
      paytabs: process.env.PAYTABS_PROFILE_ID ? true : false,
      vodafoneCash: process.env.VODAFONE_MERCHANT_ID ? true : false,
      instaPay: process.env.INSTAPAY_MERCHANT_ID ? true : false
    };
  }

  /**
   * Process a payment with the specified gateway
   * @param {string} gateway - Payment gateway to use
   * @param {Object} paymentData - Payment details
   * @param {Object} context - Extra context information
   * @returns {Promise<Object>} Transaction result
   */
  async processPayment(gateway, paymentData, context = {}) {
    try {
      // Track start of payment processing
      appInsights.trackEvent('PaymentProcessingStarted', {
        gateway,
        amount: paymentData.amount,
        currency: paymentData.currency,
        userId: paymentData.userId,
        orderId: paymentData.orderId
      });

      // Validate gateway is supported
      if (!this.isSupportedGateway(gateway)) {
        throw new Error(`Payment gateway '${gateway}' is not supported`);
      }

      // Process based on gateway
      switch (gateway.toLowerCase()) {
        case 'paymob':
          return await this.processPaymobPayment(paymentData, context);
        case 'fawry':
          return await this.processFawryPayment(paymentData, context);
        case 'paytabs':
          return await this.processPayTabsPayment(paymentData, context);
        case 'vodafonecash':
          return await this.processVodafoneCashPayment(paymentData, context);
        case 'instapay':
          return await this.processInstaPayPayment(paymentData, context);
        default:
          throw new Error(`Gateway handler not implemented for '${gateway}'`);
      }
    } catch (error) {
      console.error(`Payment processing error with ${gateway}:`, error);
      appInsights.trackException(error, { 
        component: 'PaymentGateway', 
        operation: 'processPayment',
        gateway,
        userId: paymentData.userId
      });
      
      throw error;
    }
  }

  /**
   * Check if a gateway is supported
   * @param {string} gateway - Gateway name
   * @returns {boolean} Whether gateway is supported
   */
  isSupportedGateway(gateway) {
    return this.supportedGateways[gateway.toLowerCase()] === true;
  }

  /**
   * Get list of supported payment gateways
   * @returns {Array<string>} List of supported gateway names
   */
  getSupportedGateways() {
    return Object.keys(this.supportedGateways).filter(key => this.supportedGateways[key]);
  }

  /**
   * Process payment with Paymob
   * @param {Object} paymentData - Payment details
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Transaction result
   */
  async processPaymobPayment(paymentData, context) {
    try {
      // In production, this would make actual API calls to Paymob
      // For this implementation, we'll simulate the process

      // Step 1: Authentication
      // const authResponse = await axios.post('https://accept.paymob.com/api/auth/tokens', {
      //   api_key: process.env.PAYMOB_API_KEY
      // });
      // const authToken = authResponse.data.token;

      // Step 2: Order Registration
      // const orderResponse = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
      //   auth_token: authToken,
      //   amount_cents: paymentData.amount * 100,
      //   currency: paymentData.currency,
      //   items: []
      // });
      
      // Simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      return {
        success: true,
        transactionId: `paymob_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        amount: paymentData.amount,
        currency: paymentData.currency,
        gatewayResponse: {
          status: 'CAPTURED',
          message: 'Transaction processed successfully'
        }
      };
    } catch (error) {
      console.error('Paymob payment error:', error);
      throw new Error(`Paymob payment processing failed: ${error.message}`);
    }
  }

  /**
   * Process payment with Fawry
   * @param {Object} paymentData - Payment details
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Transaction result
   */
  async processFawryPayment(paymentData, context) {
    try {
      // Simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      
      return {
        success: true,
        transactionId: `fawry_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        amount: paymentData.amount,
        currency: paymentData.currency,
        gatewayResponse: {
          referenceNumber: `FAW-${Date.now()}`,
          status: 'SUCCESS'
        }
      };
    } catch (error) {
      console.error('Fawry payment error:', error);
      throw new Error(`Fawry payment processing failed: ${error.message}`);
    }
  }

  /**
   * Process payment with PayTabs
   * @param {Object} paymentData - Payment details
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Transaction result
   */
  async processPayTabsPayment(paymentData, context) {
    try {
      // Simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate API delay
      
      return {
        success: true,
        transactionId: `paytabs_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        amount: paymentData.amount,
        currency: paymentData.currency,
        gatewayResponse: {
          transaction_id: `PT${Date.now()}`,
          response_status: 'A',
          response_message: 'Authorised'
        }
      };
    } catch (error) {
      console.error('PayTabs payment error:', error);
      throw new Error(`PayTabs payment processing failed: ${error.message}`);
    }
  }

  /**
   * Process payment with Vodafone Cash
   * @param {Object} paymentData - Payment details
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Transaction result
   */
  async processVodafoneCashPayment(paymentData, context) {
    try {
      // Simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 900)); // Simulate API delay
      
      return {
        success: true,
        transactionId: `vodafone_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        amount: paymentData.amount,
        currency: paymentData.currency,
        gatewayResponse: {
          code: '200',
          status: 'Success',
          walletTransactionId: `VC${Date.now()}`
        }
      };
    } catch (error) {
      console.error('Vodafone Cash payment error:', error);
      throw new Error(`Vodafone Cash payment processing failed: ${error.message}`);
    }
  }

  /**
   * Process payment with InstaPay
   * @param {Object} paymentData - Payment details
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Transaction result
   */
  async processInstaPayPayment(paymentData, context) {
    try {
      // Simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay
      
      return {
        success: true,
        transactionId: `instapay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        amount: paymentData.amount,
        currency: paymentData.currency,
        gatewayResponse: {
          status: 'paid',
          paymentId: `IP${Date.now()}`,
          message: 'Payment completed'
        }
      };
    } catch (error) {
      console.error('InstaPay payment error:', error);
      throw new Error(`InstaPay payment processing failed: ${error.message}`);
    }
  }

  /**
   * Tokenize a payment method for future use
   * @param {string} gateway - Payment gateway to use
   * @param {Object} paymentData - Payment method details
   * @returns {Promise<Object>} Tokenization result
   */
  async tokenizePaymentMethod(gateway, paymentData) {
    try {
      // In a real implementation, this would call gateway-specific APIs
      // to securely tokenize payment details
      
      // For this demonstration, we'll simulate the tokenization
      const tokenizedData = Buffer.from(JSON.stringify({
        lastFour: paymentData.cardNumber.slice(-4),
        expiry: `${paymentData.expiryMonth}/${paymentData.expiryYear}`,
        timestamp: Date.now()
      })).toString('base64');
      
      return {
        success: true,
        tokenizedData,
        lastFour: paymentData.cardNumber.slice(-4),
        expiryMonth: paymentData.expiryMonth,
        expiryYear: paymentData.expiryYear,
        brand: this.detectCardBrand(paymentData.cardNumber)
      };
    } catch (error) {
      console.error(`Payment method tokenization error with ${gateway}:`, error);
      throw new Error(`Failed to tokenize payment method: ${error.message}`);
    }
  }

  /**
   * Detect credit card brand from card number
   * @param {string} cardNumber - Credit card number
   * @returns {string} Detected card brand
   */
  detectCardBrand(cardNumber) {
    // Remove spaces and dashes
    const number = cardNumber.replace(/[\s-]/g, '');
    
    // Simple detection based on card number patterns
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6(?:011|5)/.test(number)) return 'discover';
    
    return 'other';
  }

  /**
   * Process a refund
   * @param {string} gateway - Payment gateway to use
   * @param {Object} refundData - Refund details
   * @returns {Promise<Object>} Refund result
   */
  async processRefund(gateway, refundData) {
    try {
      // Validate refund data
      if (!refundData.transactionId || !refundData.amount) {
        throw new Error('Missing required refund information');
      }
      
      // In production, this would call the appropriate gateway API
      // For this implementation, we'll simulate a successful refund
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      return {
        success: true,
        refundId: `refund_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        transactionId: refundData.transactionId,
        amount: refundData.amount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Refund processing error with ${gateway}:`, error);
      appInsights.trackException(error, { 
        component: 'PaymentGateway', 
        operation: 'processRefund',
        gateway,
        transactionId: refundData.transactionId
      });
      
      throw error;
    }
  }
}

module.exports = new PaymentGatewayService(); 