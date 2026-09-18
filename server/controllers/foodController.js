import { FoodItem } from '../models/FoodItem.js';

export const getFoodItems = async (req, res, next) => {
  try {
    const { theatreId, category } = req.query;
    const filter = { available: true };

    if (theatreId) {
      filter.$or = [{ theatre: theatreId }, { theatre: null }];
    }
    if (category) {
      filter.category = category;
    }

    const items = await FoodItem.find(filter).sort({ category: 1, price: 1 });
    res.json({ success: true, count: items.length, items, foodItems: items });
  } catch (error) {
    next(error);
  }
};

export const createFoodItem = async (req, res, next) => {
  try {
    const foodItem = await FoodItem.create(req.body);
    res.status(201).json({ success: true, foodItem });
  } catch (error) {
    next(error);
  }
};

export const updateFoodItem = async (req, res, next) => {
  try {
    const foodItem = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!foodItem) return res.status(404).json({ success: false, message: 'Food item not found' });
    res.json({ success: true, foodItem });
  } catch (error) {
    next(error);
  }
};

export const deleteFoodItem = async (req, res, next) => {
  try {
    const foodItem = await FoodItem.findByIdAndDelete(req.params.id);
    if (!foodItem) return res.status(404).json({ success: false, message: 'Food item not found' });
    res.json({ success: true, message: 'Food item deleted' });
  } catch (error) {
    next(error);
  }
};
