import { Review } from '../models/Review.js';
import { Movie } from '../models/Movie.js';
import { User } from '../models/User.js';

import mongoose from 'mongoose';

export const getReviewsByMovie = async (req, res, next) => {
  try {
    let targetMovieId = req.params.movieId;
    if (!mongoose.Types.ObjectId.isValid(targetMovieId)) {
      const movieDoc = await Movie.findOne({ slug: targetMovieId });
      if (movieDoc) {
        targetMovieId = movieDoc._id;
      } else {
        return res.json({ success: true, count: 0, reviews: [] });
      }
    }

    const reviews = await Review.find({ movie: targetMovieId })
      .populate('user', 'name avatar city')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { movieId, rating, comment, aspects } = req.body;

    // Check duplicate
    const existing = await Review.findOne({ movie: movieId, user: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this movie. You can edit your existing review.' });
    }

    // Determine sentiment based on rating
    let sentiment = 'positive';
    if (rating <= 2) sentiment = 'negative';
    else if (rating === 3) sentiment = 'mixed';

    const review = await Review.create({
      user: req.user.id,
      movie: movieId,
      rating,
      comment,
      aspects: aspects || { story: 4, acting: 4, direction: 4, music: 4, visuals: 5, pacing: 4 },
      sentiment,
    });

    // Update Movie average rating & review count
    const allReviews = await Review.find({ movie: movieId });
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

    await Movie.findByIdAndUpdate(movieId, {
      rating: Number(avgRating.toFixed(1)),
      reviewCount: allReviews.length,
    });

    // Award 25 CinePoints for review
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { loyaltyPoints: 25 },
    });

    res.status(201).json({ success: true, review, message: 'Review posted! You earned 25 CinePoints.' });
  } catch (error) {
    next(error);
  }
};

export const likeReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const userIdStr = req.user.id.toString();
    const alreadyLiked = review.likes.some((id) => id.toString() === userIdStr);

    if (alreadyLiked) {
      review.likes = review.likes.filter((id) => id.toString() !== userIdStr);
    } else {
      review.likes.push(req.user.id);
    }

    await review.save();
    res.json({ success: true, likesCount: review.likes.length, isLiked: !alreadyLiked });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment, aspects } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this review' });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (aspects !== undefined) review.aspects = aspects;

    if (review.rating <= 2) review.sentiment = 'negative';
    else if (review.rating === 3) review.sentiment = 'mixed';
    else review.sentiment = 'positive';

    await review.save();

    // Recalculate movie average rating
    const allReviews = await Review.find({ movie: review.movie });
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
    await Movie.findByIdAndUpdate(review.movie, {
      rating: Number(avgRating.toFixed(1)),
    });

    res.json({ success: true, review, message: 'Review updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const addCommentToReview = async (req, res, next) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Discussion review not found' });

    review.comments.push({
      user: req.user.id,
      comment: comment.trim(),
      createdAt: new Date(),
    });

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar city')
      .populate('comments.user', 'name avatar city');

    res.status(201).json({
      success: true,
      comments: populatedReview.comments,
      message: 'Comment added to discussion',
    });
  } catch (error) {
    next(error);
  }
};

export const getCommunityFeed = async (req, res, next) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const reviews = await Review.find()
      .populate('user', 'name avatar city loyaltyPoints')
      .populate('movie', 'title poster backdrop rating duration genres releaseDate')
      .populate('comments.user', 'name avatar city')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};


