import express from 'express';
import { getRewards, redeemReward } from '../controllers/rewardController.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalProtect, getRewards);
router.post('/redeem', protect, redeemReward);

export default router;
