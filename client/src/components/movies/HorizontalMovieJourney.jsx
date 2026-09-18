import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HorizontalMovieJourney = ({ movies = [] }) => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayMovies = movies.slice(0, 6);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = 360;
    const newIdx = Math.min(
      displayMovies.length - 1,
      Math.max(0, Math.round(scrollLeft / cardWidth))
    );
    setActiveIndex(newIdx);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [displayMovies.length]);

  return (
    <section style={{ padding: '80px 0 90px 0', background: '#F3F1EB', borderBottom: '2px solid #050505', overflow: 'hidden' }}>
      <div className="editorial-container">
        {/* Section Header with Horizontal Sequence Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '36px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#050505' }}>
              ✦ CONTINUOUS HORIZONTAL EXHIBITION
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 6vw, 4.8rem)', fontWeight: 900, lineHeight: 0.9, color: '#050505', margin: '4px 0 0 0' }}>
              THE CINEMATIC<br />JOURNEY
            </h2>
          </div>

          {/* Progress Indicator: 01 ━━━━━━━ 06 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 800 }}>
            <span>0{activeIndex + 1}</span>
            <div style={{ width: '120px', height: '4px', background: '#DFDBD1', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${((activeIndex + 1) / displayMovies.length) * 100}%`,
                  background: '#050505',
                  transition: 'width 0.25s ease',
                }}
              />
            </div>
            <span>0{displayMovies.length}</span>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div
          ref={containerRef}
          style={{
            display: 'flex',
            gap: '28px',
            overflowX: 'auto',
            paddingBottom: '24px',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
          }}
        >
          {displayMovies.map((movie, idx) => (
            <div
              key={movie._id}
              style={{
                flex: '0 0 340px',
                scrollSnapAlign: 'start',
                background: '#FFFFFF',
                border: '2px solid #050505',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                boxShadow: '5px 5px 0px #050505',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease',
              }}
            >
              {/* Poster Container with Index Stamp */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '2 / 3', overflow: 'hidden', border: '1.5px solid #050505', borderRadius: '2px', background: '#050505', marginBottom: '14px' }}>
                <img
                  src={movie.poster}
                  alt={movie.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: '#050505',
                    color: '#F3F1EB',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '2px',
                  }}
                >
                  EXP 0{idx + 1}
                </span>

                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#FFFFFF',
                    color: '#050505',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    border: '1px solid #050505',
                  }}
                >
                  ★ {movie.rating}
                </span>
              </div>

              {/* Title & Metadata */}
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: '#050505', margin: '0 0 4px 0', lineHeight: 1 }}>
                {movie.title}
              </h3>

              <div style={{ fontSize: '0.78rem', color: '#6B6B65', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
                {movie.genres?.join(', ')} • {movie.duration} MINS
              </div>

              {/* Annotation */}
              <div style={{ background: '#F3F1EB', border: '1px solid #050505', padding: '8px 10px', borderRadius: '2px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#2B2B28', marginBottom: '14px' }}>
                {idx === 0 ? '✦ CINEAI EDITOR CHOICE' : idx === 1 ? '✦ 96% AFFINITY MATCH' : '✦ CRITICAL MASTERPIECE'}
              </div>

              <Link
                to={`/movie/${movie._id}`}
                className="btn btn-primary"
                style={{ textAlign: 'center', padding: '10px', fontSize: '0.85rem', marginTop: 'auto' }}
              >
                SELECT SHOWTIMES →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
