const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

// @desc    Purchase tickets
// @route   POST /api/tickets/purchase
// @access  Public/Private
const purchaseTickets = async (req, res) => {
  try {
    const { eventId, quantity, customerInfo, specialRequests } = req.body;
    
    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }
    
    // Check if event is published
    if (event.status !== 'published') {
      return res.status(400).json({
        error: 'Event is not available for ticket purchase'
      });
    }
    
    // Check if event has started
    if (event.startDate <= new Date()) {
      return res.status(400).json({
        error: 'Event has already started'
      });
    }
    
    // Check availability
    if (event.availableTickets < quantity) {
      return res.status(400).json({
        error: 'Not enough tickets available',
        availableTickets: event.availableTickets,
        requestedQuantity: quantity
      });
    }
    
    // Validate customer info for guest purchases
    if (!req.user && (!customerInfo || !customerInfo.firstName || !customerInfo.lastName || !customerInfo.email)) {
      return res.status(400).json({
        error: 'Customer information is required for guest purchases'
      });
    }
    
    // Calculate total price
    const totalPrice = event.ticketPrice * quantity;
    
    // Create ticket
    const ticketData = {
      event: eventId,
      quantity,
      unitPrice: event.ticketPrice,
      totalPrice,
      specialRequests,
      customerInfo: req.user ? null : customerInfo
    };
    
    // Set user if authenticated
    if (req.user) {
      ticketData.user = req.user._id;
    }
    
    const ticket = await Ticket.create(ticketData);
    
    // Update event available tickets
    await event.reserveTickets(quantity);
    
    // Simulate payment processing (in real app, integrate with payment processor)
    const paymentStatus = 'completed'; // This would be determined by payment processor
    
    if (paymentStatus === 'completed') {
      ticket.paymentStatus = 'completed';
      ticket.paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await ticket.save();
    } else {
      // If payment failed, release the tickets back to event
      await event.releaseTickets(quantity);
      return res.status(400).json({
        error: 'Payment failed. Please try again.'
      });
    }
    
    // Populate ticket data for response
    await ticket.populate('event', 'title startDate endDate venue.name image');
    if (req.user) {
      await ticket.populate('user', 'firstName lastName email');
    }
    
    res.status(201).json({
      success: true,
      message: 'Tickets purchased successfully',
      data: {
        ticket,
        event: {
          _id: event._id,
          title: event.title,
          startDate: event.startDate,
          availableTickets: event.availableTickets
        }
      }
    });
    
  } catch (error) {
    console.error('Purchase tickets error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: messages
      });
    }
    
    res.status(500).json({
      error: 'Server error while processing ticket purchase'
    });
  }
};

// @desc    Get my tickets
// @route   GET /api/tickets/my-tickets
// @access  Private
const getMyTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;
    const upcoming = req.query.upcoming === 'true';
    
    const options = { page, limit };
    if (status) options.status = status;
    if (upcoming) options.upcoming = true;
    
    const tickets = await Ticket.findUserTickets(req.user._id, options);
    const total = await Ticket.countDocuments({ user: req.user._id });
    
    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({
      error: 'Server error while fetching your tickets'
    });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/my-tickets/:id
// @access  Private
const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      user: req.user._id
    })
    .populate('event', 'title startDate endDate venue.name image')
    .populate('user', 'firstName lastName email');
    
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        ticket
      }
    });
    
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      error: 'Server error while fetching ticket'
    });
  }
};

// @desc    Cancel ticket
// @route   PUT /api/tickets/:id/cancel
// @access  Private (ticket owner)
const cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('event');
    
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found'
      });
    }
    
    // Check if ticket can be cancelled
    if (ticket.status !== 'active') {
      return res.status(400).json({
        error: 'Ticket cannot be cancelled',
        currentStatus: ticket.status
      });
    }
    
    // Check cancellation policy (e.g., no cancellation within 24 hours of event)
    const hoursUntilEvent = (ticket.event.startDate - new Date()) / (1000 * 60 * 60);
    if (hoursUntilEvent < 24) {
      return res.status(400).json({
        error: 'Cannot cancel ticket within 24 hours of event',
        hoursUntilEvent: Math.round(hoursUntilEvent)
      });
    }
    
    // Cancel the ticket
    await ticket.cancel();
    
    // Release tickets back to event
    await ticket.event.releaseTickets(ticket.quantity);
    
    res.status(200).json({
      success: true,
      message: 'Ticket cancelled successfully',
      data: {
        ticket,
        refundAmount: ticket.paymentStatus === 'completed' ? ticket.totalPrice : 0
      }
    });
    
  } catch (error) {
    console.error('Cancel ticket error:', error);
    res.status(500).json({
      error: 'Server error while cancelling ticket'
    });
  }
};

// @desc    Validate ticket (check-in)
// @route   GET /api/tickets/validate/:ticketNumber/:validationCode
// @access  Public (for event staff) or Private (admin)
const validateTicket = async (req, res) => {
  try {
    const { ticketNumber, validationCode } = req.params;
    
    const ticket = await Ticket.validateTicket(ticketNumber, validationCode);
    
    if (!ticket) {
      return res.status(404).json({
        error: 'Invalid or expired ticket'
      });
    }
    
    // Check if event is happening today or has started
    const eventStart = new Date(ticket.event.startDate);
    const today = new Date();
    const eventDay = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (eventDay.getTime() !== todayDay.getTime() && eventStart > today) {
      return res.status(400).json({
        error: 'Ticket can only be used on the event day'
      });
    }
    
    // Use the ticket
    const usedBy = req.user ? req.user._id : null;
    await ticket.useTicket(usedBy);
    
    res.status(200).json({
      success: true,
      message: 'Ticket validated successfully',
      data: {
        ticket: {
          _id: ticket._id,
          ticketNumber: ticket.ticketNumber,
          quantity: ticket.quantity,
          usedAt: ticket.usedAt
        },
        event: {
          _id: ticket.event._id,
          title: ticket.event.title,
          startDate: ticket.event.startDate
        },
        customer: ticket.user ? 
          `${ticket.user.firstName} ${ticket.user.lastName}` :
          `${ticket.customerInfo.firstName} ${ticket.customerInfo.lastName}`
      }
    });
    
  } catch (error) {
    console.error('Validate ticket error:', error);
    res.status(500).json({
      error: 'Server error while validating ticket'
    });
  }
};

// @desc    Get tickets for an event
// @route   GET /api/tickets/event/:eventId
// @access  Private (event owner or admin)
const getEventTickets = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }
    
    // Check access
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to view tickets for this event'
      });
    }
    
    const tickets = await Ticket.findEventTickets(req.params.eventId);
    
    res.status(200).json({
      success: true,
      data: {
        event: {
          _id: event._id,
          title: event.title,
          startDate: event.startDate
        },
        tickets,
        totalTickets: tickets.length,
        totalQuantity: tickets.reduce((sum, ticket) => sum + ticket.quantity, 0),
        totalRevenue: tickets
          .filter(t => t.paymentStatus === 'completed')
          .reduce((sum, ticket) => sum + ticket.totalPrice, 0)
      }
    });
    
  } catch (error) {
    console.error('Get event tickets error:', error);
    res.status(500).json({
      error: 'Server error while fetching event tickets'
    });
  }
};

// @desc    Refund ticket (admin only)
// @route   PUT /api/tickets/:id/refund
// @access  Private (Admin)
const refundTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event');
    
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found'
      });
    }
    
    // Check if ticket can be refunded
    if (ticket.paymentStatus !== 'completed') {
      return res.status(400).json({
        error: 'Ticket cannot be refunded',
        currentStatus: ticket.paymentStatus
      });
    }
    
    // Update ticket status
    ticket.paymentStatus = 'refunded';
    ticket.status = 'refunded';
    await ticket.save();
    
    // Release tickets back to event
    await ticket.event.releaseTickets(ticket.quantity);
    
    res.status(200).json({
      success: true,
      message: 'Ticket refunded successfully',
      data: {
        ticket,
        refundAmount: ticket.totalPrice
      }
    });
    
  } catch (error) {
    console.error('Refund ticket error:', error);
    res.status(500).json({
      error: 'Server error while processing refund'
    });
  }
};

module.exports = {
  purchaseTickets,
  getMyTickets,
  getTicket,
  cancelTicket,
  validateTicket,
  getEventTickets,
  refundTicket
};