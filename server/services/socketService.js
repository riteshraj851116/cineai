import { SeatLockService } from './seatLockService.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    const joinedShows = new Set();
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join show room for live seat tracking
    socket.on('join_show', async (showId) => {
      if (!showId) return;
      socket.join(`show:${showId}`);
      joinedShows.add(showId);
      console.log(`[Socket.IO] Socket ${socket.id} joined show:${showId}`);

      try {
        const state = await SeatLockService.getLiveSeatState(showId);
        socket.emit('seat_state_sync', state);
      } catch (err) {
        console.error('[Socket.IO] Error syncing seat state:', err.message);
      }
    });

    // Leave show room
    socket.on('leave_show', async (showId) => {
      if (!showId) return;
      socket.leave(`show:${showId}`);
      joinedShows.delete(showId);
      console.log(`[Socket.IO] Socket ${socket.id} left show:${showId}`);
      try {
        await SeatLockService.releaseAllUserLocks(showId, socket.id);
        const state = await SeatLockService.getLiveSeatState(showId);
        io.to(`show:${showId}`).emit('seat_state_sync', state);
      } catch (err) {
        console.error('[Socket.IO] Error on leave_show:', err.message);
      }
    });

    // Lock seats
    socket.on('request_lock_seats', async ({ showId, seatIds }) => {
      try {
        const result = await SeatLockService.lockSeats(showId, seatIds, socket.id);
        const state = await SeatLockService.getLiveSeatState(showId);

        // Notify entire room of updated seat state
        io.to(`show:${showId}`).emit('seat_state_sync', state);

        // Acknowledge requester
        socket.emit('lock_success', {
          seatIds,
          expiresAt: result.expiresAt,
        });
      } catch (err) {
        socket.emit('lock_error', { message: err.message });
      }
    });

    // Unlock seats
    socket.on('request_unlock_seats', async ({ showId, seatIds }) => {
      try {
        await SeatLockService.unlockSeats(showId, seatIds, socket.id);
        const state = await SeatLockService.getLiveSeatState(showId);
        io.to(`show:${showId}`).emit('seat_state_sync', state);
      } catch (err) {
        console.error('[Socket.IO] Error unlocking seats:', err.message);
      }
    });

    // Join user notification room
    socket.on('join_user_channel', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined user:${userId}`);
      }
    });

    // Handle disconnect - release all locks across joined shows
    socket.on('disconnect', async () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      for (const showId of joinedShows) {
        try {
          await SeatLockService.releaseAllUserLocks(showId, socket.id);
          const state = await SeatLockService.getLiveSeatState(showId);
          io.to(`show:${showId}`).emit('seat_state_sync', state);
        } catch (err) {
          console.error('[Socket.IO] Error cleaning locks on disconnect:', err.message);
        }
      }
      joinedShows.clear();
    });
  });
};
