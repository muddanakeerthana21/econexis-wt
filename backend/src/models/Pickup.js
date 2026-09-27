import mongoose from 'mongoose';

const pickupSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
      required: [true, 'Please provide customer name'],
      trim: true,
    },
    userPhone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
    },
    pickupAddress: {
      type: String,
      required: [true, 'Please provide pickup address'],
    },
    item: {
      type: String,
      required: [true, 'Please specify items to pick up'],
    },
    category: {
      type: String,
      default: 'Smartphones & Laptops',
    },
    quantity: {
      type: Number,
      default: 1,
    },
    pickupDate: {
      type: String,
      required: [true, 'Please provide preferred pickup date'],
    },
    pickupTime: {
      type: String,
      default: '02:00 PM - 04:00 PM',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    deliveryAgent: {
      type: String,
      default: 'Unassigned',
    },
    deliveryAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    measuredWeight: {
      type: Number,
      default: 0,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    batteryChecked: {
      type: Boolean,
      default: false,
    },
    dataWipeConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

// Auto-generate unique tracking ID if not provided
pickupSchema.pre('save', function (next) {
  if (!this.trackingId) {
    this.trackingId = `ECO-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

const Pickup = mongoose.model('Pickup', pickupSchema);

export default Pickup;
