import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema(
  {
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      default: null, // null means global cinema menu
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['Popcorn', 'Beverages', 'Combos', 'Hot Snacks', 'Desserts'],
      default: 'Popcorn',
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const FoodItem = mongoose.model('FoodItem', foodItemSchema);
