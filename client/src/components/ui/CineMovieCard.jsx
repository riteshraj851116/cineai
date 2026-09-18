import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, Clock, Film } from 'lucide-react';
import { CineBadge } from './CineBadge';
import { CineImage } from './CineImage';
import { getMoviePoster } from '../../services/imageService';
import { useAuth } from '../../context/AuthContext';
import { movieApi } from '../../services/movieApi';

export const CineMovieCard = ({
  movie,
  onWatchlistChange,
  isWatchlisted: initialWatchlisted = false,
  showBookingAction = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(initialWatchlisted);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!movie) return null;

  const {
    _id,
    title = 'Screening Title',
    rating,
    genres = [],
    duration,
    languages = [],
    releaseDate,
    slug,
    formats = [],
  } = movie;

  const movieId = _id || movie.id;
  const movieUrl = slug ? `/movie/${slug}` : (movieId ? `/movie/${movieId}` : '/movies');
  const posterSrc = getMoviePoster(movie);

  const genresList = Array.isArray(genres)
    ? genres
    : (typeof genres === 'string' && genres.trim() ? genres.split(',').map((s) => s.trim()) : []);

  const formatsList = Array.isArray(formats)
    ? formats
    : (typeof formats === 'string' && formats.trim() ? formats.split(',').map((s) => s.trim()) : []);

  const handleWatchlistToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to save movies to your watchlist.');
      return;
    }
    if (!movieId) return;
    setWatchlistLoading(true);
    try {
      const { data } = await movieApi.toggleWatchlist(movieId);
      if (data.success) {
        setInWatchlist(data.inWatchlist);
        if (onWatchlistChange) onWatchlistChange(movieId, data.inWatchlist);
      }
    } catch (err) {
      console.error('Watchlist toggle failed:', err);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleCardClick = () => {
    navigate(movieUrl);
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    navigate(movieUrl);
  };

  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  return (
    <div
      className={`cine-movie-card ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        borderRadius: 'var(--cine-radius-lg)',
        backgroundColor: 'var(--cine-card)',
        border: '1px solid var(--cine-border-subtle)',
        overflow: 'hidden',
        transition: 'border-color var(--cine-transition-normal), transform var(--cine-transition-normal), box-shadow var(--cine-transition-normal)',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered ? 'var(--cine-shadow-lg)' : 'var(--cine-shadow-sm)',
        borderColor: isHovered ? 'var(--cine-border-hover)' : 'var(--cine-border-subtle)',
      }}
    >
      {/* Poster Media Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2 / 3',
          backgroundColor: 'var(--cine-surface-2)',
          overflow: 'hidden',
        }}
      >
        <CineImage
          src={posterSrc}
          alt={title}
          aspectRatio="2/3"
          style={{
            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Top Floating Badges */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          {rating ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: 'var(--cine-radius-sm)',
                backgroundColor: 'rgba(9, 9, 11, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid var(--cine-border)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              <Star size={12} color="var(--cine-gold)" fill="var(--cine-gold)" />
              <span>{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
            </div>
          ) : <div />}

          {/* Watchlist Heart Button */}
          <button
            type="button"
            onClick={handleWatchlistToggle}
            disabled={watchlistLoading}
            aria-label="Save to watchlist"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(9, 9, 11, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid var(--cine-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: inWatchlist ? 'var(--cine-accent)' : '#FFFFFF',
              transition: 'transform var(--cine-transition-fast), color var(--cine-transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Heart
              size={15}
              fill={inWatchlist ? 'var(--cine-accent)' : 'none'}
              stroke={inWatchlist ? 'var(--cine-accent)' : 'currentColor'}
            />
          </button>
        </div>

        {/* Quick Format Badges on Bottom of Poster */}
        {formatsList.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              display: 'flex',
              gap: '4px',
              zIndex: 2,
            }}
          >
            {formatsList.slice(0, 2).map((fmt) => (
              <span
                key={fmt}
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  padding: '2px 6px',
                  borderRadius: 'var(--cine-radius-xs)',
                  backgroundColor: 'rgba(9, 9, 11, 0.88)',
                  color: '#FFFFFF',
                  border: '1px solid var(--cine-border)',
                }}
              >
                {fmt}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content & Metadata */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3
          style={{
            fontFamily: 'var(--cine-font-display)',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.3,
            margin: '0 0 6px 0',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
          title={title}
        >
          {title}
        </h3>

        {/* Genre & Meta Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cine-muted)', fontSize: '0.78rem', marginBottom: '12px' }}>
          <span>{genresList.slice(0, 2).join(' · ') || 'Cinema'}</span>
          {duration && (
            <>
              <span>•</span>
              <span>{typeof duration === 'number' ? `${duration}m` : duration}</span>
            </>
          )}
          {year && (
            <>
              <span>•</span>
              <span>{year}</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {showBookingAction && (
          <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleBookClick}
              className="cine-btn cine-btn-primary cine-btn-sm"
              style={{ flex: 1 }}
            >
              BOOK TICKETS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CineMovieCard;
