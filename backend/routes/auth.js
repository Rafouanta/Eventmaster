const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  refreshToken,
  verifyEmail,
  resendVerificationEmail
} = require('../controllers/authController');
const { protect, authAttemptLimiter } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', authAttemptLimiter, validateRegister, register);
router.post('/login', authAttemptLimiter, validateLogin, login);
router.post('/logout', logout);

// Email verification routes
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resettoken', resetPassword);

// Token refresh route
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, validateProfileUpdate, updateProfile);

module.exports = router;