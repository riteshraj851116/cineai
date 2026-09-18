import { Show } from '../models/Show.js';
import { SEAT_LOCK_TTL_SECONDS } from '../config/constants.js';

export class SeatLockService {
  /**
   * Clean expired locks for a show
   */
  static async cleanExpiredLocks(showId) {
    const now = new Date();
    const show = await Show.findById(showId);
    if (!show) return null;

    const initialCount = show.lockedSeats.length;
    show.lockedSeats = show.lockedSeats.filter((lock) => new Date(lock.expiresAt) > now);

    if (show.lockedSeats.length !== initialCount) {
      await show.save();
    }
    return show;
  }

  /**
   * Attempt to lock an array of seat IDs for a given show
   */
  static async lockSeats(showId, seatIds, lockedById, socketId = null) {
    await this.cleanExpiredLocks(showId);

    const show = await Show.findById(showId);
    if (!show) {
      throw new Error('Show not found');
    }

    // Check if any seat is already occupied
    for (const seatId of seatIds) {
      if (show.occupiedSeats.includes(seatId)) {
        throw new Error(`Seat ${seatId} is already booked and occupied.`);
      }
    }

    const now = new Date();
    // Check if any seat is currently locked by someone else (not by this user and not by this user's socket)
    for (const seatId of seatIds) {
      const activeLock = show.lockedSeats.find(
        (lock) =>
          lock.seatId === seatId &&
          new Date(lock.expiresAt) > now &&
          String(lock.lockedBy) !== String(lockedById) &&
          (!socketId || String(lock.lockedBy) !== String(socketId))
      );
      if (activeLock) {
        throw new Error(`Seat ${seatId} is temporarily reserved by another guest.`);
      }
    }

    // Filter out existing locks by this user or their socket to refresh TTL and claim permanently
    const expiryDate = new Date(Date.now() + SEAT_LOCK_TTL_SECONDS * 1000);
    show.lockedSeats = show.lockedSeats.filter(
      (lock) =>
        !(
          seatIds.includes(lock.seatId) &&
          (String(lock.lockedBy) === String(lockedById) || (socketId && String(lock.lockedBy) === String(socketId)))
        )
    );

    // Add new locks assigned to the authenticated user ID
    for (const seatId of seatIds) {
      show.lockedSeats.push({
        seatId,
        lockedBy: lockedById,
        lockedAt: now,
        expiresAt: expiryDate,
      });
    }

    await show.save();

    return {
      lockedSeats: show.lockedSeats,
      expiresAt: expiryDate,
    };
  }

  /**
   * Release specific locks held by user/socket
   */
  static async unlockSeats(showId, seatIds, lockedById) {
    const show = await Show.findById(showId);
    if (!show) return null;

    show.lockedSeats = show.lockedSeats.filter(
      (lock) => !(seatIds.includes(lock.seatId) && String(lock.lockedBy) === String(lockedById))
    );

    await show.save();
    return show.lockedSeats;
  }

  /**
   * Release all locks held by a user/socket for a show
   */
  static async releaseAllUserLocks(showId, lockedById) {
    const show = await Show.findById(showId);
    if (!show) return null;

    show.lockedSeats = show.lockedSeats.filter((lock) => String(lock.lockedBy) !== String(lockedById));
    await show.save();
    return show.lockedSeats;
  }

  /**
   * Permanently mark seats as occupied when payment succeeds
   */
  static async confirmSeatsOccupied(showId, seatIds) {
    const show = await Show.findById(showId);
    if (!show) throw new Error('Show not found');

    // Add to occupiedSeats if not present
    for (const seatId of seatIds) {
      if (!show.occupiedSeats.includes(seatId)) {
        show.occupiedSeats.push(seatId);
      }
    }

    // Remove from lockedSeats
    show.lockedSeats = show.lockedSeats.filter((lock) => !seatIds.includes(lock.seatId));
    show.availableSeatsCount = Math.max(0, show.totalSeats - show.occupiedSeats.length);

    await show.save();
    return show;
  }

  /**
   * Release occupied seats on cancellation
   */
  static async releaseOccupiedSeats(showId, seatIds) {
    const show = await Show.findById(showId);
    if (!show) throw new Error('Show not found');

    show.occupiedSeats = show.occupiedSeats.filter((s) => !seatIds.includes(s));
    show.availableSeatsCount = Math.max(0, show.totalSeats - show.occupiedSeats.length);

    await show.save();
    return show;
  }

  /**
   * Get live seat state for a show
   */
  static async getLiveSeatState(showId) {
    await this.cleanExpiredLocks(showId);
    const show = await Show.findById(showId);
    if (!show) throw new Error('Show not found');

    const now = new Date();
    const activeLocks = show.lockedSeats.filter((l) => new Date(l.expiresAt) > now);

    return {
      occupiedSeats: show.occupiedSeats || [],
      lockedSeats: activeLocks.map((l) => ({
        seatId: l.seatId,
        lockedBy: l.lockedBy,
        expiresAt: l.expiresAt,
      })),
      availableSeatsCount: show.availableSeatsCount,
      pricing: show.pricing,
    };
  }
}
