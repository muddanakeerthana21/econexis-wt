import mongoose from 'mongoose';

const ewasteSchema = new mongoose.Schema(
  {
    objectId: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please provide e-waste type'],
      trim: true,
    },
    aiDetection: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    aiConfidence: {
      type: Number,
      default: 0.0,
      min: 0,
      max: 100,
    },
    owner: {
      type: String,
      default: 'Eco Contributor',
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Registered', 'Assigned', 'In Transit', 'Picked Up', 'Recycled', 'Cancelled'],
      default: 'Registered',
    },
    pickupStatus: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Transit', 'Picked Up', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deliveryPartnerName: {
      type: String,
      default: '',
      trim: true,
    },
    pickupConfirmedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    // Compatibility fields
    itemId: {
      type: String,
      index: true,
    },
    itemName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: 'General Electronics',
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    condition: {
      type: String,
      default: 'Scrap',
    },
    recyclingStatus: {
      type: String,
      enum: ['Pending', 'In Progress', 'Collected', 'Recycled', 'Hazardous'],
      default: 'Pending',
    },
    weightKg: {
      type: Number,
      default: 1.0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
      default: 'Eco Contributor',
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

// Sync compatibility fields before saving
ewasteSchema.pre('save', function (next) {
  if (this.objectId) {
    if (!this.itemId) this.itemId = this.objectId;
  } else if (this.itemId) {
    this.objectId = this.itemId;
  }
  if (!this.itemName && this.type) {
    this.itemName = this.type;
  }
  if (!this.type && this.itemName) {
    this.type = this.itemName;
  }
  if (!this.owner && this.userName) {
    this.owner = this.userName;
  }
  if (!this.userName && this.owner) {
    this.userName = this.owner;
  }
  if (!this.ownerId && this.user) {
    this.ownerId = this.user;
  }
  if (!this.user && this.ownerId) {
    this.user = this.ownerId;
  }
  next();
});

const Ewaste = mongoose.model('Ewaste', ewasteSchema);

export default Ewaste;
