import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Do not include in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'delivery'],
      default: 'user',
      lowercase: true,
    },
    phone: {
      type: String,
      default: '+91 98765 00000',
    },
    college: {
      type: String,
      default: 'National Institute of Technology',
    },
    address: {
      type: String,
      default: 'Campus Residence',
    },
    department: {
      type: String,
      default: '',
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
    assignedArea: {
      type: String,
      default: '',
    },
    ecoPoints: {
      type: Number,
      default: 100,
    },
    recycledKg: {
      type: Number,
      default: 0,
    },
    co2SavedKg: {
      type: Number,
      default: 0,
    },
    greenLevel: {
      type: String,
      default: 'Eco Starter',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        return ret;
      },
    },
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
