import express from 'express';
import {
  toggleWatchlist,
  getWatchlist,
  removeFromWatchlist,
  getLoyaltyInfo,
  getCinemaDNA,
  getWatchJourney,
  toggleFollowUser,
  getUserPublicProfile,
  updateUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/watchlist', protect, toggleWatchlist);
router.post('/watchlist/toggle', protect, toggleWatchlist);
router.get('/watchlist', protect, getWatchlist);
router.delete('/watchlist/:movieId', protect, removeFromWatchlist);

router.get('/loyalty', protect, getLoyaltyInfo);
router.get('/cinema-dna', protect, getCinemaDNA);
router.get('/watch-journey', protect, getWatchJourney);

router.put('/profile', protect, updateUserProfile);
router.post('/:id/follow', protect, toggleFollowUser);
router.get('/:id/profile', getUserPublicProfile);

export default router;

