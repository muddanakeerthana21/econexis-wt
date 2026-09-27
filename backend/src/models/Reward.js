import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    rewardCode: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide reward title'],
      trim: true,
    },
    points: {
      type: Number,
      required: [true, 'Please provide points required for reward'],
      min: [1, 'Points must be at least 1'],
    },
    category: {
      type: String,
      required: [true, 'Please provide reward category'],
    },
    icon: {
      type: String,
      default: 'Gift',
    },
    description: {
      type: String,
      default: '',
    },
    claimed: {
      type: Boolean,
      default: false,
    },
    redemptions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        userName: String,
        userEmail: String,
        voucherCode: String,
        redeemedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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

rewardSchema.pre('save', function (next) {
  if (!this.rewardCode) {
    this.rewardCode = `REW-${Math.floor(100 + Math.random() * 900)}`;
  }
  next();
});

const Reward = mongoose.model('Reward', rewardSchema);

export default Reward;
