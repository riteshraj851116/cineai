import express from 'express';
import {
  chatWithAssistant,
  naturalLanguageSearch,
  explainMovie,
  recommendCinemas,
  recommendShowtimes,
  discoverByMood,
  getReviewSummary,
  getSeatRecommendations,
  planWeekend,
  getGroupSeatClusters,
} from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', optionalAuth, chatWithAssistant);
router.post('/search', naturalLanguageSearch);
router.get('/explain/:movieId', explainMovie);
router.post('/recommend-cinemas', recommendCinemas);
router.post('/recommend-showtimes', recommendShowtimes);
router.post('/mood', discoverByMood);
router.post('/mood-match', discoverByMood);
router.get('/review-summary/:movieId', getReviewSummary);
router.post('/recommend-seats', getSeatRecommendations);
router.post('/weekend-planner', planWeekend);
router.post('/group-seats', getGroupSeatClusters);

export default router;
