const appInsights = require('@microsoft/applicationinsights-node');
const dotenv = require('dotenv');

// Load environment variables if not already loaded
if (!process.env.AZURE_APP_INSIGHTS_INSTRUMENTATION_KEY) {
  dotenv.config();
}

class AppInsightsService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.initialize();
  }

  initialize() {
    try {
      const instrumentationKey = process.env.AZURE_APP_INSIGHTS_INSTRUMENTATION_KEY;
      const connectionString = process.env.AZURE_APP_INSIGHTS_CONNECTION_STRING;
      
      if (!instrumentationKey && !connectionString) {
        console.warn('Azure Application Insights configuration missing. Telemetry will not be collected.');
        return;
      }

      // Initialize Application Insights
      this.client = new appInsights.TelemetryClient(instrumentationKey);
      
      // Set up common properties for all telemetry
      this.client.commonProperties = {
        environment: process.env.NODE_ENV || 'development',
        serviceName: 'sewing-platform-backend'
      };

      this.isInitialized = true;
      console.log('Azure Application Insights initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Azure Application Insights:', error);
    }
  }

  /**
   * Track a custom event
   * @param {string} name - Name of the event
   * @param {Object} properties - Custom properties for this event
   * @param {Object} measurements - Numeric measurements for this event
   */
  trackEvent(name, properties = {}, measurements = {}) {
    if (!this.isInitialized) return;
    this.client.trackEvent({ name, properties, measurements });
  }

  /**
   * Track an API request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Object} properties - Additional properties to log
   */
  trackRequest(req, res, properties = {}) {
    if (!this.isInitialized) return;
    
    const duration = res.locals.startTime ? new Date() - res.locals.startTime : 0;
    
    this.client.trackRequest({
      name: `${req.method} ${req.path}`,
      url: req.url,
      duration: duration,
      resultCode: res.statusCode,
      success: res.statusCode < 400,
      properties: {
        ...properties,
        userId: req.user ? req.user.id : 'anonymous',
        userRole: req.user ? req.user.role : 'anonymous',
        query: JSON.stringify(req.query),
        httpMethod: req.method,
        userAgent: req.get('user-agent')
      }
    });
  }

  /**
   * Track an exception
   * @param {Error} error - The error object
   * @param {Object} properties - Additional properties to log with the exception
   */
  trackException(error, properties = {}) {
    if (!this.isInitialized) return;
    this.client.trackException({ exception: error, properties });
  }

  /**
   * Track a dependency call (e.g., database, external API)
   * @param {string} name - Name of the dependency 
   * @param {string} data - Command/query executed against the dependency
   * @param {number} duration - Duration of the dependency call in ms
   * @param {boolean} success - Whether the call was successful
   * @param {Object} properties - Additional properties 
   */
  trackDependency(name, data, duration, success, properties = {}) {
    if (!this.isInitialized) return;
    this.client.trackDependency({
      name,
      data,
      duration,
      success,
      resultCode: success ? 0 : 1,
      dependencyTypeName: 'HTTP',
      properties
    });
  }

  /**
   * Track a custom metric
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   * @param {Object} properties - Additional properties
   */
  trackMetric(name, value, properties = {}) {
    if (!this.isInitialized) return;
    this.client.trackMetric({ name, value, properties });
  }

  /**
   * Flush all telemetry immediately
   * useful before application exit
   */
  flush() {
    if (!this.isInitialized) return;
    this.client.flush();
  }
}

module.exports = new AppInsightsService(); 