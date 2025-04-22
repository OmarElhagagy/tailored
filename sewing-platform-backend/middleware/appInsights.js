const appInsights = require('../utils/appInsights');

/**
 * Middleware to add request tracking with Azure Application Insights
 * This middleware should be registered early in the pipeline
 */
const trackRequest = (req, res, next) => {
  // Save start time for duration calculation
  res.locals.startTime = new Date();
  
  // Track request completion
  const originalEnd = res.end;
  
  res.end = function() {
    originalEnd.apply(res, arguments);
    
    // Record the API request after completion
    appInsights.trackRequest(req, res);
  };
  
  next();
};

/**
 * Middleware for error tracking with Azure Application Insights
 * This middleware should be registered after all routes and before the generic error handler
 */
const trackError = (err, req, res, next) => {
  // Track the exception
  appInsights.trackException(err, {
    url: req.url,
    method: req.method,
    query: JSON.stringify(req.query),
    params: JSON.stringify(req.params),
    userId: req.user ? req.user.id : 'anonymous',
    userRole: req.user ? req.user.role : 'anonymous'
  });
  
  // Continue to the next error handler
  next(err);
};

module.exports = {
  trackRequest,
  trackError
}; 