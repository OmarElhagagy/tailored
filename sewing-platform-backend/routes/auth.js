const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { check, validationResult } = require('express-validator');
const user = require('../models/User');
const auth = require('../middleware/auth');
const sendEmai = require('../utils/sendEmail'); // will make the folder utils 


// @route /api/auth/register
// @desc register user
// access Public
router.post('/register', [
  check('role', 'Role is required').not().isEmpty(),
  check('Password', 'Password must at least be 8 characters').isLength({ min: 8 }),
  check('email', 'Please include a valid email').optional().isEmail(),
  check('phone', 'Phone number is required')
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone, businessName, businessAddress } = req.body;
  }
)
