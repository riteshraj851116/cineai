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
      <div className="legend-item" style={{ color: '#06B6D4' }}>
        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px dashed #06B6D4', borderRadius: '3px', background: 'rgba(6, 182, 212, 0.2)' }} />
        <span>Dolby Atmos Zone</span>
      </div>
    </div>
  );
};
