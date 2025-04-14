const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail'); // will make the folder utils 


// @route POST /api/auth/register
// @desc register user
// access Public
router.post('/register', [
  check('role', 'Role is required').not().isEmpty(),
  check('password', 'Password must at least be 8 characters').isLength({ min: 8 }),
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
        const existingUser = await User.findOne({ email });
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

      const newUser = new User ({
        name,
        email,
        role,
        businessName,
        businessAddress,
        phone,
        password
      });

      await newUser.save();

      // create and return JWT
      const payload = {
        user: {
          id: newUser.id,
          role: newUser.role
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

// @route /api/auth/login
// @desc  Authenticate user and get token
// @access  Public
router.post('/login', [
  check('password', 'Password is required').exists(),
  check('phone', 'phone number is required').optional(),
  check('email', 'email is required').optional()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {password, email, phone} = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: 'Either email or phone is required' });
    }

    try {
      let user;
      if (email) {
        user = await User.findOne({ email });
      } else {
        user = await User.findOne({ phone });
      }

      if (!user) {
        return res.status(400).json({ errors: [{ message: 'Invalid credentials' }] });
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // update last login
      user.lastLogin = Date.now();
      await user.save();

      const payLoad  = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payLoad,
        process.env.JWT_SECRET,
        { expiresIn: '24h' },
        (error, token) => {
          if (error) throw error;
          res.json({
            token,
            role: user.role,
            userId: user.id
          })
        }
      );
    } catch(error) {
      console.error(err.message)
      res.status(500).send('Server error');
    }
  });

// @route /api/auth/forgot-password
// @desc  Generate password reset token
// access Public
router.post('/forgot-password', [
  check('email', 'Please include a valid email').isEmail()
], async (req, res) => {
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ errors: [{ message: 'User not found' }] });
      }

      // generate reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

      //token expires in 1 hour
      user.resetPasswordExpires = Date.now() + 3600000;

      await user.save();

      // create reset URL
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

      const message = `you requested a password reset. Please click on the link to reset your password: \n\n ${resetUrl}`;

      try {
        await sendEmail ({
          email: user.email,
          subject: 'Password reset',
          message
        });
      } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(500).json({ errors: [{message: 'Email could not be sent'}] });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    } 
  });

