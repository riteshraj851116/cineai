import { Show } from '../models/Show.js';
import { Seat } from '../models/Seat.js';
import { Screen } from '../models/Screen.js';
import { SeatLockService } from '../services/seatLockService.js';

export const getShowSeats = async (req, res, next) => {
  try {
    const showId = req.params.showId;
    const show = await Show.findById(showId).populate('screen');
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    // Clean expired locks
    await SeatLockService.cleanExpiredLocks(showId);

    // Fetch master seats for this screen
    const screenSeats = await Seat.find({ screen: show.screen._id }).sort({ row: 1, number: 1 });

    const liveState = await SeatLockService.getLiveSeatState(showId);

    res.json({
      success: true,
      screen: show.screen,
      showPricing: show.pricing,
      seats: screenSeats,
      occupiedSeats: liveState.occupiedSeats,
      lockedSeats: liveState.lockedSeats,
      availableSeatsCount: liveState.availableSeatsCount,
    });
  } catch (error) {
    next(error);
  }
};
