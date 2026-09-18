import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Armchair, ChevronRight } from 'lucide-react';
import { CineBadge } from './CineBadge';

export const CineShowCard = ({
  show,
  onSelect,
  className = '',
}) => {
  const navigate = useNavigate();
  if (!show) return null;

  const {
    _id,
    startTime,
    format = 'IMAX 2D',
    price = 350,
    screen,
    theatre,
    status = 'available',
  } = show;

  const handleBooking = () => {
    if (onSelect) {
      onSelect(show);
    } else {
      navigate(`/booking/${_id}`);
    }
  };

  return (
    <div
      className={`cine-card cine-card-hover ${className}`}
      onClick={handleBooking}
      style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Showtime Big Time */}
        <div
          style={{
            fontFamily: 'var(--cine-font-display)',
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1,
          }}
        >
          {startTime}
        </div>

        {/* Format & Screen Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <CineBadge variant="accent" size="sm">
              {format}
            </CineBadge>
            <span style={{ fontSize: '0.8rem', color: 'var(--cine-muted)', fontWeight: 600 }}>
              Auditorium {screen?.name || '01'}
            </span>
          </div>
          {theatre && (
            <div style={{ fontSize: '0.78rem', color: 'var(--cine-dim)' }}>
              {theatre.name}
            </div>
          )}
        </div>
      </div>

      {/* Price & Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--cine-dim)', textTransform: 'uppercase' }}>
            Starts from
          </div>
          <div style={{ fontFamily: 'var(--cine-font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--cine-text)' }}>
            ₹{price}
          </div>
        </div>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--cine-surface-2)',
            border: '1px solid var(--cine-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cine-muted)',
            transition: 'background-color 0.2s, color 0.2s',
          }}
        >
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
};

export default CineShowCard;
