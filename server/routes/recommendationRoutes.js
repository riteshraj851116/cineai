import express from 'express';
import { RecommendationService } from '../services/recommendationService.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const recommendations = await RecommendationService.getRecommendations(userId);
    res.json({ success: true, ...recommendations });
  } catch (error) {
    next(error);
  }
});

router.get('/similar/:movieId', async (req, res, next) => {
  try {
    const movies = await RecommendationService.getSimilarMovies(req.params.movieId);
    res.json({ success: true, count: movies.length, movies });
  } catch (error) {
    next(error);
  }
});

export default router;
