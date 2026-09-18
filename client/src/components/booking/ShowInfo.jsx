import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ShowInfo = ({ show, movie }) => {
  const navigate = useNavigate();

  // Parse show date
  let dayNum = '14';
  let monthStr = 'SEP';

  if (show?.date) {
    const parts = show.date.split('-');
    if (parts.length === 3) {
      dayNum = parts[2];
      const d = new Date(show.date);
      monthStr = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    }
  }

  const durationHrs = movie?.duration ? Math.floor(movie.duration / 60) : 2;
  const durationMins = movie?.duration ? movie.duration % 60 : 18;

  return (
    <div>
      {/* Editorial Date / Time / Format */}
      <div className="editorial-date-time-grid">
        <div className="editorial-date-box">
          <span style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--cinema-text-secondary)', textTransform: 'uppercase', marginBottom: '2px' }}>
            DATE
          </span>
          <span className="editorial-date-num">{dayNum}</span>
          <span className="editorial-date-month">{monthStr}</span>
        </div>

        <div className="editorial-time-box">
          <span style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--cinema-text-secondary)', textTransform: 'uppercase', marginBottom: '2px' }}>
            TIME
          </span>
          <span className="editorial-time-val">{show?.startTime || '9:40 PM'}</span>
          <span className="editorial-format-badge">{show?.format || 'IMAX 3D'}</span>
        </div>
      </div>

      {/* Show Information */}
      <div className="show-meta-block">
        <div className="show-movie-name">{movie?.title || 'THE LAST VOYAGE'}</div>
        <div className="show-specs-row">
          <span>{show?.screen?.name || 'Cinema 04'}</span>
          <span>•</span>
          <span>Duration {durationHrs}h {durationMins}m</span>
        </div>
      </div>

      {/* Cinema Information */}
      <div className="cinema-venue-block">
        <div className="cinema-venue-name">{show?.theatre?.name || 'CINEPLEX CENTRAL'}</div>
        <div className="cinema-venue-city">{show?.theatre?.city || 'New Delhi'}</div>

        <div className="cinema-amenity-pills">
          {(show?.theatre?.facilities?.length > 0
            ? show.theatre.facilities
            : ['IMAX', 'Dolby Atmos', 'Recliners']
          ).map((amenity) => (
            <span key={amenity} className="cinema-amenity-tag">
              {amenity}
            </span>
          ))}
        </div>

        <button
          onClick={() => navigate('/movies')}
          className="change-cinema-btn"
        >
          [ CHANGE CINEMA ]
        </button>
      </div>
    </div>
  );
};
