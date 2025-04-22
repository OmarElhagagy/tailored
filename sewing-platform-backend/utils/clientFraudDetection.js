/**
 * Client-side fraud detection utilities
 * These functions help collect browser/client data for server-side fraud analysis
 */

/**
 * Collects device and browser information for fraud detection
 * @returns {Object} Device fingerprinting data
 */
const collectDeviceData = () => {
  try {
    const fingerprint = {
      // Browser information
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: Array.from(navigator.languages || []),
      platform: navigator.platform,
      doNotTrack: navigator.doNotTrack,
      cookieEnabled: navigator.cookieEnabled,

      // Screen properties
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      screenDepth: window.screen.colorDepth,
      screenAvailWidth: window.screen.availWidth,
      screenAvailHeight: window.screen.availHeight,

      // Time zone information
      timezoneOffset: new Date().getTimezoneOffset(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      // Browser capabilities
      touchPoints: navigator.maxTouchPoints || 0,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      
      // Connection information (if available)
      connectionType: navigator.connection ? navigator.connection.effectiveType : null,
      
      // Browser plugins (count only for privacy)
      pluginCount: navigator.plugins ? navigator.plugins.length : 0,
      
      // Canvas fingerprinting (hash only)
      canvasHash: getCanvasFingerprint()
    };

    return fingerprint;
  } catch (error) {
    console.error('Error collecting device data:', error);
    return { error: 'Failed to collect device data' };
  }
};

/**
 * Creates a canvas fingerprint hash
 * @returns {string} Canvas fingerprint hash
 */
const getCanvasFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Size the canvas
    canvas.width = 200;
    canvas.height = 50;
    
    // Draw text with specific styling
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(10, 10, 100, 30);
    ctx.fillStyle = '#069';
    ctx.fillText('Canvas Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Canvas Fingerprint', 4, 17);
    
    // Get canvas data and create a simple hash
    const dataURL = canvas.toDataURL();
    let hash = 0;
    
    for (let i = 0; i < dataURL.length; i++) {
      hash = ((hash << 5) - hash) + dataURL.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(16);
  } catch (error) {
    console.error('Error creating canvas fingerprint:', error);
    return 'canvas-not-supported';
  }
};

/**
 * Collect user interaction data to detect bots or unusual behavior
 * @returns {Object} Interaction patterns data
 */
const collectInteractionData = () => {
  // In a real implementation, this would track metrics like:
  // - Mouse movement patterns
  // - Typing speed and rhythm 
  // - Form filling behavior
  // - Navigation patterns

  // For this example, we'll return a simpler dataset
  return {
    formCompletionTimeMs: window._formStartTime ? (Date.now() - window._formStartTime) : null,
    copyPasteDetected: window._copyPasteDetected || false,
    totalClicks: window._clickCounter || 0,
    hasScrolled: window._hasScrolled || false,
    tabSwitches: window._tabSwitchCount || 0
  };
};

/**
 * Analyzes transaction input for potentially suspicious patterns
 * @param {Object} formData - The payment form data
 * @returns {Object} Analysis results with risk factors
 */
const analyzeTransactionInput = (formData) => {
  const riskFactors = [];
  
  // Check for suspicious credit card patterns
  if (formData.cardNumber) {
    // Check for test card numbers
    const testCardPatterns = [
      '4111111111111111', // Visa test card
      '5555555555554444', // Mastercard test card
      '4242424242424242'  // Stripe test card
    ];
    
    for (const pattern of testCardPatterns) {
      if (formData.cardNumber.replace(/\s/g, '').includes(pattern)) {
        riskFactors.push('test_card_number_detected');
        break;
      }
    }
    
    // Check for repeated digits (e.g., 4444...)
    const digits = formData.cardNumber.replace(/\s/g, '');
    const repeatedDigitPattern = /(.)\1{5,}/;
    if (repeatedDigitPattern.test(digits)) {
      riskFactors.push('repeated_digits_in_card');
    }
  }
  
  // Check for mismatched names
  if (formData.nameOnCard && formData.billingName &&
      formData.nameOnCard.trim().toLowerCase() !== formData.billingName.trim().toLowerCase()) {
    riskFactors.push('name_mismatch');
  }
  
  // Check for suspicious email domains
  if (formData.email) {
    const suspiciousDomains = ['tempmail.com', 'mailinator.com', 'throwawaymail.com'];
    const emailDomain = formData.email.split('@')[1]?.toLowerCase();
    
    if (emailDomain && suspiciousDomains.includes(emailDomain)) {
      riskFactors.push('disposable_email');
    }
  }
  
  return {
    riskFactors,
    hasRiskFactors: riskFactors.length > 0
  };
};

/**
 * Initializes client-side fraud detection listeners
 */
const initFraudDetectionListeners = () => {
  // Track form start time
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('focusin', () => {
      if (!window._formStartTime) {
        window._formStartTime = Date.now();
      }
    });
  });
  
  // Track copy/paste events
  document.addEventListener('copy', () => { window._copyPasteDetected = true; });
  document.addEventListener('paste', () => { window._copyPasteDetected = true; });
  
  // Track clicks
  window._clickCounter = 0;
  document.addEventListener('click', () => { window._clickCounter++; });
  
  // Track scrolling
  window._hasScrolled = false;
  document.addEventListener('scroll', () => { window._hasScrolled = true; });
  
  // Track tab visibility changes
  window._tabSwitchCount = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      window._tabSwitchCount++;
    }
  });
};

/**
 * Collects all fraud detection data for a transaction
 * @param {Object} formData - The payment form data
 * @returns {Object} Complete fraud detection context
 */
const collectFraudDetectionData = (formData) => {
  return {
    deviceData: collectDeviceData(),
    interactionData: collectInteractionData(),
    inputAnalysis: analyzeTransactionInput(formData),
    timestamp: new Date().toISOString()
  };
};

// Export the functions for use in the frontend
module.exports = {
  collectDeviceData,
  collectInteractionData,
  analyzeTransactionInput,
  initFraudDetectionListeners,
  collectFraudDetectionData
}; 