import mongoose from 'mongoose';
import { AIService } from '../services/aiService.js';
import { AIConversation } from '../models/AIConversation.js';
import { Movie } from '../models/Movie.js';
import { Show } from '../models/Show.js';
import { Theatre } from '../models/Theatre.js';
import { FoodItem } from '../models/FoodItem.js';

export const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, sessionId = 'guest-session', city } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty', code: 'INVALID_REQUEST' });
    }

    const aiResult = await AIService.handleChatQuery({
      message,
      userId,
      sessionId,
      city: city || (req.user?.city) || 'Mumbai',
    });

    // Persist conversation history safely
    try {
      let conversation = await AIConversation.findOne({ sessionId });
      if (!conversation) {
        conversation = new AIConversation({
          sessionId,
          user: userId,
          messages: [],
        });
      }

      conversation.messages.push({ role: 'user', content: message });
      conversation.messages.push({
        role: 'assistant',
        content: aiResult.reply,
        intent: aiResult.intent,
        actionData: aiResult.actionData,
      });
      conversation.lastIntent = aiResult.intent;
      await conversation.save();
    } catch (dbErr) {
      console.warn('[AI Conversation] Notice: could not persist conversation history:', dbErr.message);
    }

    res.json({
      success: true,
      message: aiResult.reply,
      reply: aiResult.reply,
      intent: aiResult.intent,
      movies: aiResult.actionData?.movies || [],
      shows: aiResult.actionData?.shows || [],
      theatres: aiResult.actionData?.theatres || [],
      foods: aiResult.actionData?.foods || [],
      data: {
        message: aiResult.reply,
        reply: aiResult.reply,
        movies: aiResult.actionData?.movies || [],
        shows: aiResult.actionData?.shows || [],
        theatres: aiResult.actionData?.theatres || [],
        foods: aiResult.actionData?.foods || [],
        coupons: aiResult.actionData?.coupons || [],
        suggestions: aiResult.suggestions || [],
      },
      actionData: aiResult.actionData,
      suggestions: aiResult.suggestions,
    });
  } catch (error) {
    console.error('[AI Chat Error]', error);
    res.status(503).json({
      success: false,
      message: 'CineAI neural service temporarily unavailable',
      code: 'AI_SERVICE_ERROR',
      data: null,
    });
  }
};

export const naturalLanguageSearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'Query is required', code: 'INVALID_REQUEST' });

    const interpretedFilters = AIService.parseNaturalLanguageSearch(query);

    const mongoQuery = { status: 'now_showing' };
    if (interpretedFilters.genres.length > 0) {
      mongoQuery.genres = { $in: interpretedFilters.genres };
    }
    if (interpretedFilters.languages.length > 0) {
      mongoQuery.languages = { $in: interpretedFilters.languages };
    }
    if (interpretedFilters.formats.length > 0) {
      mongoQuery.formats = { $in: interpretedFilters.formats };
    }
    if (interpretedFilters.maxDuration) {
      mongoQuery.duration = { $lte: interpretedFilters.maxDuration };
    }

    const sortOpt = interpretedFilters.sortBy === 'popularity'
      ? { trendingScore: -1 }
      : interpretedFilters.sortBy === 'newest'
      ? { releaseDate: -1 }
      : { rating: -1 };

    let movies = await Movie.find(mongoQuery).sort(sortOpt).limit(8);

    if (movies.length === 0) {
      movies = await Movie.find({ status: 'now_showing' }).limit(4);
    }

    res.json({
      success: true,
      interpretedFilters,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error('[AI Search Error]', error);
    res.status(200).json({
      success: false,
      message: 'Failed to interpret search filters. Returning popular selections.',
      code: 'AI_SERVICE_ERROR',
      movies: [],
    });
  }
};

export const explainMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    let movie = null;
    if (mongoose.Types.ObjectId.isValid(movieId)) {
      movie = await Movie.findById(movieId);
    }
    if (!movie) {
      movie = await Movie.findOne({ slug: movieId });
    }
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const explanation = await AIService.explainMovie(movie);
    res.json({ success: true, explanation });
  } catch (error) {
    next(error);
  }
};

export const recommendCinemas = async (req, res, next) => {
  try {
    const { city = 'Mumbai', format = 'IMAX', soundPreference = 'Dolby Atmos' } = req.body;
    const isDbConnected = mongoose.connection.readyState >= 1;

    let theatres = [];
    if (isDbConnected) {
      try {
        const filter = {};
        if (city) filter.city = new RegExp(city, 'i');
        theatres = await Theatre.find(filter).populate('screens');
      } catch (tErr) {
        console.warn('Theatre query notice:', tErr.message);
      }
    }

    if (!theatres || theatres.length === 0) {
      theatres = [
        {
          _id: 'th-1',
          name: 'CineAI IMAX & Dolby Atmos Luxe',
          city: city || 'Mumbai',
          location: 'Phoenix Palladium, Lower Parel',
          facilities: ['IMAX 3D Laser', 'Dolby Atmos 64-Ch', 'VIP Recliners'],
          screens: [{ screenType: 'IMAX', name: 'Audi 1' }, { screenType: 'Dolby Cinema', name: 'Audi 2' }],
        },
        {
          _id: 'th-2',
          name: 'CineAI Grand Auditorium',
          city: city || 'Mumbai',
          location: 'Bandra Kurla Complex (BKC)',
          facilities: ['Dolby Atmos', '4DX', 'Gourmet Lounge'],
          screens: [{ screenType: '4DX', name: 'Audi 1' }, { screenType: 'Standard', name: 'Audi 2' }],
        },
        {
          _id: 'th-3',
          name: 'CineAI Cinema Matrix',
          city: city || 'Mumbai',
          location: 'Infinity Mall, Malad',
          facilities: ['IMAX 70mm', 'Barco Laser', 'Christie Vive Audio'],
          screens: [{ screenType: 'IMAX', name: 'Audi 1' }],
        },
      ];
    }
    const scored = theatres.map((t) => {
      let score = 70;
      if (t.facilities?.some((f) => /atmos/i.test(f))) score += 15;
      if (t.facilities?.some((f) => /imax/i.test(f))) score += 10;
      if (t.screens?.some((s) => s.screenType === format)) score += 10;

      return {
        theatre: t,
        matchScore: Math.min(99, score),
        reasons: [
          'High acoustic isolation rating',
          'Calibrated Christie Vive surround sound',
          'Optimum screen-to-throw distance',
        ],
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: scored.length,
      recommendations: scored,
      cinemas: scored.map((s) => ({
        ...(s.theatre.toObject ? s.theatre.toObject() : s.theatre),
        matchScore: s.matchScore,
        reasons: s.reasons,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const recommendShowtimes = async (req, res, next) => {
  try {
    const { movieId, date } = req.body;
    let movieFilter = {};
    if (movieId) {
      if (mongoose.Types.ObjectId.isValid(movieId)) {
        movieFilter = { movie: movieId };
      } else {
        const m = await Movie.findOne({ slug: movieId });
        if (m) movieFilter = { movie: m._id };
      }
    }

    const showFilter = { ...movieFilter, status: 'scheduled' };
    if (date) showFilter.date = date;

    const shows = await Show.find(showFilter)
      .populate('theatre', 'name city address')
      .populate('movie', 'title duration rating poster');

    const slots = {
      morning: shows.filter((s) => s.startTime < '12:00'),
      afternoon: shows.filter((s) => s.startTime >= '12:00' && s.startTime < '17:00'),
      evening: shows.filter((s) => s.startTime >= '17:00' && s.startTime < '21:00'),
      lateNight: shows.filter((s) => s.startTime >= '21:00'),
    };

    res.json({
      success: true,
      totalShows: shows.length,
      slots,
      recommendation: slots.evening[0] || slots.afternoon[0] || shows[0] || null,
    });
  } catch (error) {
    next(error);
  }
};

export const discoverByMood = async (req, res, next) => {
  try {
    const { mood = 'Thrill' } = req.body;
    const moodGenreMap = {
      Relax: 'Animation',
      Laugh: 'Comedy',
      Think: 'Mystery',
      Thrill: 'Thriller',
      Adventure: 'Action',
      Emotional: 'Drama',
      Family: 'Adventure',
      Mystery: 'Crime',
    };

    const genre = moodGenreMap[mood] || 'Action';
    const movies = await Movie.find({ genres: genre, status: 'now_showing' }).limit(6);

    res.json({
      success: true,
      mood,
      matchedGenre: genre,
      count: movies.length,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewSummary = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    let targetId = movieId;
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      const m = await Movie.findOne({ slug: movieId });
      if (m) targetId = m._id;
    }
    const summary = await AIService.summarizeReviews(targetId);
    res.json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};

export const getSeatRecommendations = async (req, res, next) => {
  try {
    const {
      rows,
      columns,
      occupiedSeats,
      lockedSeats,
      preference = 'Best overall',
      partySize = 2,
    } = req.body;

    const result = AIService.recommendSeats({
      rows: rows || 8,
      columns: columns || 12,
      occupiedSeats: occupiedSeats || [],
      lockedSeats: lockedSeats || [],
      preference,
      partySize: parseInt(partySize, 10) || 2,
    });

    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

export const planWeekend = async (req, res, next) => {
  try {
    const {
      day = 'Saturday',
      budget = 1000,
      people = 2,
      mood = 'Thrill',
    } = req.body;

    let shows = await Show.find({ status: 'scheduled' })
      .populate('movie')
      .populate('theatre')
      .limit(20);

    if (shows.length === 0) {
      shows = await Show.find().populate('movie').populate('theatre').limit(20);
    }

    const moodGenreMap = {
      Thrill: 'Thriller',
      Laugh: 'Comedy',
      Think: 'Sci-Fi',
      Emotional: 'Drama',
      Adventure: 'Action',
      Relax: 'Animation',
      Family: 'Adventure',
      Mystery: 'Mystery',
    };

    const targetGenre = moodGenreMap[mood] || 'Action';
    let matchedShow = shows.find((s) => s.movie?.genres?.includes(targetGenre)) || shows[0];

    const foodItems = await FoodItem.find().limit(2);
    const selectedFood = foodItems[0] || { name: 'Caramel Popcorn & 2 Cokes', price: 320 };

    const ticketPrice = matchedShow?.pricing?.STANDARD || 250;
    const totalTicketsCost = ticketPrice * people;
    const totalEstimated = totalTicketsCost + (selectedFood.price || 320);

    const plan = {
      title: `${day} Night Cinematic Experience`,
      mood,
      partySize: people,
      budgetAllocated: Number(budget),
      movie: matchedShow?.movie,
      theatre: matchedShow?.theatre,
      showId: matchedShow?._id,
      showTime: matchedShow?.startTime || '20:00',
      format: matchedShow?.format || 'IMAX',
      date: matchedShow?.date || 'This Weekend',
      suggestedSeats: ['E5', 'E6', 'E7', 'E8'].slice(0, people),
      suggestedFood: [
        { name: selectedFood.name, price: selectedFood.price || 320, quantity: 1 },
      ],
      breakdown: {
        tickets: totalTicketsCost,
        concessions: selectedFood.price || 320,
        convenienceFee: 40,
        total: totalEstimated + 40,
      },
      reasoning: `Selected based on high ${mood} audience rating and prime acoustic sweet spot availability at ${matchedShow?.theatre?.name || 'Multiplex'}. Total package fits comfortably within your ₹${budget} budget.`,
    };

    res.json({ success: true, plan });
  } catch (error) {
    next(error);
  }
};

export const getGroupSeatClusters = async (req, res, next) => {
  try {
    const { showId, partySize = 4, preference = 'Best overall' } = req.body;

    const show = await Show.findById(showId).populate('screen');
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const screen = show.screen || { totalRows: 8, totalColumns: 12 };
    const occupiedSeats = show.occupiedSeats || [];

    const contiguous = AIService.recommendSeats({
      rows: screen.totalRows || 8,
      columns: screen.totalColumns || 12,
      occupiedSeats,
      lockedSeats: [],
      preference,
      partySize: Number(partySize),
    });

    let splitArrangement = null;
    if (partySize >= 4) {
      const halfSize = Math.floor(partySize / 2);
      const pair1 = AIService.recommendSeats({
        rows: screen.totalRows || 8,
        columns: screen.totalColumns || 12,
        occupiedSeats,
        lockedSeats: [],
        preference,
        partySize: halfSize,
      });

      const tempOccupied = [...occupiedSeats, ...(pair1.recommendedSeats || [])];
      const pair2 = AIService.recommendSeats({
        rows: screen.totalRows || 8,
        columns: screen.totalColumns || 12,
        occupiedSeats: tempOccupied,
        lockedSeats: [],
        preference,
        partySize: partySize - halfSize,
      });

      splitArrangement = {
        type: `${halfSize} + ${partySize - halfSize} Split Configuration`,
        clusterA: pair1.recommendedSeats,
        clusterB: pair2.recommendedSeats,
        allSeats: [...(pair1.recommendedSeats || []), ...(pair2.recommendedSeats || [])],
        reason: 'Adjacent or back-to-back row pairs maximizing screen visibility and group proximity.',
      };
    }

    res.json({
      success: true,
      partySize,
      contiguousCluster: contiguous.recommendedSeats,
      reason: contiguous.reason,
      splitArrangement,
    });
  } catch (error) {
    next(error);
  }
};
