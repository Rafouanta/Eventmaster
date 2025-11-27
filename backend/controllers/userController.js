const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    // Get current user profile
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: user.getProfile()
      }
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Server error while fetching profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName,
        lastName,
        phone,
        preferences: {
          ...req.user.preferences,
          ...preferences
        }
      },
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getProfile()
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Email already in use'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: messages
      });
    }
    
    res.status(500).json({
      error: 'Server error while updating profile'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password'
      });
    }
    
    // Check for active events or tickets
    const activeEvents = await Event.countDocuments({
      organizer: user._id,
      status: { $in: ['published', 'draft'] }
    });
    
    const activeTickets = await Ticket.countDocuments({
      user: user._id,
      status: 'active',
      paymentStatus: 'completed'
    });
    
    if (activeEvents > 0 || activeTickets > 0) {
      return res.status(400).json({
        error: 'Cannot delete account with active events or tickets',
        activeEvents,
        activeTickets
      });
    }
    
    // Deactivate account instead of deleting
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
    
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Server error while deleting account'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/users/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get event statistics
    const eventStats = await Event.aggregate([
      { $match: { organizer: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get ticket statistics
    const ticketStats = await Ticket.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    // Get recent activity
    const recentEvents = await Event.find({ organizer: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status startDate createdAt');
    
    const recentTickets = await Ticket.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('event', 'title startDate')
      .select('ticketNumber totalPrice createdAt paymentStatus');
    
    // Format statistics
    const formattedEventStats = eventStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});
    
    const formattedTicketStats = ticketStats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalSpent: stat.totalSpent
      };
      return acc;
    }, {});
    
    // Calculate totals
    const totalEvents = eventStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalTickets = ticketStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalSpent = ticketStats.reduce((sum, stat) => sum + stat.totalSpent, 0);
    
    const stats = {
      events: {
        total: totalEvents,
        byStatus: formattedEventStats,
        published: formattedEventStats.published || 0,
        draft: formattedEventStats.draft || 0,
        cancelled: formattedEventStats.cancelled || 0,
        completed: formattedEventStats.completed || 0
      },
      tickets: {
        total: totalTickets,
        byPaymentStatus: formattedTicketStats,
        completed: formattedTicketStats.completed || { count: 0, totalSpent: 0 },
        pending: formattedTicketStats.pending || { count: 0, totalSpent: 0 },
        failed: formattedTicketStats.failed || { count: 0, totalSpent: 0 },
        totalSpent
      },
      recentActivity: {
        events: recentEvents,
        tickets: recentTickets
      }
    };
    
    res.status(200).json({
      success: true,
      data: {
        stats
      }
    });
    
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      error: 'Server error while fetching dashboard statistics'
    });
  }
};

// @desc    Get user's events
// @route   GET /api/users/my-events
// @access  Private
const getMyEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status || 'all';
    
    let query = { organizer: req.user._id };
    
    if (status !== 'all') {
      query.status = status;
    }
    
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('organizer', 'firstName lastName email')
      .lean();
    
    const total = await Event.countDocuments(query);
    
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
    console.error('Get my events error:', error);
    res.status(500).json({
      error: 'Server error while fetching your events'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  getDashboardStats,
  getMyEvents
};