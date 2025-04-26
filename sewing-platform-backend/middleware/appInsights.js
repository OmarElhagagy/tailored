const appInsights = require('../utils/appInsights');

/**
 * Middleware to add request tracking with Azure Application Insights
 * This middleware should be registered early in the pipeline
 */
const trackRequest = (req, res, next) => {
  // Add a timestamp to track request duration
  req.startTime = Date.now();
  
  // Track completion of the request
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - req.startTime;
    const success = res.statusCode < 400;
    
    appInsights.trackEvent('HttpRequest', {
      url: req.url,
      method: req.method,
      statusCode: res.statusCode,
      duration,
      success
    });
    
    originalEnd.apply(res, args);
  };
  
  next();
};

/**
 * Middleware for error tracking with Azure Application Insights
 * This middleware should be registered after all routes and before the generic error handler
 */
const trackError = (err, req, res, next) => {
  appInsights.trackException(err, {
    url: req.url,
    method: req.method,
    userId: req.user ? req.user.id : 'anonymous'
  });
  
  next(err);
};

module.exports = {
  trackRequest,
  trackError
}; 