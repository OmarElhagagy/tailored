const axios = require('axios');
const crypto = require('crypto');

/**
 * Payment Service for Egyptian payment gateways integration
 * Supports: 
 * - Fawry (https://developer.fawrystaging.com/)
 * - PayMob/Accept (https://accept.paymob.com/docs/api/)
 * - Paytabs (https://site.paytabs.com/en/developers/)
 * - Vodafone Cash (via integration partners)
 */
class PaymentService {
  constructor() {
    this.configurations = {
      fawry: {
        merchantCode: process.env.FAWRY_MERCHANT_CODE || '',
        securityKey: process.env.FAWRY_SECURITY_KEY || '',
        apiUrl: process.env.FAWRY_API_URL || 'https://atfawry.fawrystaging.com/ECommerceWeb/api/orders/',
      },
      paymob: {
        apiKey: process.env.PAYMOB_API_KEY || '',
        integrationId: process.env.PAYMOB_INTEGRATION_ID || '',
        iframeId: process.env.PAYMOB_IFRAME_ID || '',
        apiUrl: process.env.PAYMOB_API_URL || 'https://accept.paymobsolutions.com/api/',
      },
      paytabs: {
        profileId: process.env.PAYTABS_PROFILE_ID || '',
        serverKey: process.env.PAYTABS_SERVER_KEY || '',
        apiUrl: process.env.PAYTABS_API_URL || 'https://secure.paytabs.sa/payment/request',
      },
      vodafoneCash: {
        merchantId: process.env.VODAFONE_MERCHANT_ID || '',
        securityKey: process.env.VODAFONE_SECURITY_KEY || '',
        apiUrl: process.env.VODAFONE_API_URL || '',
      },
      instaPay: {
        merchantId: process.env.INSTAPAY_MERCHANT_ID || '',
        securityKey: process.env.INSTAPAY_SECURITY_KEY || '',
        apiUrl: process.env.INSTAPAY_API_URL || 'https://api.instapay.eg',
        qrCodeEndpoint: process.env.INSTAPAY_QR_ENDPOINT || 'https://api.instapay.eg/qr'
      }
    };
  }

  /**
   * Creates a Fawry payment link for a given order
   * @param {Object} order - Order details
   * @param {string} order.orderId - Unique order ID in your system
   * @param {string} order.customerName - Customer name
   * @param {string} order.customerPhone - Customer phone number
   * @param {string} order.customerEmail - Customer email (optional)
   * @param {number} order.amount - Amount in EGP
   * @param {string} order.description - Order description
   * @param {string} order.paymentMethod - Payment method (CARD, WALLET, CASH)
   * @returns {Promise<Object>} - Payment URL and reference number
   */
  async createFawryPayment(order) {
    try {
      const merchantRefNum = order.orderId;
      const paymentExpiry = Math.floor(Date.now() / 1000) + (60 * 60 * 24); // 24 hours
      
      // Build Fawry request
      const requestData = {
        merchantCode: this.configurations.fawry.merchantCode,
        merchantRefNum: merchantRefNum,
        customerProfileId: order.customerPhone,
        customerName: order.customerName,
        customerMobile: order.customerPhone,
        customerEmail: order.customerEmail || '',
        paymentMethod: order.paymentMethod,
        amount: order.amount,
        currencyCode: 'EGP',
        description: order.description,
        paymentExpiry: paymentExpiry,
        chargeItems: [
          {
            itemId: merchantRefNum,
            description: order.description,
            price: order.amount,
            quantity: 1
          }
        ]
      };
      
      // Generate signature
      const signatureString = 
        this.configurations.fawry.merchantCode +
        merchantRefNum +
        order.customerPhone +
        order.amount.toFixed(2) +
        this.configurations.fawry.securityKey;
        
      const signature = crypto
        .createHash('sha256')
        .update(signatureString)
        .digest('hex');
        
      requestData.signature = signature;
      
      // Make API call to Fawry
      const response = await axios.post(
        `${this.configurations.fawry.apiUrl}createCardToken`,
        requestData
      );
      
      return {
        status: response.data.statusCode === 200 ? 'success' : 'failed',
        referenceNumber: response.data.referenceNumber,
        paymentUrl: `https://atfawry.fawrystaging.com/atfawry/plugin/${this.configurations.fawry.merchantCode}/${merchantRefNum}`,
        merchantRefNum: merchantRefNum,
        expiry: new Date(paymentExpiry * 1000)
      };
    } catch (error) {
      console.error('Fawry payment creation error:', error);
      throw new Error('Failed to create Fawry payment: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Create PayMob payment
   * @param {Object} order - Order details
   * @param {string} order.orderId - Unique order ID in your system
   * @param {string} order.customerName - Customer name
   * @param {string} order.customerPhone - Customer phone number
   * @param {string} order.customerEmail - Customer email (optional)
   * @param {number} order.amount - Amount in EGP (in piasters, e.g., 100 EGP = 10000)
   * @param {string} order.description - Order description
   * @returns {Promise<Object>} - Payment URL and reference number
   */
  async createPayMobPayment(order) {
    try {
      // Step 1: Authentication request
      const authResponse = await axios.post(
        `${this.configurations.paymob.apiUrl}auth/tokens`, 
        { api_key: this.configurations.paymob.apiKey }
      );
      
      const token = authResponse.data.token;
      
      // Step 2: Order registration
      const orderResponse = await axios.post(
        `${this.configurations.paymob.apiUrl}ecommerce/orders`, 
        {
          auth_token: token,
          delivery_needed: false,
          amount_cents: order.amount * 100, // Convert to piasters
          items: [
            {
              name: order.description,
              amount_cents: order.amount * 100,
              description: order.description,
              quantity: "1"
            }
          ],
          merchant_order_id: order.orderId
        }
      );
      
      // Step 3: Payment key request
      const paymentKeyResponse = await axios.post(
        `${this.configurations.paymob.apiUrl}acceptance/payment_keys`,
        {
          auth_token: token,
          amount_cents: order.amount * 100,
          expiration: 3600, // 1 hour
          order_id: orderResponse.data.id,
          billing_data: {
            apartment: "NA",
            email: order.customerEmail || "NA",
            floor: "NA",
            first_name: order.customerName.split(' ')[0],
            street: "NA",
            building: "NA",
            phone_number: order.customerPhone,
            shipping_method: "NA",
            postal_code: "NA",
            city: "NA",
            country: "EG",
            last_name: order.customerName.split(' ').length > 1 ? order.customerName.split(' ')[1] : "NA",
            state: "NA"
          },
          currency: "EGP",
          integration_id: this.configurations.paymob.integrationId
        }
      );
      
      // Step 4: Build iframe URL
      const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.configurations.paymob.iframeId}?payment_token=${paymentKeyResponse.data.token}`;
      
      return {
        status: 'success',
        orderId: orderResponse.data.id,
        paymentKey: paymentKeyResponse.data.token,
        paymentUrl: iframeUrl,
        expiry: new Date(Date.now() + 3600 * 1000) // 1 hour from now
      };
    } catch (error) {
      console.error('PayMob payment creation error:', error);
      throw new Error('Failed to create PayMob payment: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Create PayTabs payment
   * @param {Object} order - Order details
   * @param {string} order.orderId - Unique order ID in your system
   * @param {string} order.customerName - Customer name
   * @param {string} order.customerPhone - Customer phone number
   * @param {string} order.customerEmail - Customer email (required for PayTabs)
   * @param {number} order.amount - Amount in EGP
   * @param {string} order.description - Order description
   * @param {string} order.returnUrl - URL to redirect after payment
   * @returns {Promise<Object>} - Payment URL and reference number
   */
  async createPayTabsPayment(order) {
    if (!order.customerEmail) {
      throw new Error('Customer email is required for PayTabs payments');
    }
    
    if (!order.returnUrl) {
      throw new Error('Return URL is required for PayTabs payments');
    }

    try {
      const requestData = {
        profile_id: this.configurations.paytabs.profileId,
        tran_type: "sale",
        tran_class: "ecom",
        cart_id: order.orderId,
        cart_description: order.description,
        cart_currency: "EGP",
        cart_amount: order.amount,
        callback: order.returnUrl,
        return: order.returnUrl,
        customer_details: {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          street1: "NA",
          city: "NA",
          country: "EG"
        }
      };
      
      const response = await axios.post(
        this.configurations.paytabs.apiUrl,
        requestData,
        {
          headers: {
            'Authorization': this.configurations.paytabs.serverKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.redirect_url) {
        return {
          status: 'success',
          transactionReference: response.data.tran_ref,
          paymentUrl: response.data.redirect_url,
          expiry: new Date(Date.now() + 3600 * 1000) // 1 hour from now
        };
      } else {
        throw new Error('Failed to get payment URL from PayTabs');
      }
    } catch (error) {
      console.error('PayTabs payment creation error:', error);
      throw new Error('Failed to create PayTabs payment: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Create Vodafone Cash payment (via integration partner)
   * @param {Object} order - Order details
   * @param {string} order.orderId - Unique order ID in your system
   * @param {string} order.customerName - Customer name
   * @param {string} order.customerPhone - Customer phone number (Vodafone number)
   * @param {number} order.amount - Amount in EGP
   * @param {string} order.description - Order description
   * @returns {Promise<Object>} - Payment instructions and reference number
   */
  async createVodafoneCashPayment(order) {
    // Validate phone number is a Vodafone number
    if (!order.customerPhone.startsWith('+2010') && !order.customerPhone.startsWith('010')) {
      throw new Error('Phone number must be a Vodafone number starting with 010');
    }
    
    try {
      // This is a placeholder for actual integration
      // Most Vodafone Cash integrations are done via third-party providers in Egypt
      // For demonstration purposes, we'll return instructions for manual payment
      
      const referenceNumber = `VC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      return {
        status: 'pending',
        referenceNumber: referenceNumber,
        instructions: [
          `1. Open your Vodafone Cash mobile app`,
          `2. Select "Pay Bills"`,
          `3. Select "Merchants"`,
          `4. Enter merchant code: ${this.configurations.vodafoneCash.merchantId}`,
          `5. Enter amount: ${order.amount} EGP`,
          `6. Enter reference number: ${referenceNumber}`,
          `7. Confirm payment`
        ],
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      };
    } catch (error) {
      console.error('Vodafone Cash payment creation error:', error);
      throw new Error('Failed to create Vodafone Cash payment: ' + error.message);
    }
  }

  /**
   * Create InstaPay payment
   * @param {Object} order - Order details
   * @param {string} order.orderId - Unique order ID in your system
   * @param {string} order.customerName - Customer name
   * @param {string} order.customerPhone - Customer phone number
   * @param {string} order.customerEmail - Customer email (optional)
   * @param {number} order.amount - Amount in EGP
   * @param {string} order.description - Order description
   * @returns {Promise<Object>} - Payment QR code and reference number
   */
  async createInstaPayPayment(order) {
    try {
      // Generate unique reference number for the transaction
      const referenceNumber = `INST-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // In a real implementation, this would call the InstaPay API
      // For now, we'll provide a mock implementation for development
      if (process.env.NODE_ENV === 'production') {
        // Prepare request data
        const requestData = {
          merchantId: this.configurations.instaPay.merchantId,
          merchantName: 'Tailors',
          terminalId: 'WEB',
          amount: order.amount,
          currencyCode: 'EGP',
          merchantReference: referenceNumber,
          customerReference: order.orderId,
          narrative: order.description,
          customerName: order.customerName,
          customerMobile: order.customerPhone,
          customerEmail: order.customerEmail || '',
          billingAddress: {
            countryCode: 'EG',
            city: 'Cairo',
            street: 'N/A'
          }
        };
        
        // Create signature for request
        const signatureData = `${this.configurations.instaPay.merchantId}|${referenceNumber}|${order.amount}|${this.configurations.instaPay.securityKey}`;
        const signature = crypto.createHash('sha256').update(signatureData).digest('hex');
        
        // Add signature to request
        requestData.signature = signature;
        
        // Make API call to InstaPay
        const response = await axios.post(
          this.configurations.instaPay.apiUrl,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.configurations.instaPay.securityKey}`
            }
          }
        );
        
        return {
          status: 'success',
          referenceNumber: referenceNumber,
          qrCodeUrl: response.data.qrCodeUrl,
          paymentUrl: response.data.paymentUrl,
          expiry: new Date(Date.now() + 3600 * 1000) // 1 hour from now
        };
      } else {
        // Mock response for development
        return {
          status: 'success',
          referenceNumber: referenceNumber,
          qrCodeUrl: `https://mockqr.instapay.eg/${referenceNumber}`,
          paymentUrl: `https://mockpayment.instapay.eg/${referenceNumber}`,
          instructions: [
            '1. Open your bank app',
            '2. Scan the QR code or use the payment link',
            '3. Confirm payment in your banking app',
            '4. Once confirmed, the payment will be applied to your order automatically'
          ],
          expiry: new Date(Date.now() + 3600 * 1000) // 1 hour from now
        };
      }
    } catch (error) {
      console.error('InstaPay payment creation error:', error);
      throw new Error('Failed to create InstaPay payment: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Verify payment status
   * @param {string} gateway - Payment gateway (fawry, paymob, paytabs, vodafoneCash, instaPay)
   * @param {string} referenceNumber - Reference number returned by the payment gateway
   * @returns {Promise<Object>} - Payment status details
   */
  async verifyPayment(gateway, referenceNumber) {
    try {
      switch (gateway.toLowerCase()) {
        case 'fawry':
          return await this.verifyFawryPayment(referenceNumber);
        case 'paymob':
          return await this.verifyPayMobPayment(referenceNumber);
        case 'paytabs':
          return await this.verifyPayTabsPayment(referenceNumber);
        case 'vodafonecash':
          return await this.verifyVodafoneCashPayment(referenceNumber);
        case 'instapay':
          return await this.verifyInstaPayPayment(referenceNumber);
        default:
          throw new Error(`Unsupported payment gateway: ${gateway}`);
      }
    } catch (error) {
      console.error(`Payment verification error (${gateway}):`, error);
      throw new Error(`Failed to verify payment: ${error.message}`);
    }
  }

  /**
   * Verify Fawry payment status
   * @param {string} referenceNumber - Fawry reference number
   * @returns {Promise<Object>} - Payment status details
   */
  async verifyFawryPayment(referenceNumber) {
    try {
      const merchantCode = this.configurations.fawry.merchantCode;
      const securityKey = this.configurations.fawry.securityKey;
      
      // Create signature
      const signatureString = merchantCode + referenceNumber + securityKey;
      const signature = crypto
        .createHash('sha256')
        .update(signatureString)
        .digest('hex');
      
      const response = await axios.get(
        `${this.configurations.fawry.apiUrl}status?merchantCode=${merchantCode}&merchantRefNumber=${referenceNumber}&signature=${signature}`
      );
      
      const paymentStatus = response.data.paymentStatus || 'UNKNOWN';
      
      return {
        referenceNumber: referenceNumber,
        status: this.mapFawryStatus(paymentStatus),
        gatewayStatus: paymentStatus,
        amount: response.data.paymentAmount || 0,
        paidAt: response.data.paymentTime ? new Date(response.data.paymentTime) : null,
        rawResponse: response.data
      };
    } catch (error) {
      console.error('Fawry payment verification error:', error);
      throw new Error('Failed to verify Fawry payment: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Map Fawry status to standardized status
   * @param {string} fawryStatus - Fawry status
   * @returns {string} - Standardized status (success, pending, failed)
   */
  mapFawryStatus(fawryStatus) {
    switch (fawryStatus.toUpperCase()) {
      case 'PAID':
      case 'DELIVERED':
        return 'success';
      case 'NEW':
      case 'UNPAID':
        return 'pending';
      case 'CANCELED':
      case 'REFUNDED':
      case 'EXPIRED':
        return 'failed';
      default:
        return 'unknown';
    }
  }

  /**
   * Verify PayMob payment status
   * @param {string} orderId - PayMob order ID
   * @returns {Promise<Object>} - Payment status details
   */
  async verifyPayMobPayment(orderId) {
    try {
      // Authenticate
      const authResponse = await axios.post(
        `${this.configurations.paymob.apiUrl}auth/tokens`, 
        { api_key: this.configurations.paymob.apiKey }
      );
      
      const token = authResponse.data.token;
      
      // Retrieve order
      const response = await axios.get(
        `${this.configurations.paymob.apiUrl}ecommerce/orders/${orderId}`,
        {
          headers: {
            'Authorization': token
          }
        }
      );
      
      const order = response.data;
      let status = 'pending';
      let transaction = null;
      
      // Find successful transaction
      if (order.transactions && order.transactions.length > 0) {
        for (const trans of order.transactions) {
          if (trans.success === true) {
            status = 'success';
            transaction = trans;
            break;
          }
        }
      }
      
      // Check if order is delivered
      if (order.delivery_status && order.delivery_status.status === 'DELIVERED') {
        status = 'success';
      }
      
      return {
        orderId: orderId,
        status: status,
        amount: order.amount_cents / 100, // Convert from piasters to EGP
        paidAt: transaction ? new Date(transaction.created_at) : null,
        transactionId: transaction ? transaction.id : null,
        rawResponse: order
      };
    } catch (error) {
      console.error('PayMob payment verification error:', error);
      throw new Error('Failed to verify PayMob payment: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Verify PayTabs payment status
   * @param {string} transactionReference - PayTabs transaction reference
   * @returns {Promise<Object>} - Payment status details
   */
  async verifyPayTabsPayment(transactionReference) {
    try {
      const requestData = {
        profile_id: this.configurations.paytabs.profileId,
        tran_ref: transactionReference
      };
      
      const response = await axios.post(
        `${this.configurations.paytabs.apiUrl.replace('request', 'query')}`,
        requestData,
        {
          headers: {
            'Authorization': this.configurations.paytabs.serverKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        transactionReference: transactionReference,
        status: this.mapPayTabsStatus(response.data.payment_result?.response_status),
        gatewayStatus: response.data.payment_result?.response_status,
        amount: parseFloat(response.data.cart_amount) || 0,
        paidAt: response.data.payment_result?.created_date ? new Date(response.data.payment_result.created_date) : null,
        rawResponse: response.data
      };
    } catch (error) {
      console.error('PayTabs payment verification error:', error);
      throw new Error('Failed to verify PayTabs payment: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Map PayTabs status to standardized status
   * @param {string} payTabsStatus - PayTabs status
   * @returns {string} - Standardized status (success, pending, failed)
   */
  mapPayTabsStatus(payTabsStatus) {
    switch (payTabsStatus?.toUpperCase()) {
      case 'A':
        return 'success';
      case 'H':
        return 'pending';
      case 'D':
      case 'E':
      case 'V':
        return 'failed';
      default:
        return 'unknown';
    }
  }

  /**
   * Verify Vodafone Cash payment status
   * This is a placeholder as most Vodafone Cash integrations are custom
   * @param {string} referenceNumber - Reference number
   * @returns {Promise<Object>} - Payment status details
   */
  async verifyVodafoneCashPayment(referenceNumber) {
    // This is a placeholder for actual integration
    // In a real implementation, this would call an API endpoint
    // provided by your Vodafone Cash integration partner
    
    return {
      referenceNumber: referenceNumber,
      status: 'pending', // This would come from the actual API
      message: 'Please contact customer service to verify payment status'
    };
  }

  /**
   * Verify InstaPay payment status
   * @param {string} referenceNumber - InstaPay reference number
   * @returns {Promise<Object>} - Payment status details
   */
  async verifyInstaPayPayment(referenceNumber) {
    try {
      if (process.env.NODE_ENV === 'production') {
        // In production, we would make a real API call
        const requestData = {
          merchantId: this.configurations.instaPay.merchantId,
          merchantReference: referenceNumber
        };
        
        // Generate signature
        const signatureData = `${this.configurations.instaPay.merchantId}|${referenceNumber}|${this.configurations.instaPay.securityKey}`;
        const signature = crypto.createHash('sha256').update(signatureData).digest('hex');
        
        requestData.signature = signature;
        
        const response = await axios.post(
          `${this.configurations.instaPay.apiUrl}/query`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.configurations.instaPay.securityKey}`
            }
          }
        );
        
        return {
          referenceNumber: referenceNumber,
          status: this.mapInstaPayStatus(response.data.status),
          gatewayStatus: response.data.status,
          amount: response.data.amount || 0,
          paidAt: response.data.paymentTime ? new Date(response.data.paymentTime) : null,
          rawResponse: response.data
        };
      } else {
        // Mock response for development
        // Randomly returns success or pending for demonstration
        const mockStatus = Math.random() > 0.5 ? 'PAID' : 'PENDING';
        
        return {
          referenceNumber: referenceNumber,
          status: this.mapInstaPayStatus(mockStatus),
          gatewayStatus: mockStatus,
          amount: 0, // Mock amount
          paidAt: mockStatus === 'PAID' ? new Date() : null,
          rawResponse: { status: mockStatus }
        };
      }
    } catch (error) {
      console.error('InstaPay payment verification error:', error);
      throw new Error('Failed to verify InstaPay payment: ' + (error.response?.data?.message || error.message));
    }
  }
  
  /**
   * Map InstaPay status to standardized status
   * @param {string} instaPayStatus - InstaPay status
   * @returns {string} - Standardized status (success, pending, failed)
   */
  mapInstaPayStatus(instaPayStatus) {
    switch (instaPayStatus?.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
      case 'SUCCESS':
        return 'success';
      case 'PENDING':
      case 'INITIATED':
      case 'PROCESSING':
        return 'pending';
      case 'FAILED':
      case 'CANCELLED':
      case 'EXPIRED':
      case 'REJECTED':
        return 'failed';
      default:
        return 'unknown';
    }
  }
}

module.exports = new PaymentService(); 