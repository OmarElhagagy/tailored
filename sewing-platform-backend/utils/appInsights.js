/**
 * Application Insights utility (simplified for local development)
 * 
 * This is a placeholder implementation that won't require the Azure services for local development.
 */

let isInitialized = false;

const init = () => {
  // For local development, we'll just log that it's disabled
  console.log('Application Insights disabled for local development');
  isInitialized = true;
  return true;
};

// Track events
const trackEvent = (name, properties = {}) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`[AppInsights] Event: ${name}`, properties);
  }
};

// Track exceptions
const trackException = (error, properties = {}) => {
  // Always log errors to console
  console.error(`[AppInsights] Exception:`, error);
  if (properties && Object.keys(properties).length > 0) {
    console.error(`[AppInsights] Exception Properties:`, properties);
  }
};

// Track metrics
const trackMetric = (name, value, properties = {}) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`[AppInsights] Metric: ${name} = ${value}`, properties);
  }
};

// Flush telemetry (no-op in local development)
const flush = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('[AppInsights] Flushing telemetry');
  }
};

module.exports = {
  init,
  trackEvent,
  trackException,
  trackMetric,
  flush
}; 