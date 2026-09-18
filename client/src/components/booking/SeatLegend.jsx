import React from 'react';

export const SeatLegend = () => {
  return (
    <div className="cinema-seat-legend">
      <div className="legend-item">
        <div className="legend-dot avail" />
        <span>Available</span>
      </div>
      <div className="legend-item">
        <div className="legend-dot sel" />
        <span>Selected</span>
      </div>
      <div className="legend-item">
        <div className="legend-dot occ" />
        <span>Occupied</span>
      </div>
      <div className="legend-item">
        <div className="legend-dot ai" />
        <span>AI Pick</span>
      </div>
    </div>
  );
};
