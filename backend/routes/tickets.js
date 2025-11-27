const express = require('express');
const {
  purchaseTickets,
  getMyTickets,
  getTicket,
  cancelTicket,
  validateTicket,
  getEventTickets,
  refundTicket
} = require('../controllers/ticketController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateTicketPurchase,
  validateMongoId,
  validateEventId
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/purchase', optionalAuth, validateTicketPurchase, purchaseTickets);
router.get('/validate/:ticketNumber/:validationCode', optionalAuth, validateTicket);

// Protected routes - user tickets
router.get('/my-tickets', protect, getMyTickets);
router.get('/my-tickets/:id', protect, validateMongoId, getTicket);
router.put('/:id/cancel', protect, validateMongoId, cancelTicket);
router.put('/:id/refund', protect, validateMongoId, refundTicket);

// Event-specific routes
router.get('/event/:eventId', protect, validateEventId, getEventTickets);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getEventTickets);
router.put('/admin/:id/validate', protect, authorize('admin'), validateMongoId, validateTicket);

module.exports = router;