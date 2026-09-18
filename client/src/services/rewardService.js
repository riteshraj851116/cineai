import apiClient from './apiClient';

/**
 * CinePoints Loyalty & Perks Service
 * Syncs loyalty balances, tier status, active rewards catalog, and voucher redemption.
 */
export const rewardService = {
  getRewardsCatalog: () => apiClient.get('/rewards'),
  redeemReward: (rewardId) => apiClient.post('/rewards/redeem', { rewardId }),
  getLoyaltyBalance: () => apiClient.get('/users/loyalty'),
};

export default rewardService;
