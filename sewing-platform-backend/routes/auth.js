const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail'); // will make the folder utils 
const smsService = require('../utils/smsService');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// Rate limit for login attempts - 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Password complexity regex - min 8 chars, at least one uppercase, one lowercase, one number, one special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// @route POST /api/auth/register
// @desc register user
// access Public
router.post('/register', [
  check('role', 'Role is required').not().isEmpty(),
  check('role', 'Role must be either buyer or seller').isIn(['buyer', 'seller']),
  check('password', 'Password is required with 8 or more characters')
    .isLength({ min: 8 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  check('phone', 'Phone number is required').not().isEmpty(),
  check('phone', 'Invalid phone number format').matches(/^\+?[1-9]\d{9,14}$/),
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, name, business, phone, address } = req.body;

    try {
      // Check if user exists by phone (primary) or email (if provided)
      let userByPhone = await User.findOne({ phone });
      if (userByPhone) {
        return res.status(400).json({ errors: [{ msg: 'User with this phone number already exists' }] });
      }
      
      if (email) {
        let userByEmail = await User.findOne({ email });
        if (userByEmail) {
          return res.status(400).json({ errors: [{ msg: 'User with this email already exists' }] });
        }
      }

      //validate role specific details
      if (role === 'buyer' && !name) {
        return res.status(400).json({ errors: [{ message: 'Name field required' }] });
      }

      if (role === 'seller' && !business) {
        return res.status(400).json({ errors: [{ message: 'Business name field required' }] });
      }

      // Generate phone verification code
      const verificationCode = smsService.generateOTP();
      const verificationExpires = Date.now() + (10 * 60 * 1000); // 10 minutes

      const newUser = new User ({
        name: name || null,
        email: email || null,
        role,
        businessName: business || null,
        businessAddress: address || null,
        phone,
        password,
        // Add verification fields
        phoneVerificationCode: verificationCode,
        phoneVerificationExpires: verificationExpires,
        phoneVerified: false
      });

      await newUser.save();

      // Send verification SMS
      await smsService.sendVerificationSMS(phone, verificationCode);

      // Create and return JWT (with limited claims until verified)
      const payload = {
        user: {
          id: newUser.id,
          role: newUser.role,
          verified: false
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {expiresIn : '12h'}, // Reduced from 24h to 12h for security
        (err, token) => {
          if (err) throw err;
          
          // Set secure cookie with the token
          res.cookie('authToken', token, {
            httpOnly: true, // Prevents JavaScript access
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict', // Prevents CSRF
            maxAge: 12 * 60 * 60 * 1000 // 12 hours
          });
          
          res.json({
            token, 
            role: newUser.role, 
            userId: newUser.id, 
            verified: false, 
            message: 'Verification code sent to your phone'
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  });

// @route POST /api/auth/verify-phone
// @desc Verify phone number with OTP
// @access Private
router.post('/verify-phone', [
  auth(),
  [
    check('verificationCode', 'Verification code is required').not().isEmpty(),
    check('verificationCode', 'Verification code must be numeric').isNumeric()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    
    // Check if already verified
    if (user.phoneVerified) {
      return res.status(400).json({ errors: [{ msg: 'Phone number already verified' }] });
    }
    
    // Check if verification code is valid and not expired
    if (
      user.phoneVerificationCode !== req.body.verificationCode || 
      user.phoneVerificationExpires < Date.now()
    ) {
      // Increment failed attempts
      user.phoneVerificationAttempts += 1;
      
      // If too many failed attempts, generate a new code
      if (user.phoneVerificationAttempts >= 3) {
        const newCode = smsService.generateOTP();
        user.phoneVerificationCode = newCode;
        user.phoneVerificationExpires = Date.now() + (10 * 60 * 1000); // 10 minutes
        user.phoneVerificationAttempts = 0;
        
        await user.save();
        
        // Send new verification code
        await smsService.sendVerificationSMS(user.phone, newCode);
        
        return res.status(400).json({ 
          errors: [{ msg: 'Too many failed attempts. A new verification code has been sent to your phone.' }] 
        });
      }
      
      await user.save();
      
      return res.status(400).json({ 
        errors: [{ msg: 'Invalid or expired verification code' }],
        attemptsLeft: 3 - user.phoneVerificationAttempts
      });
    }
    
    // Verification successful
    user.phoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    user.phoneVerificationAttempts = 0;
    
    await user.save();
    
    // Issue a new token with verified status
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        verified: true
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '12h' },
      (err, token) => {
        if (err) throw err;
        
        // Set secure cookie with the token
        res.cookie('authToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 12 * 60 * 60 * 1000
        });
        
        res.json({
          success: true,
          token,
          verified: true,
          message: 'Phone number verified successfully'
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route POST /api/auth/resend-verification
// @desc Resend phone verification code
// @access Private
router.post('/resend-verification', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    
    // Check if already verified
    if (user.phoneVerified) {
      return res.status(400).json({ errors: [{ msg: 'Phone number already verified' }] });
    }
    
    // Generate a new verification code
    const verificationCode = smsService.generateOTP();
    user.phoneVerificationCode = verificationCode;
    user.phoneVerificationExpires = Date.now() + (10 * 60 * 1000); // 10 minutes
    user.phoneVerificationAttempts = 0;
    
    await user.save();
    
    // Send verification SMS
    await smsService.sendVerificationSMS(user.phone, verificationCode);
    
    res.json({
      success: true,
      message: 'Verification code sent to your phone'
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route POST /api/auth/reset-password-sms
// @desc Request password reset via SMS
// @access Public
router.post('/reset-password-sms', [
  check('phone', 'Phone number is required').not().isEmpty(),
  check('phone', 'Invalid phone number format').matches(/^\+?[1-9]\d{9,14}$/)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const user = await User.findOne({ phone: req.body.phone });
    
    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: 'If a user with that phone number exists, a password reset code has been sent' 
      });
    }
    
    // Generate reset code
    const resetCode = smsService.generateOTP();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + (10 * 60 * 1000); // 10 minutes
    user.resetPasswordAttempts = 0;
    
    await user.save();
    
    // Send password reset SMS
    await smsService.sendPasswordResetSMS(user.phone, resetCode);
    
    res.json({
      success: true,
      message: 'If a user with that phone number exists, a password reset code has been sent'
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route POST /api/auth/verify-reset-code
// @desc Verify password reset code
// @access Public
router.post('/verify-reset-code', [
  check('phone', 'Phone number is required').not().isEmpty(),
  check('resetCode', 'Reset code is required').not().isEmpty(),
  check('resetCode', 'Reset code must be numeric').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const user = await User.findOne({ 
      phone: req.body.phone,
      resetPasswordCode: req.body.resetCode,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid or expired reset code' }] });
    }
    
    // Generate a temporary token for password reset
    const payload = {
      user: {
        id: user.id,
        resetPassword: true
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '15m' }, // Short expiry for security
      (err, token) => {
        if (err) throw err;
        
        res.json({
          success: true,
          resetToken: token,
          message: 'Reset code verified successfully'
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route POST /api/auth/reset-password-confirm
// @desc Reset password with token from verify-reset-code
// @access Public (with token)
router.post('/reset-password-confirm', [
  check('resetToken', 'Reset token is required').not().isEmpty(),
  check('password', 'Password is required with 8 or more characters')
    .isLength({ min: 8 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Verify the reset token
    const decoded = jwt.verify(req.body.resetToken, process.env.JWT_SECRET);
    
    // Check if this is a reset token
    if (!decoded.user || !decoded.user.resetPassword) {
      return res.status(401).json({ errors: [{ msg: 'Invalid reset token' }] });
    }
    
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    
    // Update password
    user.password = req.body.password;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordAttempts = 0;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error(error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ errors: [{ msg: 'Invalid token' }] });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ errors: [{ msg: 'Token expired' }] });
    }
    
    res.status(500).send('Server error');
  }
});

// @route POST /api/auth/enable-two-factor
// @desc Enable two-factor authentication
// @access Private
router.post('/enable-two-factor', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    
    // Check if phone is verified
    if (!user.phoneVerified) {
      return res.status(400).json({ 
        errors: [{ msg: 'Phone number must be verified before enabling two-factor authentication' }] 
      });
    }
    
    // Enable two-factor authentication
    user.twoFactorEnabled = true;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route POST /api/auth/disable-two-factor
// @desc Disable two-factor authentication
// @access Private
router.post('/disable-two-factor', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    
    // Disable two-factor authentication
    user.twoFactorEnabled = false;
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route POST /api/auth/request-login-code
// @desc Request a login code for two-factor authentication
// @access Public
router.post('/request-login-code', [
  check('phone', 'Phone number is required').not().isEmpty(),
  check('phone', 'Invalid phone number format').matches(/^\+?[1-9]\d{9,14}$/)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const user = await User.findOne({ phone: req.body.phone });
    
    // Don't reveal if user exists or not (security best practice)
    if (!user || !user.twoFactorEnabled) {
      return res.status(200).json({ 
        success: true, 
        message: 'If a user with that phone number exists and has 2FA enabled, a login code has been sent' 
      });
    }
    
    // Generate login code
    const loginCode = smsService.generateOTP();
    user.twoFactorCode = loginCode;
    user.twoFactorExpires = Date.now() + (10 * 60 * 1000); // 10 minutes
    
    await user.save();
    
    // Send login code SMS
    await smsService.sendNotificationSMS(
      user.phone, 
      `Your Tailors login code is: ${loginCode}. This code will expire in 10 minutes.`
    );
    
    res.json({
      success: true,
      message: 'If a user with that phone number exists and has 2FA enabled, a login code has been sent'
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route POST /api/auth/login-with-2fa
// @desc Login with two-factor authentication
// @access Public
router.post('/login-with-2fa', [
  check('phone', 'Phone number is required').not().isEmpty(),
  check('twoFactorCode', 'Two-factor code is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const user = await User.findOne({ 
      phone: req.body.phone,
      twoFactorCode: req.body.twoFactorCode,
      twoFactorExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
    }
    
    // Clear the two-factor code
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    user.lastLogin = Date.now();
    
    await user.save();
    
    // Create and return JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        verified: user.phoneVerified
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '12h' },
      (err, token) => {
        if (err) throw err;
        
        // Set secure cookie with the token
        res.cookie('authToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 12 * 60 * 60 * 1000
        });
        
        res.json({
          token,
          role: user.role,
          userId: user.id,
          verified: user.phoneVerified
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update the login route to support 2FA
router.post('/login', [
  loginLimiter,
  check('password', 'Password is required').exists(),
  check('phone', 'Phone number is required').optional(),
  check('email', 'Please provide a valid email').optional().isEmail()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {password, email, phone} = req.body;

    if (!phone && !email) {
      return res.status(400).json({ errors: [{ msg: 'Phone number is required' }] });
    }

    try {
      let user;
      if (phone) {
        user = await User.findOne({ phone });
      } else if (email) {
        user = await User.findOne({ email });
      }

      if (!user) {
        // Generic error message to prevent user enumeration
        return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        // Add login attempt tracking logic here
        // Generic error message to prevent user enumeration
        return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Check if two-factor authentication is enabled
      if (user.twoFactorEnabled) {
        // Generate login code
        const loginCode = smsService.generateOTP();
        user.twoFactorCode = loginCode;
        user.twoFactorExpires = Date.now() + (10 * 60 * 1000); // 10 minutes
        
        await user.save();
        
        // Send login code SMS
        await smsService.sendNotificationSMS(
          user.phone, 
          `Your Tailors login code is: ${loginCode}. This code will expire in 10 minutes.`
        );
        
        return res.json({
          success: true,
          requires2FA: true,
          message: 'Two-factor authentication required. A code has been sent to your phone.'
        });
      }

      // If 2FA is not enabled, proceed with normal login
      // update last login
      user.lastLogin = Date.now();
      await user.save();

      const payload = {
        user: {
          id: user.id,
          role: user.role,
          verified: user.phoneVerified
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '12h' }, // Reduced from 24h to 12h for security
        (error, token) => {
          if (error) throw error;
          
          // Set secure cookie with the token
          res.cookie('authToken', token, {
            httpOnly: true, // Prevents JavaScript access
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict', // Prevents CSRF
            maxAge: 12 * 60 * 60 * 1000 // 12 hours
          });
          
          res.json({
            token,
            role: user.role,
            userId: user.id,
            verified: user.phoneVerified
          });
        }
      );
    } catch(error) {
      console.error(error.message);
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

        res.json({ success: true, data: 'Password reset email sent' });
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

// @route PUT /api/auth/reset-password/:token
// @desc  reset password
// @access public
router.put('/reset-password/:token', [
  check('password', 'Password must at least be 8 character').isLength({ min: 8 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    try {
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ errors: [{ message: 'Invalid or expired token' }] });
      }

      // set the new password
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.json({ success: true ,data: 'Password reset successful' });
    } catch(error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  });

// @route GET /api/auth/verify
// @desc  Verify user token
// @access Private
router.get('/verify', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ errors: [{ message: 'User not found' }] });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
})

// @route POST /api/auth/refresh-token
// @desc  Refresh JWT token
// @access Private
router.post('/refresh-token', async (req, res) => {
  try {
    // Get token from cookies
    let token;
    if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }
    
    // If no token found, try to get from authorization header
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]; // extract token after "Bearer"
      }
    }
    
    // If still no token found, deny access
    if (!token) {
      return res.status(401).json({
        success: false,
        errors: [{ message: 'No token provided, authentication required' }]
      });
    }
    
    // Verify token (even if expired)
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.user || !decoded.user.id) {
      return res.status(401).json({
        success: false,
        errors: [{ message: 'Invalid token format' }]
      });
    }
    
    // Get user from DB with ID from token
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        errors: [{ message: 'User not found' }]
      });
    }
    
    // Create new payload with same user info
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        verified: user.phoneVerified
      }
    };
    
    // Generate new token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '12h' },
      (err, newToken) => {
        if (err) throw err;
        
        // Set secure cookie with the token
        res.cookie('authToken', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 12 * 60 * 60 * 1000 // 12 hours
        });
        
        res.json({
          token: newToken,
          success: true,
          message: 'Token refreshed successfully'
        });
      }
    );
  } catch (error) {
    console.error('Refresh token error:', error.message);
    res.status(500).json({
      success: false,
      errors: [{ message: 'Server error during token refresh' }]
    });
  }
});

// @route POST /api/auth/logout
// @desc  Logout user by clearing cookie
// @access Public
router.post('/logout', (req, res) => {
  // Clear the auth cookie
  res.clearCookie('authToken');
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
