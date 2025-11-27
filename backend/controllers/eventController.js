const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

// Helper function to build query filters
const buildEventFilters = (query) => {
  const filters = { status: 'published' }; // Only show published events to public
  
  // Category filter
  if (query.category) {
    filters.category = query.category;
  }
  
  // Price range filters
  if (query.minPrice || query.maxPrice) {
    filters.ticketPrice = {};
    if (query.minPrice) filters.ticketPrice.$gte = parseFloat(query.minPrice);
    if (query.maxPrice) filters.ticketPrice.$lte = parseFloat(query.maxPrice);
  }
  
  // Date range filters
  if (query.startDate || query.endDate) {
    filters.startDate = {};
    if (query.startDate) filters.startDate.$gte = new Date(query.startDate);
    if (query.endDate) filters.startDate.$lte = new Date(query.endDate);
  }
  
  // Location filters
  if (query.city) {
    filters['venue.city'] = new RegExp(query.city, 'i');
  }
  
  if (query.country) {
    filters['venue.country'] = new RegExp(query.country, 'i');
  }
  
  // Status filter (for authenticated users)
  if (query.status && query.status !== 'published') {
    if (query.status === 'draft' || query.status === 'cancelled' || query.status === 'completed') {
      filters.status = query.status;
    }
  }
  
  return filters;
};

// Helper function to build sort options
const buildSortOptions = (sortBy) => {
  switch (sortBy) {
    case 'date':
      return { startDate: 1 };
    case 'date-desc':
      return { startDate: -1 };
    case 'price':
      return { ticketPrice: 1 };
    case 'price-desc':
      return { ticketPrice: -1 };
    case 'capacity':
      return { totalCapacity: -1 };
    case 'popularity':
      return { soldTickets: -1 };
    case 'newest':
      return { createdAt: -1 };
    default:
      return { startDate: 1 };
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public/Private (based on filters)
const getEvents = async (req, res) => {
  try {
    // Build pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Build filters
    const filters = buildEventFilters(req.query);
    
    // Add search text if provided
    let query = Event.find(filters);
    
    if (req.query.search) {
      query = query.find({
        $text: { $search: req.query.search }
      });
    }
    
    // Build sorting
    const sortOptions = buildSortOptions(req.query.sort);
    
    // Execute query
    const events = await query
      .sort(sortOptions)
      .limit(limit * 1)
      .skip(startIndex)
      .populate('organizer', 'firstName lastName email')
      .lean();
    
    // Get total count for pagination
    const total = await Event.countDocuments(filters);
    
    // Add computed fields
    const enrichedEvents = events.map(event => ({
      ...event,
      soldTickets: event.totalCapacity - event.availableTickets,
      isUpcoming: event.startDate > new Date(),
      isOngoing: event.startDate <= new Date() && event.endDate >= new Date(),
      isPast: event.endDate < new Date()
    }));
    
    res.status(200).json({
      success: true,
      data: {
        events: enrichedEvents,
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
    console.error('Get events error:', error);
    res.status(500).json({
      error: 'Server error while fetching events'
    });
  }
};

// @desc    Search events
// @route   GET /api/events/search
// @access  Public/Private
const searchEvents = async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search || search.length < 2) {
      return res.status(400).json({
        error: 'Search term must be at least 2 characters long'
      });
    }
    
    const filters = buildEventFilters(req.query);
    filters.status = 'published';
    
    const events = await Event.find({
      $text: { $search: search },
      ...filters
    })
    .sort({ score: { $meta: 'textScore' } })
    .limit(50)
    .populate('organizer', 'firstName lastName email')
    .lean();
    
    const enrichedEvents = events.map(event => ({
      ...event,
      soldTickets: event.totalCapacity - event.availableTickets,
      isUpcoming: event.startDate > new Date(),
      isOngoing: event.startDate <= new Date() && event.endDate >= new Date(),
      isPast: event.endDate < new Date()
    }));
    
    res.status(200).json({
      success: true,
      data: {
        events: enrichedEvents,
        query: search,
        count: events.length
      }
    });
    
  } catch (error) {
    console.error('Search events error:', error);
    res.status(500).json({
      error: 'Server error while searching events'
    });
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public/Private
const getUpcomingEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const events = await Event.findUpcoming(limit);
    
    const enrichedEvents = events.map(event => ({
      ...event.toObject(),
      soldTickets: event.totalCapacity - event.availableTickets,
      isUpcoming: true,
      isOngoing: false,
      isPast: false
    }));
    
    res.status(200).json({
      success: true,
      data: {
        events: enrichedEvents,
        count: events.length
      }
    });
    
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      error: 'Server error while fetching upcoming events'
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public/Private
const getEvent = async (req, res) => {
  try {
    let query = Event.findById(req.params.id);
    
    // If user is not authenticated or not admin, only show published events
    if (!req.user || req.user.role !== 'admin') {
      query = query.where('status').equals('published');
    }
    
    const event = await query
      .populate('organizer', 'firstName lastName email phone')
      .populate('validatedBy', 'firstName lastName');
    
    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }
    
    // Add computed fields
    const enrichedEvent = {
      ...event.toObject(),
      soldTickets: event.totalCapacity - event.availableTickets,
      isUpcoming: event.startDate > new Date(),
      isOngoing: event.startDate <= new Date() && event.endDate >= new Date(),
      isPast: event.endDate < new Date(),
      canEdit: req.user && (req.user.role === 'admin' || event.organizer._id.toString() === req.user._id.toString())
    };
    
    res.status(200).json({
      success: true,
      data: {
        event: enrichedEvent
      }
    });
    
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      error: 'Server error while fetching event'
    });
  }
};

// @desc    Get my events
// @route   GET /api/events/my-events/all
// @access  Private
const getMyEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const status = req.query.status || 'all';
    
    let query = { organizer: req.user._id };
    
    if (status !== 'all') {
      query.status = status;
    }
    
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex)
      .lean();
    
    const total = await Event.countDocuments(query);
    
    const enrichedEvents = events.map(event => ({
      ...event,
      soldTickets: event.totalCapacity - event.availableTickets,
      isUpcoming: event.startDate > new Date(),
      isOngoing: event.startDate <= new Date() && event.endDate >= new Date(),
      isPast: event.endDate < new Date()
    }));
    
    res.status(200).json({
      success: true,
      data: {
        events: enrichedEvents,
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
    console.error('Get my events error:', error);
    res.status(500).json({
      error: 'Server error while fetching your events'
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    // Add organizer to event data
    const eventData = {
      ...req.body,
      organizer: req.user._id
    };
    
    // Set status based on user role
    if (req.user.role === 'admin') {
      eventData.isValidated = true;
      eventData.validatedBy = req.user._id;
      eventData.validatedAt = new Date();
      eventData.status = 'published';
    }
    
    const event = await Event.create(eventData);
    
    // Populate organizer info
    await event.populate('organizer', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event
      }
    });
    
  } catch (error) {
    console.error('Create event error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: messages
      });
    }
    
    res.status(500).json({
      error: 'Server error while creating event'
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (owner or admin)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }
    
    // Check ownership
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to update this event'
      });
    }
    
    // Don't allow modifying organizer
    delete req.body.organizer;
    delete req.body.createdAt;
    delete req.body.updatedAt;
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'firstName lastName email');
    
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event: updatedEvent
      }
    });
    
  } catch (error) {
    console.error('Update event error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: messages
      });
    }
    
    res.status(500).json({
      error: 'Server error while updating event'
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (owner or admin)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }
    
    // Check ownership
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to delete this event'
      });
    }
    
    // Check if event has sold tickets
    const soldTickets = event.totalCapacity - event.availableTickets;
    if (soldTickets > 0 && req.user.role !== 'admin') {
      return res.status(400).json({
        error: 'Cannot delete event with sold tickets. Please cancel the event instead.',
        soldTickets
      });
    }
    
    // If user is deleting (not admin), set status to cancelled
    if (req.user.role !== 'admin') {
      event.status = 'cancelled';
      await event.save();
    } else {
      // Admin can delete completely
      await Event.findByIdAndDelete(req.params.id);
    }
    
    res.status(200).json({
      success: true,
      message: req.user.role === 'admin' ? 'Event deleted successfully' : 'Event cancelled successfully'
    });
    
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      error: 'Server error while deleting event'
    });
  }
};

// @desc    Validate event (admin only)
// @route   PUT /api/events/:id/validate
// @access  Private (Admin)
const validateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }
    
    event.isValidated = true;
    event.validatedBy = req.user._id;
    event.validatedAt = new Date();
    event.status = 'published';
    
    await event.save();
    
    res.status(200).json({
      success: true,
      message: 'Event validated and published successfully',
      data: {
        event
      }
    });
    
  } catch (error) {
    console.error('Validate event error:', error);
    res.status(500).json({
      error: 'Server error while validating event'
    });
  }
};

// @desc    Get event statistics
// @route   GET /api/events/:id/stats
// @access  Private (owner or admin)
const getEventStats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }
    
    // Check access
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to view statistics for this event'
      });
    }
    
    // Get ticket statistics
    const ticketStats = await Ticket.getEventStats(event._id);
    
    // Calculate additional metrics
    const soldTickets = event.totalCapacity - event.availableTickets;
    const revenue = ticketStats.find(stat => stat._id === 'completed')?.totalRevenue || 0;
    const attendanceRate = soldTickets > 0 ? (soldTickets / event.totalCapacity) * 100 : 0;
    
    // Format ticket statistics
    const formattedStats = {
      totalCapacity: event.totalCapacity,
      soldTickets,
      availableTickets: event.availableTickets,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      totalRevenue: revenue,
      statusBreakdown: ticketStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          revenue: stat.totalRevenue
        };
        return acc;
      }, {})
    };
    
    res.status(200).json({
      success: true,
      data: {
        event: {
          _id: event._id,
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate
        },
        statistics: formattedStats
      }
    });
    
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({
      error: 'Server error while fetching event statistics'
    });
  }
};

module.exports = {
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
};