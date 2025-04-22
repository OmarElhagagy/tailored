const axios = require('axios');
const crypto = require('crypto');

/**
 * SMS Service for handling verification and authentication
 * Supports multiple SMS gateways for Egypt
 */
class SMSService {
  constructor() {
    // Configuration could be loaded from environment variables
    this.config = {
      // Primary provider (Vodafone SMS Gateway)
      provider: process.env.SMS_PROVIDER || 'vodafone',
      
      // Vodafone SMS Gateway API configuration
      vodafone: {
        apiKey: process.env.VODAFONE_SMS_API_KEY || 'test_api_key',
        senderId: process.env.VODAFONE_SMS_SENDER_ID || 'TAILORS',
        apiUrl: process.env.VODAFONE_SMS_API_URL || 'https://smsmisr.com/api/v2',
      },
      
      // Etisalat SMS Gateway (backup)
      etisalat: {
        username: process.env.ETISALAT_SMS_USERNAME || 'test_username',
        password: process.env.ETISALAT_SMS_PASSWORD || 'test_password',
        apiUrl: process.env.ETISALAT_SMS_API_URL || 'https://smsgateway.etisalat.com.eg',
        senderId: process.env.ETISALAT_SMS_SENDER_ID || 'TAILORS',
      },
      
      // OTP configuration
      otp: {
        length: 6, // 6-digit codes
        expiryMinutes: 10, // Valid for 10 minutes
        maxRetries: 3, // Max attempts before regenerating
      }
    };
  }

  /**
   * Generate a random OTP code
   * @returns {string} OTP code
   */
  generateOTP() {
    const length = this.config.otp.length;
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  /**
   * Send verification SMS to user
   * @param {string} phone Phone number
   * @param {string} otp OTP code
   * @returns {Promise<Object>} SMS delivery result
   */
  async sendVerificationSMS(phone, otp) {
    try {
      const message = `Your Tailors verification code is: ${otp}. This code will expire in ${this.config.otp.expiryMinutes} minutes. Do not share this code with anyone.`;
      return await this.sendSMS(phone, message);
    } catch (error) {
      console.error('Error sending verification SMS:', error);
      throw new Error('Failed to send verification SMS');
    }
  }

  /**
   * Send password reset SMS to user
   * @param {string} phone Phone number
   * @param {string} otp OTP code
   * @returns {Promise<Object>} SMS delivery result
   */
  async sendPasswordResetSMS(phone, otp) {
    try {
      const message = `Your Tailors password reset code is: ${otp}. This code will expire in ${this.config.otp.expiryMinutes} minutes. If you didn't request this, please ignore.`;
      return await this.sendSMS(phone, message);
    } catch (error) {
      console.error('Error sending password reset SMS:', error);
      throw new Error('Failed to send password reset SMS');
    }
  }

  /**
   * Send a custom SMS notification
   * @param {string} phone Phone number
   * @param {string} message SMS content
   * @returns {Promise<Object>} SMS delivery result
   */
  async sendNotificationSMS(phone, message) {
    try {
      return await this.sendSMS(phone, message);
    } catch (error) {
      console.error('Error sending notification SMS:', error);
      throw new Error('Failed to send notification SMS');
    }
  }

  /**
   * Primary method to send SMS using configured provider
   * @param {string} phone Phone number
   * @param {string} message SMS content
   * @returns {Promise<Object>} SMS delivery result
   */
  async sendSMS(phone, message) {
    // Format phone number - remove leading + if present
    const phoneNumber = phone.startsWith('+') ? phone.substring(1) : phone;
    
    // Try primary provider first
    try {
      if (this.config.provider === 'vodafone') {
        return await this.sendViaSMSMisr(phoneNumber, message);
      } else {
        return await this.sendViaEtisalat(phoneNumber, message);
      }
    } catch (error) {
      console.error(`Error with primary SMS provider (${this.config.provider}):`, error);
      
      // Try fallback provider
      try {
        if (this.config.provider === 'vodafone') {
          return await this.sendViaEtisalat(phoneNumber, message);
        } else {
          return await this.sendViaSMSMisr(phoneNumber, message);
        }
      } catch (fallbackError) {
        console.error('Error with fallback SMS provider:', fallbackError);
        throw new Error('All SMS providers failed');
      }
    }
  }

  /**
   * Send SMS via Vodafone SMS Gateway (SMSMisr)
   * @param {string} phone Phone number
   * @param {string} message SMS content
   * @returns {Promise<Object>} SMS delivery result
   */
  async sendViaSMSMisr(phone, message) {
    try {
      const config = this.config.vodafone;
      
      // In production, this would send a real SMS
      // This is a mock implementation for development
      if (process.env.NODE_ENV === 'production') {
        const response = await axios.post(config.apiUrl, {
          username: config.username,
          password: config.password,
          sender: config.senderId,
          mobile: phone,
          message: message
        });
        
        return {
          success: response.data.success,
          messageId: response.data.messageId,
          provider: 'vodafone',
          timestamp: new Date()
        };
      } else {
        // Development mock response
        console.log(`[DEVELOPMENT SMS] To: ${phone}, Message: ${message}`);
        return {
          success: true,
          messageId: crypto.randomBytes(8).toString('hex'),
          provider: 'vodafone',
          timestamp: new Date()
        };
      }
    } catch (error) {
      console.error('Error sending SMS via Vodafone:', error);
      throw error;
    }
  }

  /**
   * Send SMS via Etisalat SMS Gateway
   * @param {string} phone Phone number
   * @param {string} message SMS content
   * @returns {Promise<Object>} SMS delivery result
   */
  async sendViaEtisalat(phone, message) {
    try {
      const config = this.config.etisalat;
      
      // In production, this would send a real SMS
      // This is a mock implementation for development
      if (process.env.NODE_ENV === 'production') {
        const response = await axios.post(config.apiUrl, {
          username: config.username,
          password: config.password,
          sender: config.senderId,
          recipient: phone,
          message: message
        });
        
        return {
          success: response.data.success,
          messageId: response.data.messageId,
          provider: 'etisalat',
          timestamp: new Date()
        };
      } else {
        // Development mock response
        console.log(`[DEVELOPMENT SMS] To: ${phone}, Message: ${message}`);
        return {
          success: true,
          messageId: crypto.randomBytes(8).toString('hex'),
          provider: 'etisalat',
          timestamp: new Date()
        };
      }
    } catch (error) {
      console.error('Error sending SMS via Etisalat:', error);
      throw error;
    }
  }
}

module.exports = new SMSService(); 