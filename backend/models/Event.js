const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Basic event information
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Event title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Event description cannot exceed 2000 characters']
  },
  
  // Theme and category
  theme: {
    type: String,
    required: [true, 'Event theme is required'],
    trim: true,
    maxlength: [100, 'Theme cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: [
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
    ]
  },
  
  // Image
  image: {
    type: String,
    default: null
  },
  imagePublicId: {
    type: String,
    default: null // For Cloudinary
  },
  
  // Date and time
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  
  // Location
  venue: {
    name: {
      type: String,
      required: [true, 'Venue name is required'],
      trim: true,
      maxlength: [100, 'Venue name cannot exceed 100 characters']
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
      },
      postalCode: {
        type: String,
        trim: true
      },
      coordinates: {
        latitude: {
          type: Number,
          min: -90,
          max: 90
        },
        longitude: {
          type: Number,
          min: -180,
          max: 180
        }
      }
    }
  },
  
  // Pricing and capacity
  ticketPrice: {
    type: Number,
    required: [true, 'Ticket price is required'],
    min: [0, 'Ticket price cannot be negative']
  },
  totalCapacity: {
    type: Number,
    required: [true, 'Total capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  availableTickets: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value <= this.totalCapacity;
      },
      message: 'Available tickets cannot exceed total capacity'
    }
  },
  
  // Target audience and objectives
  targetAudience: {
    type: String,
    trim: true,
    maxlength: [500, 'Target audience description cannot exceed 500 characters']
  },
  objectives: [{
    type: String,
    trim: true,
    maxlength: [200, 'Objective cannot exceed 200 characters']
  }],
  
  // Source and validation
  source: {
    type: String,
    enum: ['internal', 'partner', 'external'],
    default: 'internal'
  },
  isValidated: {
    type: Boolean,
    default: false
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  validatedAt: {
    type: Date,
    default: null
  },
  
  // Event status
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  
  // Organizer
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event organizer is required']
  },
  
  // Additional information
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  requirements: [{
    type: String,
    trim: true,
    maxlength: [300, 'Requirement cannot exceed 300 characters']
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
eventSchema.index({ organizer: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ 'venue.city': 1 });
eventSchema.index({ 'venue.country': 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for sold tickets count
eventSchema.virtual('soldTickets').get(function() {
  return this.totalCapacity - this.availableTickets;
});

// Virtual for event duration
eventSchema.virtual('duration').get(function() {
  return this.endDate - this.startDate;
});

// Virtual to check if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return this.startDate > new Date();
});

// Virtual to check if event is ongoing
eventSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
});

// Virtual to check if event is past
eventSchema.virtual('isPast').get(function() {
  return this.endDate < new Date();
});

// Pre-save middleware to update available tickets
eventSchema.pre('save', function(next) {
  if (this.isNew) {
    this.availableTickets = this.totalCapacity;
  }
  next();
});

// Instance method to update available tickets
eventSchema.methods.reserveTickets = function(quantity) {
  if (this.availableTickets < quantity) {
    throw new Error('Not enough tickets available');
  }
  this.availableTickets -= quantity;
  return this.save();
};

// Instance method to release tickets (for cancelled events or refunds)
eventSchema.methods.releaseTickets = function(quantity) {
  this.availableTickets += quantity;
  if (this.availableTickets > this.totalCapacity) {
    this.availableTickets = this.totalCapacity;
  }
  return this.save();
};

// Static method to find upcoming events
eventSchema.statics.findUpcoming = function(limit = 10) {
  return this.find({
    startDate: { $gte: new Date() },
    status: 'published'
  })
  .sort({ startDate: 1 })
  .limit(limit)
  .populate('organizer', 'firstName lastName email');
};

// Static method to search events
eventSchema.statics.searchEvents = function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'published',
    ...filters
  };
  
  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' } })
    .populate('organizer', 'firstName lastName email');
};

module.exports = mongoose.model('Event', eventSchema);