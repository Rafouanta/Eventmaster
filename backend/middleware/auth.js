const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          error: 'Not authorized, user not found'
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({
          error: 'Account has been deactivated'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }

      return res.status(401).json({
        error: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Not authorized, no token provided'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Not authorized, user not found'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `User role '${req.user.role}' is not authorized to access this route`,
        requiredRoles: roles
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignore errors for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET + '_refresh', {
    expiresIn: '30d'
  });
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET + '_refresh');
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Middleware to check if user owns the resource
const checkOwnership = (resourceModel, resourceIdField = '_id', userField = 'user') => {
  return async (req, res, next) => {
    try {
      const resource = await resourceModel.findById(req.params[resourceIdField]);
      
      if (!resource) {
        return res.status(404).json({
          error: 'Resource not found'
        });
      }

      // Check ownership
      const resourceUserId = resource[userField].toString();
      const currentUserId = req.user._id.toString();
      
      // Allow if user is admin or owns the resource
      if (req.user.role === 'admin' || resourceUserId === currentUserId) {
        req.resource = resource;
        next();
      } else {
        return res.status(403).json({
          error: 'Not authorized to access this resource'
        });
      }
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        error: 'Server error during authorization check'
      });
    }
  };
};

// Middleware to ensure user can only access their own data
const checkSelfOrAdmin = (req, res, next) => {
  const userId = req.params.userId || req.params.id;
  
  // Allow if user is admin or accessing their own data
  if (req.user.role === 'admin' || req.user._id.toString() === userId) {
    next();
  } else {
    return res.status(403).json({
      error: 'Not authorized to access this user data'
    });
  }
};

// Rate limiting for authentication attempts
const authAttemptLimiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: {
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  protect,
  authorize,
  optionalAuth,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  checkOwnership,
  checkSelfOrAdmin,
  authAttemptLimiter
};