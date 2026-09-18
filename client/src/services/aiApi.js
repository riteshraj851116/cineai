import { aiService } from './aiService';

export const aiApi = {
  ...aiService,
  chat: aiService.askAIConcierge,
  search: aiService.searchMoviesNeural,
  naturalLanguageSearch: aiService.searchMoviesNeural,
  recommendSeats: aiService.getSeatRecommendations,
};
export default aiApi;

