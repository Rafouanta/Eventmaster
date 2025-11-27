const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search;
    const role = req.query.role;
    const status = req.query.status;
    
    // Construire la requête
    let query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';
    
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        users: users.map(user => user.getProfile()),
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
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Server error while fetching users'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private (Admin)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    //Utilisateurs inscrits au cours des 30 derniers jours
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Top event organizers (users with most events)
    const topOrganizers = await User.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: 'organizer',
          as: 'events'
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          eventCount: { $size: '$events' }
        }
      },
      { $sort: { eventCount: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          admins: adminUsers,
          regularUsers: regularUsers,
          newThisMonth: newUsersThisMonth
        },
        topOrganizers
      }
    });
    
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Server error while fetching user statistics'
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:userId/role
// @access  Private (Admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be "user" or "admin"'
      });
    }
    
    // Cannot modify your own role
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        error: 'Cannot modify your own role'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: user.getProfile()
      }
    });
    
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: 'Server error while updating user role'
    });
  }
};

// @desc    Deactivate user
// @route   PUT /api/admin/users/:userId/deactivate
// @access  Private (Admin)
const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Cannot deactivate yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        error: 'Cannot deactivate your own account'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        user: user.getProfile()
      }
    });
    
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      error: 'Server error while deactivating user'
    });
  }
};

// @desc    Activate user
// @route   PUT /api/admin/users/:userId/activate
// @access  Private (Admin)
const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: {
        user: user.getProfile()
      }
    });
    
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      error: 'Server error while activating user'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Cannot delete yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        error: 'Cannot delete your own account'
      });
    }
    
    // Check if user has active events or tickets
    const activeEvents = await Event.countDocuments({
      organizer: userId,
      status: { $in: ['published', 'draft'] }
    });
    
    const activeTickets = await Ticket.countDocuments({
      user: userId,
      status: 'active',
      paymentStatus: 'completed'
    });
    
    if (activeEvents > 0 || activeTickets > 0) {
      return res.status(400).json({
        error: 'Cannot delete user with active events or tickets',
        activeEvents,
        activeTickets
      });
    }
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Server error while deleting user'
    });
  }
};

// @desc    Get all events (admin view)
// @route   GET /api/admin/events
// @access  Private (Admin)
const getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;
    const search = req.query.search;
    
    let query = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('organizer', 'firstName lastName email')
      .populate('validatedBy', 'firstName lastName');
    
    const total = await Event.countDocuments(query);
    
    const enrichedEvents = events.map(event => ({
      ...event.toObject(),
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
    console.error('Get all events error:', error);
    res.status(500).json({
      error: 'Server error while fetching events'
    });
  }
};

// @desc    Get events pending validation
// @route   GET /api/admin/events/validation-queue
// @access  Private (Admin)
const getEventValidationQueue = async (req, res) => {
  try {
    const events = await Event.find({
      status: 'draft',
      isValidated: false
    })
    .sort({ createdAt: 1 })
    .populate('organizer', 'firstName lastName email')
    .lean();
    
    const enrichedEvents = events.map(event => ({
      ...event,
      soldTickets: event.totalCapacity - event.availableTickets,
      isUpcoming: event.startDate > new Date()
    }));
    
    res.status(200).json({
      success: true,
      data: {
        events: enrichedEvents,
        count: events.length
      }
    });
    
  } catch (error) {
    console.error('Get validation queue error:', error);
    res.status(500).json({
      error: 'Server error while fetching validation queue'
    });
  }
};

// @desc    Validate event
// @route   PUT /api/admin/events/:eventId/validate
// @access  Private (Admin)
const validateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    
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
    await event.populate('organizer', 'firstName lastName email');
    await event.populate('validatedBy', 'firstName lastName');
    
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

// @desc    Reject event
// @route   PUT /api/admin/events/:eventId/reject
// @access  Private (Admin)
const rejectEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { reason } = req.body;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }
    
    event.status = 'cancelled';
    event.isValidated = false;
    
    
    await event.save();
    
    res.status(200).json({
      success: true,
      message: 'Event rejected successfully',
      data: {
        event
      }
    });
    
  } catch (error) {
    console.error('Reject event error:', error);
    res.status(500).json({
      error: 'Server error while rejecting event'
    });
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getPlatformStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    // Event statistics
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ status: 'published' });
    const draftEvents = await Event.countDocuments({ status: 'draft' });
    const cancelledEvents = await Event.countDocuments({ status: 'cancelled' });
    
    // Ticket statistics
    const totalTickets = await Ticket.countDocuments();
    const soldTickets = await Ticket.countDocuments({ 
      paymentStatus: 'completed',
      status: { $ne: 'cancelled' }
    });
    
    // Revenue statistics
    const totalRevenue = await Ticket.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const newEventsThisMonth = await Event.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const ticketsSoldThisMonth = await Ticket.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      paymentStatus: 'completed'
    });
    
    const revenueThisMonth = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          paymentStatus: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    // Top events by ticket sales
    const topEvents = await Event.aggregate([
      { $match: { status: 'published' } },
      {
        $addFields: {
          soldTickets: { $subtract: ['$totalCapacity', '$availableTickets'] }
        }
      },
      { $sort: { soldTickets: -1 } },
      { $limit: 10 },
      {
        $project: {
          title: 1,
          soldTickets: 1,
          totalCapacity: 1,
          startDate: 1,
          ticketPrice: 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers
        },
        events: {
          total: totalEvents,
          published: publishedEvents,
          draft: draftEvents,
          cancelled: cancelledEvents
        },
        tickets: {
          total: totalTickets,
          sold: soldTickets
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          thisMonth: revenueThisMonth[0]?.total || 0
        },
        activity: {
          newUsersThisMonth,
          newEventsThisMonth,
          ticketsSoldThisMonth
        },
        topEvents
      }
    });
    
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      error: 'Server error while fetching platform statistics'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserStats,
  updateUserRole,
  deactivateUser,
  activateUser,
  deleteUser,
  getAllEvents,
  getEventValidationQueue,
  validateEvent,
  rejectEvent,
  getPlatformStats
};