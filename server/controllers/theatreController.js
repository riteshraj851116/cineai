import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';

export const getTheatres = async (req, res, next) => {
  try {
    const { city } = req.query;
    const filter = {};
    if (city) filter.city = new RegExp(city, 'i');

    const theatres = await Theatre.find(filter).populate('screens');
    res.json({ success: true, count: theatres.length, theatres });
  } catch (error) {
    next(error);
  }
};

export const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id).populate('screens');
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
    res.json({ success: true, theatre });
  } catch (error) {
    next(error);
  }
};

export const createTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.create({
      ...req.body,
      owner: req.user.id,
    });
    res.status(201).json({ success: true, theatre });
  } catch (error) {
    next(error);
  }
};

export const updateTheatre = async (req, res, next) => {
  try {
    let theatre = await Theatre.findById(req.params.id);
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });

    // Ensure theatreOwner can only update their own theatre (admin can update all)
    if (req.user.role === 'theatreOwner' && theatre.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this theatre' });
    }

    theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, theatre });
  } catch (error) {
    next(error);
  }
};
