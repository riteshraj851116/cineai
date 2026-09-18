import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'cineai_super_secret_jwt_key_2026_production', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, city, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      city: city || 'Mumbai',
      role: role && ['user', 'theatreOwner'].includes(role) ? role : 'user',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        avatar: user.avatar,
        loyaltyPoints: user.loyaltyPoints,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        avatar: user.avatar,
        loyaltyPoints: user.loyaltyPoints,
        walletBalance: user.walletBalance,
        theatre: user.theatre,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('watchlist', 'title poster rating genres');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, city, avatar, favouriteGenres, favouriteLanguages, preferences } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (city) user.city = city;
    if (avatar) user.avatar = avatar;
    if (favouriteGenres) user.favouriteGenres = favouriteGenres;
    if (favouriteLanguages) user.favouriteLanguages = favouriteLanguages;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  res.json({
    success: true,
    message: `Password reset instructions sent to ${email} (Demo Mode: use the password reset form directly).`,
  });
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully. You can now login with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
};
