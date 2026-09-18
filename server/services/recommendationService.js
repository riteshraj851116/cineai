import { Movie } from '../models/Movie.js';
import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';

export class RecommendationService {
  /**
   * Get multi-tiered recommendations for user or guest
   */
  static async getRecommendations(userId = null) {
    let user = null;
    let preferredGenres = ['Action', 'Sci-Fi', 'Thriller'];
    let preferredLanguages = ['Hindi', 'English'];
    let watchedMovieIds = [];

    if (userId) {
      user = await User.findById(userId).populate('watchHistory.movie');
      if (user) {
        if (user.favouriteGenres?.length > 0) preferredGenres = user.favouriteGenres;
        if (user.favouriteLanguages?.length > 0) preferredLanguages = user.favouriteLanguages;
        watchedMovieIds = user.watchHistory?.map((w) => w.movie?._id).filter(Boolean) || [];
      }
    }

    // 1. Trending Now
    const trending = await Movie.find({ status: 'now_showing' })
      .sort({ trendingScore: -1, rating: -1 })
      .limit(6);

    // 2. Recommended For You (matches preferred genres or languages)
    const recommendedForYou = await Movie.find({
      _id: { $nin: watchedMovieIds },
      status: 'now_showing',
      $or: [
        { genres: { $in: preferredGenres } },
        { languages: { $in: preferredLanguages } },
      ],
    })
      .sort({ rating: -1 })
      .limit(6);

    // 3. Based On Your Taste (high rating + genre affinity)
    const basedOnTaste = await Movie.find({
      _id: { $nin: watchedMovieIds },
      genres: { $in: preferredGenres },
    })
      .sort({ rating: -1 })
      .limit(6);

    // 4. Hidden Gems (rating >= 8.4, distinct or niche appeal)
    const hiddenGems = await Movie.find({
      rating: { $gte: 8.4 },
      status: { $in: ['now_showing', 'upcoming'] },
    })
      .sort({ rating: -1 })
      .skip(2)
      .limit(6);

    // 5. Because You Watched
    let becauseYouWatched = null;
    if (user && user.watchHistory?.length > 0) {
      const lastWatched = user.watchHistory[user.watchHistory.length - 1].movie;
      if (lastWatched) {
        const similar = await Movie.find({
          _id: { $ne: lastWatched._id },
          genres: { $in: lastWatched.genres },
          status: 'now_showing',
        }).limit(6);

        becauseYouWatched = {
          sourceMovie: lastWatched.title,
          movies: similar,
        };
      }
    }

    return {
      trending,
      recommendedForYou: recommendedForYou.length > 0 ? recommendedForYou : trending,
      basedOnTaste: basedOnTaste.length > 0 ? basedOnTaste : trending,
      hiddenGems,
      becauseYouWatched,
    };
  }

  /**
   * Get movies similar to a given movie
   */
  static async getSimilarMovies(movieId) {
    const movie = await Movie.findById(movieId);
    if (!movie) return [];

    return await Movie.find({
      _id: { $ne: movie._id },
      genres: { $in: movie.genres },
      status: 'now_showing',
    })
      .sort({ rating: -1 })
      .limit(4);
  }
}
