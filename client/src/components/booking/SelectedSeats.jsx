import React from 'react';

export const SelectedSeats = ({ selectedSeats, pricing, onRemoveSeat }) => {
  const total = selectedSeats.reduce((sum, s) => {
    const p = pricing?.[s.category] || 250;
    return sum + p;
  }, 0);

  return (
    <div className="selected-seats-panel">
      <div className="selected-seats-title">
        <span>SELECTED SEATS</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>
          ({selectedSeats.length})
        </span>
      </div>

      {selectedSeats.length === 0 ? (
        <div style={{ fontSize: '0.8rem', color: 'var(--cinema-text-secondary)', padding: '16px 0', textAlign: 'center' }}>
          No seats selected yet. Click any available seat on the seating map.
        </div>
      ) : (
        <>
          <div className="selected-seats-list">
            {selectedSeats.map((seat) => {
              const price = pricing?.[seat.category] || 250;
              return (
                <div key={seat.seatId} className="selected-seat-row">
                  <span className="seat-code-col">{seat.seatId}</span>
                  <span className="seat-cat-col">{seat.category}</span>
                  <span className="seat-price-col">₹{price}</span>
                  <button
                    onClick={() => onRemoveSeat(seat)}
                    className="seat-remove-btn"
                    title={`Remove ${seat.seatId}`}
                    aria-label={`Remove seat ${seat.seatId}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          <div className="selected-seats-divider" />

          <div className="selected-seats-total-row">
            <span>TOTAL</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </>
      )}
    </div>
  );
};
