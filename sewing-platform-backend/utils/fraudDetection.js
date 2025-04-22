const appInsights = require('./appInsights');

/**
 * Fraud Detection Service for payment transactions
 * Uses a combination of rules and patterns to identify potentially fraudulent payments
 */
class FraudDetectionService {
  constructor() {
    // Configurable risk thresholds
    this.riskThresholds = {
      low: 0.3,     // Low risk (30%)
      medium: 0.6,  // Medium risk (60%)
      high: 0.8     // High risk (80%)
    };
    
    // Risk scoring weights
    this.riskFactorWeights = {
      newAccount: 0.2,          // New account (< 1 week old)
      accountWithoutOrders: 0.1, // Account with no previous orders
      unusualAmount: 0.15,      // Unusual transaction amount
      mismatchedLocation: 0.25, // IP location doesn't match shipping or billing
      unusualBehavior: 0.2,     // Unusual user behavior (time, pattern)
      repeatedAttempts: 0.15,   // Multiple payment attempts in short time
      knownFraudPatterns: 0.3,  // Matches known fraud patterns
      suspiciousDevice: 0.15,   // Suspicious device fingerprint
    };
    
    // Known high-risk locations (example)
    this.highRiskLocations = [
      // Add specific high-risk countries or regions if needed
    ];
    
    // Known suspicious IP ranges (example)
    this.suspiciousIpRanges = [
      // Add specific IP ranges if needed
    ];
    
    // Blacklisted devices or users (would be loaded from database in production)
    this.blacklistedEntities = {
      deviceIds: [],
      ipAddresses: [],
      emailPatterns: []
    };
  }
  
  /**
   * Analyze a payment transaction for fraud risk
   * @param {Object} transaction - Transaction details
   * @param {Object} user - User making the payment
   * @param {Object} context - Request context (IP, device, etc.)
   * @returns {Object} Risk assessment with score and factors
   */
  async analyzeTransaction(transaction, user, context) {
    try {
      // Basic validation
      if (!transaction || !user || !context) {
        throw new Error('Missing required parameters for fraud analysis');
      }
      
      // Track metrics for this analysis
      const startTime = Date.now();
      
      // Initialize risk score calculation
      let riskScore = 0;
      const riskFactors = [];
      
      // 1. Check for blacklisted entities (immediate high risk)
      const blacklistCheck = this.checkBlacklists(user, context);
      if (blacklistCheck.isBlacklisted) {
        return {
          isHighRisk: true,
          riskScore: 1.0, // Maximum risk
          riskLevel: 'critical',
          riskFactors: [blacklistCheck.reason],
          action: 'block',
          requiresManualReview: true
        };
      }
      
      // 2. Check account age
      const accountAgeRisk = this.checkAccountAge(user);
      if (accountAgeRisk.isRisky) {
        riskScore += this.riskFactorWeights.newAccount * accountAgeRisk.riskFactor;
        riskFactors.push(accountAgeRisk.reason);
      }
      
      // 3. Check order history
      const orderHistoryRisk = this.checkOrderHistory(user);
      if (orderHistoryRisk.isRisky) {
        riskScore += this.riskFactorWeights.accountWithoutOrders * orderHistoryRisk.riskFactor;
        riskFactors.push(orderHistoryRisk.reason);
      }
      
      // 4. Check transaction amount
      const amountRisk = this.checkTransactionAmount(transaction, user);
      if (amountRisk.isRisky) {
        riskScore += this.riskFactorWeights.unusualAmount * amountRisk.riskFactor;
        riskFactors.push(amountRisk.reason);
      }
      
      // 5. Check location mismatch
      const locationRisk = this.checkLocationMismatch(transaction, context);
      if (locationRisk.isRisky) {
        riskScore += this.riskFactorWeights.mismatchedLocation * locationRisk.riskFactor;
        riskFactors.push(locationRisk.reason);
      }
      
      // 6. Check unusual behavior
      const behaviorRisk = await this.checkUnusualBehavior(user, context);
      if (behaviorRisk.isRisky) {
        riskScore += this.riskFactorWeights.unusualBehavior * behaviorRisk.riskFactor;
        riskFactors.push(behaviorRisk.reason);
      }
      
      // 7. Check repeated payment attempts
      const repeatedAttemptsRisk = await this.checkRepeatedAttempts(user, transaction);
      if (repeatedAttemptsRisk.isRisky) {
        riskScore += this.riskFactorWeights.repeatedAttempts * repeatedAttemptsRisk.riskFactor;
        riskFactors.push(repeatedAttemptsRisk.reason);
      }
      
      // 8. Check known fraud patterns
      const fraudPatternRisk = this.checkKnownFraudPatterns(transaction, user, context);
      if (fraudPatternRisk.isRisky) {
        riskScore += this.riskFactorWeights.knownFraudPatterns * fraudPatternRisk.riskFactor;
        riskFactors.push(fraudPatternRisk.reason);
      }
      
      // 9. Check device fingerprint
      const deviceRisk = this.checkDeviceFingerprint(context);
      if (deviceRisk.isRisky) {
        riskScore += this.riskFactorWeights.suspiciousDevice * deviceRisk.riskFactor;
        riskFactors.push(deviceRisk.reason);
      }
      
      // Determine risk level and recommended action
      let riskLevel, action, requiresManualReview;
      
      if (riskScore >= this.riskThresholds.high) {
        riskLevel = 'high';
        action = 'block';
        requiresManualReview = true;
      } else if (riskScore >= this.riskThresholds.medium) {
        riskLevel = 'medium';
        action = 'challenge';
        requiresManualReview = riskScore > 0.7; // Only higher medium risk requires review
      } else if (riskScore >= this.riskThresholds.low) {
        riskLevel = 'low';
        action = 'monitor';
        requiresManualReview = false;
      } else {
        riskLevel = 'minimal';
        action = 'allow';
        requiresManualReview = false;
      }
      
      // Record metrics for this analysis
      const analysisTime = Date.now() - startTime;
      appInsights.trackMetric('FraudAnalysisTime', analysisTime, {
        riskLevel,
        transactionAmount: transaction.amount,
        gateway: transaction.gateway
      });
      
      // Track high risk transactions
      if (riskLevel === 'high' || riskLevel === 'medium') {
        appInsights.trackEvent('HighRiskTransaction', {
          userId: user.id,
          transactionId: transaction.id,
          amount: transaction.amount,
          riskScore,
          riskLevel,
          riskFactors: JSON.stringify(riskFactors)
        });
      }
      
      // Return detailed assessment
      return {
        isHighRisk: riskLevel === 'high',
        riskScore: parseFloat(riskScore.toFixed(2)),
        riskLevel,
        riskFactors,
        action,
        requiresManualReview,
        analysisTime
      };
      
    } catch (error) {
      console.error('Error in fraud detection:', error);
      appInsights.trackException(error, { component: 'FraudDetection' });
      
      // Fail safe - return medium risk for error cases
      return {
        isHighRisk: false,
        riskScore: 0.5,
        riskLevel: 'medium',
        riskFactors: ['Error in fraud analysis'],
        action: 'challenge',
        requiresManualReview: true,
        error: error.message
      };
    }
  }
  
  /**
   * Check if any of the entities are blacklisted
   * @param {Object} user - User data
   * @param {Object} context - Request context
   * @returns {Object} Blacklist check result
   */
  checkBlacklists(user, context) {
    // Check IP address
    if (context.ipAddress && this.blacklistedEntities.ipAddresses.includes(context.ipAddress)) {
      return {
        isBlacklisted: true,
        reason: 'IP address is blacklisted'
      };
    }
    
    // Check device ID
    if (context.deviceId && this.blacklistedEntities.deviceIds.includes(context.deviceId)) {
      return {
        isBlacklisted: true,
        reason: 'Device is blacklisted'
      };
    }
    
    // Check email patterns
    if (user.email) {
      for (const pattern of this.blacklistedEntities.emailPatterns) {
        if (user.email.match(new RegExp(pattern, 'i'))) {
          return {
            isBlacklisted: true,
            reason: 'Email matches blacklisted pattern'
          };
        }
      }
    }
    
    return {
      isBlacklisted: false
    };
  }
  
  /**
   * Check if the user account is new/recently created
   * @param {Object} user - User data
   * @returns {Object} Risk assessment
   */
  checkAccountAge(user) {
    // Verify we have creation date
    if (!user.createdAt) {
      return { isRisky: false };
    }
    
    const accountAgeInDays = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    
    if (accountAgeInDays < 1) {
      return {
        isRisky: true,
        riskFactor: 1.0, // Highest risk for same-day accounts
        reason: 'Account created today'
      };
    } else if (accountAgeInDays < 7) {
      return {
        isRisky: true,
        riskFactor: 0.7, // High risk for accounts less than a week old
        reason: 'Account less than a week old'
      };
    } else if (accountAgeInDays < 30) {
      return {
        isRisky: true,
        riskFactor: 0.3, // Lower risk for accounts less than a month old
        reason: 'Account less than a month old'
      };
    }
    
    return { isRisky: false };
  }
  
  /**
   * Check user's order history
   * @param {Object} user - User data
   * @returns {Object} Risk assessment
   */
  checkOrderHistory(user) {
    // No order count data available
    if (user.orderCount === undefined) {
      return { isRisky: false };
    }
    
    if (user.orderCount === 0) {
      return {
        isRisky: true,
        riskFactor: 0.8,
        reason: 'First-time buyer'
      };
    } else if (user.orderCount < 3) {
      return {
        isRisky: true,
        riskFactor: 0.3,
        reason: 'Few previous orders'
      };
    }
    
    return { isRisky: false };
  }
  
  /**
   * Check for unusual transaction amount
   * @param {Object} transaction - Transaction data
   * @param {Object} user - User data 
   * @returns {Object} Risk assessment
   */
  checkTransactionAmount(transaction, user) {
    // No amount or user history available
    if (!transaction.amount || !user.averageOrderAmount) {
      return { isRisky: false };
    }
    
    // If this is significantly higher than user's average order
    if (user.averageOrderAmount > 0 && transaction.amount > user.averageOrderAmount * 3) {
      return {
        isRisky: true,
        riskFactor: 0.6,
        reason: 'Transaction amount significantly higher than usual'
      };
    }
    
    // If this is a high value transaction
    if (transaction.amount > 5000) {
      return {
        isRisky: true,
        riskFactor: 0.5,
        reason: 'High value transaction'
      };
    }
    
    return { isRisky: false };
  }
  
  /**
   * Check for location mismatches between IP, shipping and billing
   * @param {Object} transaction - Transaction data
   * @param {Object} context - Request context
   * @returns {Object} Risk assessment
   */
  checkLocationMismatch(transaction, context) {
    // No location data available
    if (!context.ipLocation || !transaction.billingAddress || !transaction.shippingAddress) {
      return { isRisky: false };
    }
    
    // Check if IP country matches billing country
    if (context.ipLocation.country !== transaction.billingAddress.country) {
      return {
        isRisky: true,
        riskFactor: 0.8,
        reason: 'IP location does not match billing address country'
      };
    }
    
    // Check if billing country matches shipping country
    if (transaction.billingAddress.country !== transaction.shippingAddress.country) {
      return {
        isRisky: true,
        riskFactor: 0.7,
        reason: 'Billing address country does not match shipping address country'
      };
    }
    
    // Check if IP location is in high-risk locations
    if (this.highRiskLocations.includes(context.ipLocation.country)) {
      return {
        isRisky: true,
        riskFactor: 0.6,
        reason: 'Transaction from high-risk location'
      };
    }
    
    return { isRisky: false };
  }
  
  /**
   * Check for unusual user behavior
   * @param {Object} user - User data
   * @param {Object} context - Request context
   * @returns {Promise<Object>} Risk assessment
   */
  async checkUnusualBehavior(user, context) {
    // In a real system, this would check for behavior anomalies
    // Such as unusual time of day, rapid navigation, etc.
    
    // For this example, we'll use a simple time-of-day check
    const hour = new Date().getHours();
    
    // Late night transactions can be higher risk
    if (hour >= 1 && hour <= 5) {
      return {
        isRisky: true,
        riskFactor: 0.4,
        reason: 'Transaction during unusual hours (1AM-5AM)'
      };
    }
    
    return { isRisky: false };
  }
  
  /**
   * Check for repeated payment attempts
   * @param {Object} user - User data
   * @param {Object} transaction - Transaction data
   * @returns {Promise<Object>} Risk assessment
   */
  async checkRepeatedAttempts(user, transaction) {
    // In a production system, this would check payment attempt history
    // For this example, we'll use the retryCount from the transaction if available
    
    if (transaction.retryCount && transaction.retryCount > 2) {
      return {
        isRisky: true,
        riskFactor: 0.6 + (transaction.retryCount - 2) * 0.1, // Increases with more retries
        reason: `Multiple payment attempts (${transaction.retryCount} tries)`
      };
    }
    
    return { isRisky: false };
  }
  
  /**
   * Check for known fraud patterns
   * @param {Object} transaction - Transaction data
   * @param {Object} user - User data
   * @param {Object} context - Request context
   * @returns {Object} Risk assessment
   */
  checkKnownFraudPatterns(transaction, user, context) {
    // Example checks for fraud patterns:
    
    // 1. Mismatched names
    if (transaction.cardDetails && 
        user.fullName && 
        transaction.cardDetails.nameOnCard && 
        !this.compareNames(user.fullName, transaction.cardDetails.nameOnCard)) {
      return {
        isRisky: true,
        riskFactor: 0.9,
        reason: 'Cardholder name does not match account name'
      };
    }
    
    // 2. Suspicious email domain
    const suspiciousDomains = ['tempmail.com', 'throwaway.com', 'mailinator.com'];
    if (user.email) {
      const domain = user.email.split('@')[1];
      if (domain && suspiciousDomains.includes(domain.toLowerCase())) {
        return {
          isRisky: true,
          riskFactor: 0.7,
          reason: 'Email from disposable email provider'
        };
      }
    }
    
    // 3. Round amount (often used in card testing)
    if (transaction.amount && transaction.amount % 100 === 0 && transaction.amount > 500) {
      return {
        isRisky: true,
        riskFactor: 0.4,
        reason: 'Even/round transaction amount'
      };
    }
    
    return { isRisky: false };
  }
  
  /**
   * Check device fingerprint for suspicious patterns
   * @param {Object} context - Request context with device info
   * @returns {Object} Risk assessment
   */
  checkDeviceFingerprint(context) {
    // In a real system, this would use device fingerprinting
    // For this example, we'll use any available browser/device info
    
    // Check for missing or spoofed user agent
    if (!context.userAgent || context.userAgent.length < 10) {
      return {
        isRisky: true,
        riskFactor: 0.7,
        reason: 'Missing or suspicious user agent'
      };
    }
    
    // Check for signs of automation/headless browsers
    const suspiciousUAPatterns = [
      'headless',
      'phantomjs',
      'selenium',
      'webdriver',
      'puppet',
      'automation'
    ];
    
    for (const pattern of suspiciousUAPatterns) {
      if (context.userAgent.toLowerCase().includes(pattern)) {
        return {
          isRisky: true,
          riskFactor: 0.9,
          reason: 'Automated browser/bot detected'
        };
      }
    }
    
    return { isRisky: false };
  }
  
  /**
   * Compare names allowing for common variations
   * @param {string} name1 - First name to compare
   * @param {string} name2 - Second name to compare
   * @returns {boolean} Whether names match
   */
  compareNames(name1, name2) {
    if (!name1 || !name2) return false;
    
    // Normalize names: lowercase, remove extra spaces, remove punctuation
    const normalize = (name) => {
      return name.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .trim();
    };
    
    const norm1 = normalize(name1);
    const norm2 = normalize(name2);
    
    // Exact match after normalization
    if (norm1 === norm2) return true;
    
    // Check initials with last name
    // e.g. "John Smith" vs "J Smith"
    const parts1 = norm1.split(' ');
    const parts2 = norm2.split(' ');
    
    if (parts1.length > 1 && parts2.length > 1) {
      // Check if last names match and first initial matches
      if (parts1[parts1.length - 1] === parts2[parts2.length - 1]) {
        const firstInitial1 = parts1[0].charAt(0);
        const firstInitial2 = parts2[0].charAt(0);
        if (firstInitial1 === firstInitial2) return true;
      }
    }
    
    return false;
  }
  
  /**
   * Update blacklists for known fraudulent entities
   * @param {Object} entity - Entity to blacklist
   * @returns {Promise<boolean>} Success status
   */
  async addToBlacklist(entity) {
    try {
      if (entity.ipAddress) {
        this.blacklistedEntities.ipAddresses.push(entity.ipAddress);
      }
      
      if (entity.deviceId) {
        this.blacklistedEntities.deviceIds.push(entity.deviceId);
      }
      
      if (entity.emailPattern) {
        this.blacklistedEntities.emailPatterns.push(entity.emailPattern);
      }
      
      // In a real system, this would persist to a database
      
      return true;
    } catch (error) {
      console.error('Error updating blacklist:', error);
      appInsights.trackException(error, { component: 'FraudDetection', operation: 'addToBlacklist' });
      return false;
    }
  }
}

module.exports = new FraudDetectionService(); 