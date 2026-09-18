import express from 'express';
import {
  getReviewsByMovie,
  getCommunityFeed,
  addReview,
  updateReview,
  likeReview,
  deleteReview,
  addCommentToReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCommunityFeed);
router.get('/feed', getCommunityFeed);
router.get('/movie/:movieId', getReviewsByMovie);
router.post('/', protect, addReview);
router.put('/:id', protect, updateReview);
router.post('/:id/like', protect, likeReview);
router.post('/:id/comment', protect, addCommentToReview);
router.delete('/:id', protect, deleteReview);

export default router;

