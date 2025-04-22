const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const BusinessCredential = require('../models/BusinessCredential');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/business-credentials';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept pdf, jpg, jpeg, png files only
  const allowedFileTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error('Only PDF, JPEG, JPG and PNG files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  }
});

// @route POST /api/business-credentials
// @desc Upload business credential document
// @access Private (Seller only)
router.post('/', [
  auth,
  checkRole('seller'),
  upload.single('documentFile'),
  [
    check('documentType', 'Document type is required').not().isEmpty(),
    check('documentNumber', 'Document number is required').not().isEmpty(),
    check('issuingAuthority', 'Issuing authority is required').not().isEmpty(),
    check('issueDate', 'Issue date is required').isISO8601().toDate()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If validation fails, delete the uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ errors: [{ message: 'Document file is required' }] });
    }

    // Create new business credential document
    const newCredential = new BusinessCredential({
      sellerId: req.user.id,
      documentType: req.body.documentType,
      documentNumber: req.body.documentNumber,
      issuingAuthority: req.body.issuingAuthority,
      issueDate: req.body.issueDate,
      expiryDate: req.body.expiryDate || null,
      documentFile: req.file.path,
      verificationStatus: 'pending'
    });

    await newCredential.save();

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully and pending verification',
      data: {
        credentialId: newCredential._id,
        verificationStatus: newCredential.verificationStatus
      }
    });
  } catch (error) {
    // Delete the file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading credential:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/business-credentials
// @desc Get all business credentials for the authenticated seller
// @access Private (Seller only)
router.get('/', [
  auth,
  checkRole('seller')
], async (req, res) => {
  try {
    const credentials = await BusinessCredential.find({ sellerId: req.user.id });
    
    if (!credentials.length) {
      return res.status(404).json({ message: 'No credentials found' });
    }
    
    res.json(credentials);
  } catch (error) {
    console.error('Error fetching credentials:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/business-credentials/:id
// @desc Get specific business credential 
// @access Private (Owner or Admin)
router.get('/:id', [
  auth
], async (req, res) => {
  try {
    const credential = await BusinessCredential.findById(req.params.id);
    
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    
    // Verify user is owner or admin
    if (
      credential.sellerId.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(credential);
  } catch (error) {
    console.error('Error fetching credential:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route PUT /api/business-credentials/:id/verify
// @desc Verify or reject a business credential
// @access Private (Admin only)
router.put('/:id/verify', [
  auth,
  checkRole('admin'),
  [
    check('verificationStatus', 'Verification status must be verified or rejected')
      .isIn(['verified', 'rejected']),
    check('verificationNote', 'Verification note is required when rejecting')
      .if((value, { req }) => req.body.verificationStatus === 'rejected')
      .not()
      .isEmpty()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const credential = await BusinessCredential.findById(req.params.id);
    
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    
    credential.verificationStatus = req.body.verificationStatus;
    credential.verificationNote = req.body.verificationNote || '';
    credential.verificationDate = Date.now();
    
    await credential.save();
    
    res.json({
      success: true,
      message: `Credential ${req.body.verificationStatus}`,
      data: credential
    });
  } catch (error) {
    console.error('Error verifying credential:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route DELETE /api/business-credentials/:id
// @desc Delete a business credential
// @access Private (Owner or Admin)
router.delete('/:id', [
  auth
], async (req, res) => {
  try {
    const credential = await BusinessCredential.findById(req.params.id);
    
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    
    // Verify user is owner or admin
    if (
      credential.sellerId.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Delete file from storage
    if (credential.documentFile && fs.existsSync(credential.documentFile)) {
      fs.unlinkSync(credential.documentFile);
    }
    
    await credential.remove();
    
    res.json({ message: 'Credential deleted successfully' });
  } catch (error) {
    console.error('Error deleting credential:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

module.exports = router; 