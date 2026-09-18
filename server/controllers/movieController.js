import { Movie } from '../models/Movie.js';
import { Show } from '../models/Show.js';
import { Theatre } from '../models/Theatre.js';

export const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      format,
      city,
      minRating,
      maxDuration,
      status,
      sort = 'rating',
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (genre) {
      const genresArray = genre.split(',');
      filter.genres = { $in: genresArray };
    }

    if (language) {
      const langsArray = language.split(',');
      filter.languages = { $in: langsArray };
    }

    if (format) {
      const formatsArray = format.split(',');
      filter.formats = { $in: formatsArray };
    }

    if (status) {
      filter.status = status;
    }

    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    if (maxDuration) {
      filter.duration = { $lte: parseInt(maxDuration, 10) };
    }

    // If city is specified, find movies that have active shows in that city
    if (city) {
      const cityTheatres = await Theatre.find({ city: new RegExp(city, 'i') }).select('_id');
      const theatreIds = cityTheatres.map((t) => t._id);
      const activeShows = await Show.find({ theatre: { $in: theatreIds }, status: 'scheduled' }).select('movie');
      const movieIdsInCity = activeShows.map((s) => s.movie);
      filter._id = { $in: movieIdsInCity };
    }

    let sortOption = {};
    if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'popularity') sortOption = { trendingScore: -1, reviewCount: -1 };
    else if (sort === 'newest') sortOption = { releaseDate: -1 };
    else if (sort === 'duration') sortOption = { duration: 1 };

    const movies = await Movie.find(filter).sort(sortOption);

    res.json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

import mongoose from 'mongoose';

export const getMovieById = async (req, res, next) => {
  try {
    let movie = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      movie = await Movie.findById(req.params.id);
    }
    if (!movie) {
      movie = await Movie.findOne({ slug: req.params.id });
    }
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.json({
      success: true,
      movie,
    });
  } catch (error) {
    next(error);
  }
};

export const getMovieBySlug = async (req, res, next) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.json({
      success: true,
      movie,
    });
  } catch (error) {
    next(error);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, movie });
  } catch (error) {
    next(error);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, movie });
  } catch (error) {
    next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, message: 'Movie removed' });
  } catch (error) {
    next(error);
  }
};
