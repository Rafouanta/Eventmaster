const express = require('express');
const {
  getProfile,
  updateProfile,
  deleteAccount,
  getDashboardStats,
  getMyEvents
} = require('../controllers/userController');
const { protect, checkSelfOrAdmin } = require('../middleware/auth');
const {
  validateProfileUpdate,
  validateMongoId
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', validateProfileUpdate, updateProfile);
router.delete('/account', deleteAccount);

// User dashboard and stats
router.get('/dashboard/stats', getDashboardStats);
router.get('/my-events', getMyEvents);

// Admin can access any user's data
router.get('/profile/:userId', checkSelfOrAdmin, getProfile);
router.put('/profile/:userId', checkSelfOrAdmin, validateProfileUpdate, updateProfile);

module.exports = router;