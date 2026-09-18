import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { RewardItem } from '../models/Reward.js';

export const toggleWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const exists = user.watchlist.some((id) => id.toString() === movieId);

    if (exists) {
      user.watchlist = user.watchlist.filter((id) => id.toString() !== movieId);
    } else {
      user.watchlist.push(movieId);
    }

    await user.save();
    res.json({
      success: true,
      inWatchlist: !exists,
      watchlist: user.watchlist,
      message: !exists ? 'Added to watchlist' : 'Removed from watchlist',
    });
  } catch (error) {
    next(error);
  }
};

export const getWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('watchlist');
    res.json({ success: true, count: user.watchlist.length, watchlist: user.watchlist });
  } catch (error) {
    next(error);
  }
};

export const getLoyaltyInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Fetch active perks directly from database catalog
    const availableRewards = await RewardItem.find({ active: true }).sort({ pointsRequired: 1 });

    const tier = user.loyaltyPoints > 1000
      ? 'Cine Elite'
      : user.loyaltyPoints > 400
      ? 'Cine Plus'
      : 'Cine Member';

    res.json({
      success: true,
      points: user.loyaltyPoints,
      walletBalance: user.walletBalance,
      tier,
      rewards: availableRewards,
    });
  } catch (error) {
    next(error);
  }
};

export const getCinemaDNA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('watchlist');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Fetch user's bookings
    const bookings = await Booking.find({ user: user._id, bookingStatus: 'confirmed' })
      .populate('movie')
      .populate('theatre');

    const genreCounts = {};
    let totalMinutes = 0;
    let movieCount = 0;
    const theatreCounts = {};
    const languageCounts = {};

    bookings.forEach((b) => {
      if (b.movie) {
        movieCount++;
        totalMinutes += b.movie.duration || 135;
        (b.movie.genres || []).forEach((g) => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
        (b.movie.languages || []).forEach((l) => {
          languageCounts[l] = (languageCounts[l] || 0) + 1;
        });
      }
      if (b.theatre) {
        theatreCounts[b.theatre.name] = (theatreCounts[b.theatre.name] || 0) + 1;
      }
    });

    // Merge preferences if not enough booking history
    (user.favouriteGenres || ['Sci-Fi', 'Action', 'Thriller']).forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 2;
    });
    (user.favouriteLanguages || ['English', 'Hindi']).forEach((l) => {
      languageCounts[l] = (languageCounts[l] || 0) + 2;
    });

    const sortedGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([genre, count]) => ({
        genre,
        score: Math.min(98, Math.max(35, count * 18)),
      }));

    const sortedTheatres = Object.entries(theatreCounts).sort((a, b) => b[1] - a[1]);
    const favoriteCinema = sortedTheatres.length > 0 ? sortedTheatres[0][0] : 'PVR ICON, Infinity Mall';

    const preferredRuntime = movieCount > 0 ? Math.round(totalMinutes / movieCount) : 148;

    const dnaProfile = {
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
      },
      archetype: sortedGenres[0]?.genre === 'Sci-Fi'
        ? 'Acoustic Visionary'
        : sortedGenres[0]?.genre === 'Thriller'
        ? 'Suspense Purist'
        : 'Cinematic Explorer',
      topGenres: sortedGenres.slice(0, 5),
      preferredRuntime: `${preferredRuntime} mins`,
      favoriteLanguages: Object.keys(languageCounts).slice(0, 3),
      favoriteCinema,
      preferredFormat: user.preferences?.preferredFormat || 'IMAX 70mm',
      watchingPattern: 'Weekend Prime Screenings',
      affinityIndex: 94,
      traits: [
        { label: 'Screen Scale Affinity', value: 'High (IMAX/Laser)' },
        { label: 'Narrative Complexity', value: '92% Non-Linear' },
        { label: 'Audio Sensitivity', value: 'Dolby Atmos Tuned' },
      ],
    };

    res.json({ success: true, cinemaDNA: dnaProfile });
  } catch (error) {
    next(error);
  }
};

export const getWatchJourney = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const bookings = await Booking.find({ user: user._id })
      .populate('movie')
      .populate('theatre')
      .sort({ createdAt: -1 });

    const reviews = await Review.find({ user: user._id });
    const reviewMap = {};
    reviews.forEach((r) => {
      reviewMap[r.movie.toString()] = r;
    });

    const journey = bookings.map((b) => {
      const rev = b.movie ? reviewMap[b.movie._id?.toString()] : null;
      return {
        id: b._id,
        bookingReference: b.bookingReference,
        movieTitle: b.movie?.title || 'Screening',
        poster: b.movie?.poster,
        theatre: b.theatre?.name || 'Multiplex',
        date: b.showDate,
        time: b.showTime,
        seatsCount: b.seats?.length || 1,
        totalAmount: b.totalAmount,
        rating: rev?.rating || null,
        userCritique: rev?.comment || null,
        status: b.bookingStatus,
      };
    });

    res.json({
      success: true,
      totalAdmissions: journey.length,
      journey,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.watchlist = user.watchlist.filter((id) => id.toString() !== movieId);
    await user.save();

    res.json({
      success: true,
      inWatchlist: false,
      watchlist: user.watchlist,
      message: 'Removed from watchlist',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    if (targetUserId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(req.user.id);
    if (!targetUser || !currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = currentUser.following?.some((id) => id.toString() === targetUserId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter((id) => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== req.user.id);
    } else {
      currentUser.following = currentUser.following || [];
      targetUser.followers = targetUser.followers || [];
      currentUser.following.push(targetUserId);
      targetUser.followers.push(req.user.id);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
      message: !isFollowing ? `Now following ${targetUser.name}` : `Unfollowed ${targetUser.name}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name avatar city loyaltyPoints followers following createdAt')
      .populate('watchlist', 'title poster rating genres');
    if (!user) return res.status(404).json({ success: false, message: 'Patron profile not found' });

    const reviews = await Review.find({ user: user._id })
      .populate('movie', 'title poster rating')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        city: user.city,
        loyaltyPoints: user.loyaltyPoints,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        memberSince: user.createdAt,
        watchlist: user.watchlist,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, city, avatar, preferences, favouriteGenres, favouriteLanguages } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (city) user.city = city;
    if (avatar) user.avatar = avatar;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (favouriteGenres) user.favouriteGenres = favouriteGenres;
    if (favouriteLanguages) user.favouriteLanguages = favouriteLanguages;

    await user.save();
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        city: user.city,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        walletBalance: user.walletBalance,
        preferences: user.preferences,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

