const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getUpcomingEvents,
  searchEvents,
  validateEvent,
  getEventStats
} = require('../controllers/eventController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateEvent: validateEventData,
  validateMongoId,
  validateEventQuery
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, validateEventQuery, getEvents);
router.get('/search', optionalAuth, validateEventQuery, searchEvents);
router.get('/upcoming', optionalAuth, getUpcomingEvents);
router.get('/:id', optionalAuth, validateMongoId, getEvent);

// Protected routes - users can manage their own events
router.get('/my-events/all', protect, getMyEvents);
router.post('/', protect, validateEventData, createEvent);
router.put('/:id', protect, validateMongoId, validateEventData, updateEvent);
router.delete('/:id', protect, validateMongoId, deleteEvent);

// Event validation (admin only)
router.put('/:id/validate', protect, authorize('admin'), validateMongoId, validateEvent);

// Event statistics (admin and event owner)
router.get('/:id/stats', protect, validateMongoId, getEventStats);

module.exports = router;