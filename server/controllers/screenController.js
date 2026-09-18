import { Screen } from '../models/Screen.js';
import { Theatre } from '../models/Theatre.js';
import { Seat } from '../models/Seat.js';

export const getScreensByTheatre = async (req, res, next) => {
  try {
    const screens = await Screen.find({ theatre: req.params.theatreId });
    res.json({ success: true, screens });
  } catch (error) {
    next(error);
  }
};

export const createScreen = async (req, res, next) => {
  try {
    const { theatreId, name, screenType, rows = 8, columns = 12, seatCategories } = req.body;

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });

    if (req.user.role === 'theatreOwner' && theatre.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this theatre' });
    }

    const defaultCategories = seatCategories || [
      { name: 'Regular', rows: ['A', 'B'], basePrice: 220 },
      { name: 'Premium', rows: ['C', 'D', 'E'], basePrice: 350 },
      { name: 'Recliner', rows: ['F', 'G'], basePrice: 550 },
      { name: 'VIP', rows: ['H'], basePrice: 750 },
    ];

    const screen = await Screen.create({
      theatre: theatreId,
      name,
      screenType,
      rows,
      columns,
      totalSeats: rows * columns,
      seatCategories: defaultCategories,
    });

    theatre.screens.push(screen._id);
    await theatre.save();

    // Auto-generate seats for this screen
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].slice(0, rows);
    const seatsToInsert = [];

    rowLetters.forEach((row) => {
      let category = 'Regular';
      defaultCategories.forEach((cat) => {
        if (cat.rows.includes(row)) category = cat.name;
      });

      for (let col = 1; col <= columns; col++) {
        seatsToInsert.push({
          screen: screen._id,
          row,
          number: col,
          seatId: `${row}${col}`,
          category,
          priceMultiplier: category === 'VIP' ? 2.2 : category === 'Recliner' ? 1.8 : category === 'Premium' ? 1.35 : 1.0,
        });
      }
    });

    await Seat.insertMany(seatsToInsert);

    res.status(201).json({ success: true, screen });
  } catch (error) {
    next(error);
  }
};

export const getScreenLayout = async (req, res, next) => {
  try {
    const screen = await Screen.findById(req.params.id);
    if (!screen) return res.status(404).json({ success: false, message: 'Screen not found' });

    const seats = await Seat.find({ screen: screen._id }).sort({ row: 1, number: 1 });

    res.json({
      success: true,
      screen,
      seats,
    });
  } catch (error) {
    next(error);
  }
};

export const getScreenById = async (req, res, next) => {
  try {
    const screen = await Screen.findById(req.params.id).populate('theatre', 'name city');
    if (!screen) return res.status(404).json({ success: false, message: 'Screen not found' });
    res.json({ success: true, screen });
  } catch (error) {
    next(error);
  }
};

export const updateScreen = async (req, res, next) => {
  try {
    const screen = await Screen.findById(req.params.id).populate('theatre');
    if (!screen) return res.status(404).json({ success: false, message: 'Screen not found' });

    if (req.user.role === 'theatreOwner' && screen.theatre?.owner?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this screen' });
    }

    const updated = await Screen.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, screen: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteScreen = async (req, res, next) => {
  try {
    const screen = await Screen.findById(req.params.id).populate('theatre');
    if (!screen) return res.status(404).json({ success: false, message: 'Screen not found' });

    if (req.user.role === 'theatreOwner' && screen.theatre?.owner?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this screen' });
    }

    await Screen.findByIdAndDelete(req.params.id);
    await Seat.deleteMany({ screen: req.params.id });
    res.json({ success: true, message: 'Screen and seats removed successfully' });
  } catch (error) {
    next(error);
  }
};

