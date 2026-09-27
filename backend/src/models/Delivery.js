import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    deliveryId: {
      type: String,
      unique: true,
      index: true,
    },
    pickup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pickup',
    },
    pickupTrackingId: {
      type: String,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    agentName: {
      type: String,
      default: 'Vikram Singh',
    },
    vehicleNumber: {
      type: String,
      default: 'EV-VAN-4022',
    },
    assignedArea: {
      type: String,
      default: 'North City Campus Hub',
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
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Completed', 'Failed'],
      default: 'Pending',
    },
    completedAt: {
      type: Date,
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

deliverySchema.pre('save', function (next) {
  if (!this.deliveryId) {
    this.deliveryId = `DEL-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

const Delivery = mongoose.model('Delivery', deliverySchema);

export default Delivery;
