const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ticketSchema = new mongoose.Schema({
  // Ticket identification
  ticketNumber: {
    type: String,
    unique: true,
    default: () => `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  },
  qrCode: {
    type: String,
    default: null
  },
  
  // References
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event reference is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  
  // Ticket details
  quantity: {
    type: Number,
    required: [true, 'Ticket quantity is required'],
    min: [1, 'Minimum quantity is 1'],
    max: [10, 'Maximum quantity is 10 per order']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    validate: {
      validator: function() {
        return this.totalPrice === this.quantity * this.unitPrice;
      },
      message: 'Total price must equal quantity times unit price'
    }
  },
  
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'mobile_money', 'crypto'],
    default: 'card'
  },
  paymentId: {
    type: String,
    default: null // External payment processor ID
  },
  
  // Ticket status
  status: {
    type: String,
    enum: ['active', 'used', 'cancelled', 'expired', 'refunded'],
    default: 'active'
  },
  
  // Usage tracking
  usedAt: {
    type: Date,
    default: null
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  validationCode: {
    type: String,
    default: () => Math.random().toString(36).substr(2, 6).toUpperCase()
  },
  
  // Customer information (for guest purchases)
  customerInfo: {
    firstName: {
      type: String,
      required: function() { return !this.user; }
    },
    lastName: {
      type: String,
      required: function() { return !this.user; }
    },
    email: {
      type: String,
      required: function() { return !this.user; }
    },
    phone: {
      type: String,
      default: null
    }
  },
  
  // Additional information
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: null
  },
  specialRequests: {
    type: String,
    maxlength: [300, 'Special requests cannot exceed 300 characters'],
    default: null
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
// Note: ticketNumber index is automatically created by unique: true
ticketSchema.index({ event: 1 });
ticketSchema.index({ user: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ paymentStatus: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ expiresAt: 1 });

// Compound indexes
ticketSchema.index({ event: 1, user: 1 });
ticketSchema.index({ event: 1, status: 1 });

// Virtual for QR code URL (if using QR code service)
ticketSchema.virtual('qrCodeUrl').get(function() {
  if (this.qrCode) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.qrCode)}`;
  }
  return null;
});

// Virtual to check if ticket is expired
ticketSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return this.expiresAt < new Date();
});

// Virtual to check if ticket is valid for use
ticketSchema.virtual('isValid').get(function() {
  const now = new Date();
  const eventStart = this.event.startDate || new Date(8640000000000000); // Max date if no event
  const eventEnd = this.event.endDate || new Date(8640000000000000);
  
  return (
    this.status === 'active' &&
    this.paymentStatus === 'completed' &&
    !this.isExpired &&
    eventStart >= now
  );
});

// Pre-save middleware
ticketSchema.pre('save', function(next) {
  // Set expiration date (24 hours after event start if not set)
  if (this.isNew && !this.expiresAt && this.event) {
    const eventStart = new Date(this.event.startDate || Date.now());
    this.expiresAt = new Date(eventStart.getTime() + 24 * 60 * 60 * 1000); // 24 hours after event
  }
  
  // Generate QR code if not exists
  if (this.isNew && !this.qrCode) {
    this.qrCode = `${this.ticketNumber}-${this.validationCode}`;
  }
  
  next();
});

// Instance method to use ticket
ticketSchema.methods.useTicket = function(usedBy = null) {
  if (this.status !== 'active') {
    throw new Error('Ticket is not active');
  }
  
  if (this.isExpired) {
    throw new Error('Ticket has expired');
  }
  
  this.status = 'used';
  this.usedAt = new Date();
  this.usedBy = usedBy;
  
  return this.save();
};

// Instance method to cancel ticket
ticketSchema.methods.cancel = function() {
  this.status = 'cancelled';
  if (this.paymentStatus === 'completed') {
    this.paymentStatus = 'refunded';
  }
  
  return this.save();
};

// Static method to find user's tickets
ticketSchema.statics.findUserTickets = function(userId, options = {}) {
  const query = { user: userId };
  let sort = { createdAt: -1 };
  
  if (options.eventId) {
    query.event = options.eventId;
  }
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.upcoming) {
    query['event.startDate'] = { $gte: new Date() };
    sort = { 'event.startDate': 1 };
  }
  
  return this.find(query)
    .sort(sort)
    .populate('event', 'title startDate endDate venue.name image')
    .populate('user', 'firstName lastName email');
};

// Static method to find tickets by event
ticketSchema.statics.findEventTickets = function(eventId, options = {}) {
  const query = { event: eventId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.paymentStatus) {
    query.paymentStatus = options.paymentStatus;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('user', 'firstName lastName email')
    .populate('event', 'title startDate');
};

// Static method to get ticket statistics
ticketSchema.statics.getEventStats = function(eventId) {
  return this.aggregate([
    { $match: { event: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: '$quantity' },
        totalRevenue: { 
          $sum: { 
            $cond: [
              { $eq: ['$paymentStatus', 'completed'] },
              '$totalPrice',
              0
            ]
          }
        }
      }
    }
  ]);
};

// Static method to validate ticket
ticketSchema.statics.validateTicket = function(ticketNumber, validationCode) {
  return this.findOne({
    ticketNumber,
    validationCode,
    status: { $in: ['active'] },
    expiresAt: { $gt: new Date() }
  })
  .populate('event', 'title startDate endDate status')
  .populate('user', 'firstName lastName email');
};

module.exports = mongoose.model('Ticket', ticketSchema);