const express = require('express');
const {
  getAllUsers,
  getUserStats,
  updateUserRole,
  deactivateUser,
  activateUser,
  deleteUser,
  getPlatformStats,
  getAllEvents,
  getEventValidationQueue,
  validateEvent,
  rejectEvent
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { validateUserId, validateEventId } = require('../middleware/validation');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.put('/users/:userId/role', validateUserId, updateUserRole);
router.put('/users/:userId/deactivate', validateUserId, deactivateUser);
router.put('/users/:userId/activate', validateUserId, activateUser);
router.delete('/users/:userId', validateUserId, deleteUser);

// Event management routes
router.get('/events', getAllEvents);
router.get('/events/validation-queue', getEventValidationQueue);
router.put('/events/:eventId/validate', validateEventId, validateEvent);
router.put('/events/:eventId/reject', validateEventId, rejectEvent);

// Platform statistics
router.get('/stats', getPlatformStats);

module.exports = router;