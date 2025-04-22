const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const LegalDocument = require('../models/LegalDocument');
const LegalAcceptance = require('../models/LegalAcceptance');

// @route GET /api/legal/documents
// @desc Get all active legal documents
// @access Public
router.get('/documents', async (req, res) => {
  try {
    const documents = await LegalDocument.find({ isActive: true })
      .select('title type version effectiveDate summary');
    
    res.json(documents);
  } catch (error) {
    console.error('Error fetching legal documents:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/legal/documents/:type
// @desc Get the latest active document of specified type
// @access Public
router.get('/documents/:type', async (req, res) => {
  try {
    const document = await LegalDocument.getActiveDocument(req.params.type);
    
    if (!document) {
      return res.status(404).json({ errors: [{ message: 'Document not found' }] });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error fetching legal document:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route POST /api/legal/documents
// @desc Create a new legal document
// @access Private (Admin only)
router.post('/documents', [
  auth,
  checkRole('admin'),
  [
    check('title', 'Title is required').not().isEmpty(),
    check('type', 'Type is required').isIn([
      'terms_of_service', 'privacy_policy', 'seller_agreement', 
      'return_policy', 'shipping_policy', 'other'
    ]),
    check('content', 'Content is required').not().isEmpty(),
    check('version', 'Version is required').not().isEmpty(),
    check('effectiveDate', 'Effective date is required').isISO8601().toDate()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { 
      title, type, content, version, effectiveDate, 
      summary, mustAcceptVersion, attachments 
    } = req.body;
    
    // Check if this version already exists
    const existingVersion = await LegalDocument.findOne({ type, version });
    if (existingVersion) {
      return res.status(400).json({ 
        errors: [{ message: `Version ${version} of ${type} already exists` }] 
      });
    }
    
    // If this is going to be active, deactivate old versions
    if (req.body.isActive !== false) {
      await LegalDocument.deactivateOldVersions(type);
    }
    
    const newDocument = new LegalDocument({
      title,
      type,
      content,
      version,
      effectiveDate: effectiveDate || Date.now(),
      isActive: req.body.isActive !== false,
      updatedBy: req.user.id,
      summary,
      mustAcceptVersion: mustAcceptVersion || false,
      attachments: attachments || []
    });
    
    await newDocument.save();
    
    res.status(201).json({
      success: true,
      message: 'Legal document created successfully',
      data: newDocument
    });
  } catch (error) {
    console.error('Error creating legal document:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route PUT /api/legal/documents/:id
// @desc Update a legal document
// @access Private (Admin only)
router.put('/documents/:id', [
  auth,
  checkRole('admin')
], async (req, res) => {
  try {
    const document = await LegalDocument.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ errors: [{ message: 'Document not found' }] });
    }
    
    // Fields that can be updated
    const allowedUpdates = [
      'title', 'content', 'isActive', 'summary', 
      'mustAcceptVersion', 'attachments'
    ];
    
    // Update only allowed fields
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        document[field] = req.body[field];
      }
    }
    
    // If activating this document, deactivate other active ones of the same type
    if (req.body.isActive === true && !document.isActive) {
      await LegalDocument.deactivateOldVersions(document.type);
      document.isActive = true;
    }
    
    document.lastUpdated = Date.now();
    document.updatedBy = req.user.id;
    
    await document.save();
    
    res.json({
      success: true,
      message: 'Legal document updated successfully',
      data: document
    });
  } catch (error) {
    console.error('Error updating legal document:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route POST /api/legal/accept
// @desc Record user acceptance of a legal document
// @access Private
router.post('/accept', [
  auth,
  [
    check('documentId', 'Document ID is required').isMongoId(),
    check('documentType', 'Document type is required').isIn([
      'terms_of_service', 'privacy_policy', 'seller_agreement', 
      'return_policy', 'shipping_policy', 'other'
    ]),
    check('documentVersion', 'Document version is required').not().isEmpty(),
    check('acceptanceMethod', 'Acceptance method is required').isIn([
      'registration', 'login', 'order_placement', 'explicit_acceptance', 'other'
    ])
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Verify the document exists and matches type and version
    const document = await LegalDocument.findById(req.body.documentId);
    
    if (!document) {
      return res.status(404).json({ errors: [{ message: 'Document not found' }] });
    }
    
    if (document.type !== req.body.documentType || document.version !== req.body.documentVersion) {
      return res.status(400).json({ 
        errors: [{ message: 'Document type or version mismatch' }] 
      });
    }
    
    // Record the acceptance
    const acceptance = await LegalAcceptance.recordAcceptance({
      userId: req.user.id,
      documentId: req.body.documentId,
      documentType: req.body.documentType,
      documentVersion: req.body.documentVersion,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      acceptanceMethod: req.body.acceptanceMethod
    });
    
    res.status(201).json({
      success: true,
      message: 'Legal document acceptance recorded',
      data: {
        acceptanceId: acceptance._id,
        documentType: acceptance.documentType,
        documentVersion: acceptance.documentVersion,
        acceptanceDate: acceptance.acceptanceDate
      }
    });
  } catch (error) {
    console.error('Error recording legal acceptance:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/legal/acceptance-status
// @desc Check user's acceptance status for legal documents
// @access Private
router.get('/acceptance-status', [
  auth
], async (req, res) => {
  try {
    // Get all active documents
    const activeDocuments = await LegalDocument.find({ isActive: true })
      .select('title type version effectiveDate mustAcceptVersion');
    
    // Check acceptance status for each document
    const acceptanceStatus = await Promise.all(activeDocuments.map(async (doc) => {
      const accepted = await LegalAcceptance.hasAcceptedLatest(req.user.id, doc.type);
      
      return {
        documentId: doc._id,
        documentType: doc.type,
        documentTitle: doc.title,
        documentVersion: doc.version,
        acceptanceRequired: doc.mustAcceptVersion,
        acceptanceStatus: accepted ? 'accepted' : 'not_accepted'
      };
    }));
    
    res.json(acceptanceStatus);
  } catch (error) {
    console.error('Error checking acceptance status:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

module.exports = router; 