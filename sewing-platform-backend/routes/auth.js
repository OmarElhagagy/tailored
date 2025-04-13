const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { check, validationResult } = require('express-validator');
const user = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail'); // will make the folder utils 


// @route POST /api/auth/register
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

    try {
      // check if user exists
      if (email) {
        const existingUser = await user.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ errors: [{ message: 'User already exists'}] });
        }
      }

      //validate role specific details
      if (role === 'buyer' && !name) {
        return res.status(400).json({ errors: [{ message: 'Name field required'}] });
      }

      if (role === 'seller' && !businessName) {
        return res.status(400).json({errors: [{ message: 'Business name field required'}]});
      }

      const user = new user ({
        name,
        email,
        role,
        businessName,
        businessAddress,
        phone,
        password
      });

      await user.save();

      // create and return JWT
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {expiresIn : '24h'},
        (err, token) => {
          if (err) throw err;
          res.json({token});
        }
      );
    }catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  });

