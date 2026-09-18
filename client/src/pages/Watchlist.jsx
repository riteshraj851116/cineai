import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { watchlistService } from '../services/watchlistService';
import { useAuth } from '../context/AuthContext';
import {
  CinePageHeader,
  CineButton,
  CineBadge,
  CineLoader,
  CineEmptyState,
  CineMovieCard,
} from '../components/ui';
import { Bookmark, Film, Trash2, ArrowRight, Sparkles } from 'lucide-react';

export const Watchlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const { data } = await watchlistService.getWatchlist();
      if (data.success) {
        setWatchlist(data.watchlist || []);
      }
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleRemove = async (movieId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data } = await watchlistService.removeFromWatchlist(movieId);
      if (data.success) {
        setWatchlist((prev) => prev.filter((m) => (m._id || m) !== movieId));
      }
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '70vh', padding: '120px 24px' }}>
        <CineEmptyState
          title="AUTHENTICATION REQUIRED"
          description="Log in to your CineAI patron account to save films, organize your cinema queue, and access personalized AI suggestions."
          actionText="LOG IN / REGISTER"
          onAction={() => navigate('/profile')}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '96px', paddingTop: '40px' }}>
      <div className="cine-page-container">
        <CinePageHeader
          eyebrow="PATRON ARCHIVE"
          title="YOUR WATCHLIST"
          subtitle="All cinematic releases curated for your personal queue. Check real-time screening availability and secure seats."
        />

        {loading ? (
          <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CineLoader text="RETRIEVING YOUR CURATED WATCHLIST..." />
          </div>
        ) : watchlist.length === 0 ? (
          <CineEmptyState
            title="YOUR WATCHLIST IS EMPTY"
            description="You haven't bookmarked any films yet. Explore current releases or let our AI concierge recommend titles."
            actionText="EXPLORE NOW SHOWING"
            onAction={() => navigate('/movies')}
          />
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.84rem', color: 'var(--cine-muted)', fontWeight: 700 }}>
                {watchlist.length} {watchlist.length === 1 ? 'FILM' : 'FILMS'} SAVED
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '24px',
              }}
            >
              {watchlist.map((movie) => {
                if (!movie || typeof movie !== 'object') return null;
                return (
                  <div
                    key={movie._id}
                    style={{
                      backgroundColor: 'var(--cine-surface)',
                      border: '1px solid var(--cine-border)',
                      borderRadius: 'var(--cine-radius-lg)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {/* Poster with overlay */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', overflow: 'hidden' }}>
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <button
                        onClick={(e) => handleRemove(movie._id, e)}
                        title="Remove from watchlist"
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(0, 0, 0, 0.75)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#FF6B6B',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Movie Info & Actions */}
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--cine-accent)', fontWeight: 800, textTransform: 'uppercase' }}>
                            {(movie.genres || []).slice(0, 2).join(' • ')}
                          </span>
                          {movie.rating && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--cine-gold)', fontWeight: 800 }}>
                              ★ {movie.rating}
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--cine-text)', margin: '0 0 6px 0' }}>
                          {movie.title}
                        </h3>

                        <div style={{ color: 'var(--cine-muted)', fontSize: '0.78rem', marginBottom: '16px' }}>
                          <span>{movie.duration} mins</span> • <span>{(movie.languages || []).join(', ')}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link
                          to={`/movies/${movie.slug || movie._id}`}
                          style={{
                            flex: 1,
                            padding: '10px',
                            background: 'var(--cine-accent)',
                            color: '#FFFFFF',
                            textAlign: 'center',
                            borderRadius: 'var(--cine-radius-sm)',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <span>BOOK SEATS</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
