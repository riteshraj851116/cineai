import mongoose from 'mongoose';
import { Show } from '../models/Show.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Movie } from '../models/Movie.js';

export const getShows = async (req, res, next) => {
  try {
    const { movieId, theatreId, city, date, format } = req.query;

    const filter = { status: { $ne: 'cancelled' } };

    if (movieId) {
      if (mongoose.Types.ObjectId.isValid(movieId)) {
        filter.movie = movieId;
      } else {
        const movieDoc = await Movie.findOne({ slug: movieId });
        if (movieDoc) {
          filter.movie = movieDoc._id;
        } else {
          return res.json({ success: true, count: 0, shows: [] });
        }
      }
    }
    if (theatreId) filter.theatre = theatreId;
    if (date) filter.date = date;
    if (format) filter.format = format;

    if (city) {
      const cityTheatres = await Theatre.find({ city: new RegExp(city, 'i') }).select('_id');
      filter.theatre = { $in: cityTheatres.map((t) => t._id) };
    }

    const shows = await Show.find(filter)
      .populate('movie', 'title poster duration rating formats certification genres')
      .populate('theatre', 'name city address facilities')
      .populate('screen', 'name screenType rows columns totalSeats')
      .sort({ date: 1, startTime: 1 });

    res.json({ success: true, count: shows.length, shows });
  } catch (error) {
    next(error);
  }
};

export const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('screen');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    res.json({ success: true, show });
  } catch (error) {
    next(error);
  }
};

export const createShow = async (req, res, next) => {
  try {
    const movie = req.body.movie || req.body.movieId;
    const theatre = req.body.theatre || req.body.theatreId;
    const screen = req.body.screen || req.body.screenId;
    const { date, startTime, endTime, pricing } = req.body;
    let { language, format } = req.body;

    // Verify theatre authorization if theatreOwner
    const theatreDoc = await Theatre.findById(theatre);
    if (!theatreDoc) return res.status(404).json({ success: false, message: 'Theatre not found' });

    if (req.user.role === 'theatreOwner' && theatreDoc.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this theatre' });
    }

    const screenDoc = await Screen.findById(screen);
    const totalSeats = screenDoc ? screenDoc.totalSeats : 96;

    // Default format and language from screen/movie if not provided
    if (!format && screenDoc) {
      format = screenDoc.screenType || '2D';
    }
    if (!language && movie) {
      const movieDoc = await Movie.findById(movie);
      if (movieDoc && movieDoc.languages?.length > 0) {
        language = movieDoc.languages[0];
      }
    }

    const show = await Show.create({
      movie,
      theatre,
      screen,
      date,
      startTime,
      endTime,
      language: language || 'Hindi',
      format: format || '2D',
      pricing: pricing || { Regular: 220, Premium: 350, Recliner: 550, VIP: 750 },
      totalSeats,
      availableSeatsCount: totalSeats,
    });

    res.status(201).json({ success: true, show });
  } catch (error) {
    next(error);
  }
};

export const updateShowPricing = async (req, res, next) => {
  try {
    const { pricing } = req.body;
    const show = await Show.findById(req.params.id).populate('theatre');
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    if (req.user.role === 'theatreOwner' && show.theatre.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this theatre' });
    }

    show.pricing = { ...show.pricing, ...pricing };
    await show.save();

    res.json({ success: true, show });
  } catch (error) {
    next(error);
  }
};

export const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id).populate('theatre');
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    if (req.user.role === 'theatreOwner' && show.theatre.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this theatre' });
    }

    show.status = 'cancelled';
    await show.save();

    res.json({ success: true, message: 'Show cancelled successfully' });
  } catch (error) {
    next(error);
  }
};
