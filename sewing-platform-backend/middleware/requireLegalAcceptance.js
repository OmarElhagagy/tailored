const LegalDocument = require('../models/LegalDocument');
const LegalAcceptance = require('../models/LegalAcceptance');

/**
 * Middleware to check if the user has accepted the required legal documents
 * @param {Array} documentTypes - Array of document types to check acceptance for
 * @returns {Function} Express middleware
 */
const requireLegalAcceptance = (documentTypes) => {
  return async (req, res, next) => {
    try {
      // Skip check for admins as they might need to bypass for administrative purposes
      if (req.user && req.user.role === 'admin') {
        return next();
      }
      
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          errors: [{ message: 'Authentication required' }],
          requireAuth: true
        });
      }
      
      // Default to checking terms of service if no specific types provided
      const typesToCheck = documentTypes && documentTypes.length 
        ? documentTypes 
        : ['terms_of_service'];
      
      // Get all active documents of the specified types that require acceptance
      const requiredDocuments = await LegalDocument.find({ 
        type: { $in: typesToCheck },
        isActive: true,
        mustAcceptVersion: true
      }).select('_id type version title');
      
      // Check each document for acceptance
      const notAccepted = [];
      
      for (const doc of requiredDocuments) {
        const hasAccepted = await LegalAcceptance.hasAcceptedLatest(req.user.id, doc.type);
        
        if (!hasAccepted) {
          notAccepted.push({
            documentId: doc._id,
            documentType: doc.type,
            documentTitle: doc.title,
            documentVersion: doc.version
          });
        }
      }
      
      // If there are documents that haven't been accepted, return error
      if (notAccepted.length > 0) {
        return res.status(403).json({
          errors: [{ message: 'Legal agreement acceptance required' }],
          requireAcceptance: true,
          documents: notAccepted
        });
      }
      
      // All required documents have been accepted
      next();
    } catch (error) {
      console.error('Error checking legal acceptance:', error);
      res.status(500).json({ errors: [{ message: 'Server error' }] });
    }
  };
};

module.exports = requireLegalAcceptance; 