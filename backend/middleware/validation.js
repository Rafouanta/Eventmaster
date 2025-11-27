const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Authentication validations
const validateRegister = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// User profile validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('preferences.language')
    .optional()
    .isIn(['fr', 'en'])
    .withMessage('Language must be either "fr" or "en"'),
  
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be boolean'),
  
  body('preferences.notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification preference must be boolean'),
  
  handleValidationErrors
];

// Event validation
const validateEvent = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Event title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Event description must be between 10 and 2000 characters'),
  
  body('theme')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Event theme must be between 3 and 100 characters'),
  
  body('category')
    .isIn([
      'conference',
      'workshop',
      'seminar',
      'concert',
      'festival',
      'sports',
      'networking',
      'exhibition',
      'party',
      'other'
    ])
    .withMessage('Please provide a valid event category'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('venue.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Venue name must be between 2 and 100 characters'),
  
  body('venue.address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('venue.address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('venue.address.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  
  body('ticketPrice')
    .isFloat({ min: 0 })
    .withMessage('Ticket price must be a positive number'),
  
  body('totalCapacity')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Total capacity must be between 1 and 10,000'),
  
  body('targetAudience')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Target audience description cannot exceed 500 characters'),
  
  body('objectives')
    .optional()
    .isArray()
    .withMessage('Objectives must be an array'),
  
  body('objectives.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Each objective cannot exceed 200 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters'),
  
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  
  body('requirements.*')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Each requirement cannot exceed 300 characters'),
  
  handleValidationErrors
];

// Ticket validation
const validateTicketPurchase = [
  body('eventId')
    .isMongoId()
    .withMessage('Please provide a valid event ID'),
  
  body('quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Ticket quantity must be between 1 and 10'),
  
  body('customerInfo.firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('customerInfo.lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('customerInfo.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('customerInfo.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Special requests cannot exceed 300 characters'),
  
  handleValidationErrors
];

// Common parameter validations
const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid ID'),
  
  handleValidationErrors
];

const validateEventId = [
  param('eventId')
    .isMongoId()
    .withMessage('Please provide a valid event ID'),
  
  handleValidationErrors
];

const validateUserId = [
  param('userId')
    .isMongoId()
    .withMessage('Please provide a valid user ID'),
  
  handleValidationErrors
];

// Query parameter validations
const validateEventQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('category')
    .optional()
    .isIn([
      'conference',
      'workshop',
      'seminar',
      'concert',
      'festival',
      'sports',
      'networking',
      'exhibition',
      'party',
      'other'
    ])
    .withMessage('Please provide a valid category'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  
  query('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),
  
  handleValidationErrors
];

// Custom validation functions
const customValidations = {
  // Check if end date is after start date
  isEndDateAfterStartDate: (startDate, endDate) => {
    return new Date(endDate) > new Date(startDate);
  },
  
  // Check if event capacity is valid
  isValidCapacity: (totalCapacity, availableTickets) => {
    return totalCapacity >= availableTickets;
  },
  
  // Check if email is unique (for registration)
  isUniqueEmail: async (email, excludeUserId = null) => {
    const User = require('../models/User');
    const query = { email: email.toLowerCase() };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    const existingUser = await User.findOne(query);
    return !existingUser;
  }
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateEvent,
  validateTicketPurchase,
  validateMongoId,
  validateEventId,
  validateUserId,
  validateEventQuery,
  handleValidationErrors,
  customValidations
};