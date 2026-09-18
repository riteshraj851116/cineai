import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { CineBadge } from './CineBadge';
import { CineButton } from './CineButton';
import { CineImage } from './CineImage';
import { getCinemaImage } from '../../services/imageService';

export const CineCinemaCard = ({
  theatre,
  onSelect,
  className = '',
}) => {
  const navigate = useNavigate();
  if (!theatre) return null;

  const {
    _id,
    name,
    address,
    city,
    facilities = [],
  } = theatre;

  const cinemaImage = getCinemaImage(theatre);

  const handleExplore = () => {
    if (onSelect) {
      onSelect(theatre);
    } else {
      navigate('/movies');
    }
  };

  return (
    <div
      className={`cine-card cine-card-hover ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        overflow: 'hidden',
      }}
    >
      {/* Venue Photo */}
      <div
        style={{
          height: '180px',
          width: '100%',
          borderRadius: 'var(--cine-radius-md)',
          overflow: 'hidden',
          marginBottom: '16px',
          position: 'relative',
          border: '1px solid var(--cine-border)',
          backgroundColor: 'var(--cine-surface-2)',
        }}
      >
        <CineImage
          src={cinemaImage}
          alt={name}
          aspectRatio="auto"
          style={{ width: '100%', height: '100%' }}
        />
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
          }}
        >
          <CineBadge variant="accent">
            {city?.toUpperCase() || 'METRO'}
          </CineBadge>
        </div>
      </div>

      {/* Venue Details */}
      <h3
        style={{
          fontFamily: 'var(--cine-font-display)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#FFFFFF',
          marginBottom: '6px',
        }}
      >
        {name}
      </h3>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8125rem',
          color: 'var(--cine-muted)',
          marginBottom: '16px',
        }}
      >
        <MapPin size={14} color="var(--cine-accent)" style={{ flexShrink: 0 }} />
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {address}
        </span>
      </div>

      {/* Facilities Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px', marginTop: 'auto' }}>
        {(facilities.length > 0 ? facilities : ['IMAX', 'Dolby Atmos', 'VIP Recliners']).map((fac) => (
          <span
            key={fac}
            className="cine-badge"
            style={{ fontSize: '0.68rem', padding: '3px 8px' }}
          >
            {fac}
          </span>
        ))}
      </div>

      {/* Action Button */}
      <CineButton
        variant="secondary"
        onClick={handleExplore}
        style={{ width: '100%' }}
      >
        <span>VIEW SHOWTIMES</span>
        <ArrowRight size={14} />
      </CineButton>
    </div>
  );
};

export default CineCinemaCard;
