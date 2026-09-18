import React from 'react';
import { Sparkles } from 'lucide-react';
import { Seat } from './Seat';
import { SeatLegend } from './SeatLegend';

export const SeatMap = ({
  screen,
  seatsMaster,
  occupiedSeats,
  lockedSeats,
  selectedSeats,
  recommendedSeats,
  pricing,
  socketId,
  onSeatClick,
  onOpenAIAssistant,
  aiReason,
}) => {
  // Group seats by row
  const rowsMap = {};
  seatsMaster.forEach((seat) => {
    if (!rowsMap[seat.row]) rowsMap[seat.row] = [];
    rowsMap[seat.row].push(seat);
  });

  return (
    <div className="zone-seat-map">
      {/* AI Assistant Trigger Button */}
      <div className="ai-seat-btn-wrap">
        <button onClick={onOpenAIAssistant} className="ai-find-seats-btn">
          <Sparkles size={14} color="var(--cinema-accent)" />
          <span>✦ FIND MY BEST SEATS</span>
        </button>
      </div>

      {aiReason && (
        <div style={{ fontSize: '0.72rem', color: 'var(--cinema-text-secondary)', marginBottom: '16px', textAlign: 'center', maxWidth: '500px' }}>
          ✦ CineAI Insight: <span style={{ color: '#FFFFFF' }}>{aiReason}</span>
        </div>
      )}

      {/* Screen Arc */}
      <div className="cinema-screen-wrap">
        <div className="cinema-screen-arc" />
        <div className="cinema-screen-label">SCREEN PROJECTION SURFACE</div>
      </div>

      {/* Realistic Cinema Seating Matrix */}
      <div className="cinema-seats-matrix">
        {Object.keys(rowsMap)
          .sort()
          .reverse()
          .map((rowLetter) => (
            <div key={rowLetter} className="cinema-seat-row">
              <span className="cinema-row-label">{rowLetter}</span>
              {rowsMap[rowLetter].map((seat) => {
                const isOccupied = occupiedSeats.includes(seat.seatId);
                const isLocked = lockedSeats.some(
                  (l) => l.seatId === seat.seatId && l.lockedBy !== socketId
                );
                const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);
                const isRec = recommendedSeats.includes(seat.seatId);
                const price = pricing?.[seat.category] || 250;

                return (
                  <Seat
                    key={seat.seatId}
                    seat={seat}
                    price={price}
                    isOccupied={isOccupied}
                    isLocked={isLocked}
                    isSelected={isSelected}
                    isRecommended={isRec}
                    onClick={onSeatClick}
                  />
                );
              })}
              <span className="cinema-row-label">{rowLetter}</span>
            </div>
          ))}
      </div>

      {/* Minimal Legend */}
      <SeatLegend />
    </div>
  );
};
