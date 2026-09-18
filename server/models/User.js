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
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'theatreOwner'],
      default: 'user',
    },
    city: {
      type: String,
      default: 'Mumbai',
    },
    favouriteGenres: [{
      type: String,
    }],
    favouriteLanguages: [{
      type: String,
    }],
    watchHistory: [{
      movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
      watchedAt: { type: Date, default: Date.now },
    }],
    watchlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
    }],
    loyaltyPoints: {
      type: Number,
      default: 100, // Welcome gift 100 CinePoints
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    preferences: {
      preferredFormat: { type: String, default: 'IMAX' },
      preferredSeatCategory: { type: String, default: 'Premium' },
      notificationsEnabled: { type: Boolean, default: true },
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      default: null,
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  { timestamps: true }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
