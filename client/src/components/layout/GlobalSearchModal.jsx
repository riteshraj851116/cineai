import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Film, Building2, Star, ArrowRight } from 'lucide-react';
import { movieApi } from '../../services/movieApi';
import { cinemaApi } from '../../services/cinemaApi';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ movies: [], theatres: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ movies: [], theatres: [] });
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ movies: [], theatres: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [moviesRes, theatresRes] = await Promise.all([
          movieApi.getMovies({ search: query }),
          cinemaApi.getTheatres(),
        ]);

        const matchedTheatres = (theatresRes.data?.theatres || []).filter((t) =>
          t.name?.toLowerCase().includes(query.toLowerCase()) ||
          t.city?.toLowerCase().includes(query.toLowerCase())
        );

        setResults({
          movies: moviesRes.data?.movies?.slice(0, 5) || [],
          theatres: matchedTheatres.slice(0, 3),
        });
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const trendingSearches = ['Dune', 'Interstellar', 'Oppenheimer', 'The Batman', 'Inception'];

  return (
    <div className="cine-modal-overlay" onClick={onClose}>
      <div
        className="cine-modal-container"
        style={{ maxWidth: '640px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Search Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '18px 24px',
            borderBottom: '1px solid var(--cine-border)',
            position: 'relative',
          }}
        >
          <Search size={18} color="var(--cine-muted)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, genres, cinemas, localities..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: '1.05rem',
              fontWeight: 500,
              fontFamily: 'var(--cine-font-sans)',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ color: 'var(--cine-muted)', padding: '4px' }}
              aria-label="Clear query"
            >
              <X size={16} />
            </button>
          )}
          <kbd
            style={{
              padding: '3px 7px',
              borderRadius: 'var(--cine-radius-xs)',
              background: 'var(--cine-surface-2)',
              border: '1px solid var(--cine-border)',
              color: 'var(--cine-dim)',
              fontSize: '0.68rem',
              fontFamily: 'var(--cine-font-mono)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Modal Body Content */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '16px 20px' }}>
          {/* Default Trending Chips when empty */}
          {!query && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--cine-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                TRENDING NOW
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {trendingSearches.map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--cine-radius-full)',
                      backgroundColor: 'var(--cine-surface-2)',
                      border: '1px solid var(--cine-border)',
                      color: 'var(--cine-text-secondary)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--cine-surface-3)';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--cine-surface-2)';
                      e.currentTarget.style.color = 'var(--cine-text-secondary)';
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--cine-muted)', fontSize: '0.875rem' }}>
              Searching cinematic catalog...
            </div>
          )}

          {/* Results: Movies */}
          {results.movies.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--cine-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                MOVIES ({results.movies.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {results.movies.map((m) => (
                  <div
                    key={m._id}
                    onClick={() => {
                      onClose();
                      navigate(`/movie/${m.slug || m._id}`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--cine-radius-md)',
                      backgroundColor: 'var(--cine-surface)',
                      border: '1px solid var(--cine-border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--cine-surface-2)';
                      e.currentTarget.style.borderColor = 'var(--cine-border-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--cine-surface)';
                      e.currentTarget.style.borderColor = 'var(--cine-border-subtle)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={m.poster}
                        alt={m.title}
                        style={{ width: '36px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
                          {m.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cine-muted)' }}>
                          {m.genres?.slice(0, 2).join(' · ')} • {m.duration}m
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--cine-gold)' }}>
                        ★ {m.rating}
                      </span>
                      <ArrowRight size={14} color="var(--cine-muted)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results: Theatres */}
          {results.theatres.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--cine-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                CINEMAS ({results.theatres.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {results.theatres.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => {
                      onClose();
                      navigate('/cinemas');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--cine-radius-md)',
                      backgroundColor: 'var(--cine-surface)',
                      border: '1px solid var(--cine-border-subtle)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--cine-surface-2)';
                      e.currentTarget.style.borderColor = 'var(--cine-border-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--cine-surface)';
                      e.currentTarget.style.borderColor = 'var(--cine-border-subtle)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Building2 size={16} color="var(--cine-accent)" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF' }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cine-muted)' }}>
                          {t.address}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={14} color="var(--cine-muted)" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty search feedback */}
          {query && !loading && results.movies.length === 0 && results.theatres.length === 0 && (
            <div style={{ padding: '36px 12px', textAlign: 'center', color: 'var(--cine-muted)' }}>
              No matches found for "{query}". Try checking title spelling or searching by genre.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
