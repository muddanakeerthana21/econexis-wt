import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donationId: {
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
      required: [true, 'Please provide donor name'],
      trim: true,
    },
    item: {
      type: String,
      required: [true, 'Please provide item name & model'],
    },
    category: {
      type: String,
      required: [true, 'Please select category'],
      default: 'Smartphones',
    },
    quantity: {
      type: Number,
      default: 1,
    },
    condition: {
      type: String,
      default: 'Fully Functional',
    },
    description: {
      type: String,
      default: '',
    },
    deliveryMethod: {
      type: String,
      default: 'Doorstep Pickup',
    },
    beneficiaryOption: {
      type: String,
      default: 'Underserved School Students',
    },
    status: {
      type: String,
      enum: ['Received', 'Allocated', 'Pending', 'In Refurbishing', 'Completed'],
      default: 'Received',
    },
    ecoPointsAwarded: {
      type: Number,
      default: 150,
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

donationSchema.pre('save', function (next) {
  if (!this.donationId) {
    this.donationId = `DON-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
