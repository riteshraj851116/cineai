import React, { useState, useRef } from 'react';
import { aiService } from '../../services/aiService';
import { Sparkles, Send, Star, Clock, Calendar, ArrowRight, X } from 'lucide-react';
import gsap from 'gsap';
import { MagneticButton } from '../common/MagneticButton';

export const AICommandCenter = ({ onBookShow }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseState, setResponseState] = useState(null);
  const resultRef = useRef(null);

  const suggestedPrompts = [
    'Something thrilling',
    'Best movie tonight',
    'Movie for family',
    'Something like Interstellar',
    'Best IMAX experience',
  ];

  const handleExecuteAI = async (textToRun) => {
    const q = textToRun || query;
    if (!q.trim() || loading) return;

    setLoading(true);
    try {
      const { data } = await aiService.searchMovies(q);
      if (data.success && data.movies?.length > 0) {
        const topMatch = data.movies[0];
        const secondary = data.movies.slice(1, 4);

        setResponseState({
          queryAsked: q,
          mainMovie: topMatch,
          secondaryMovies: secondary,
          matchPercentage: 94,
          rationale: `Because you asked for "${q}", featuring high audience intensity scores, stellar direction, and optimal sensory screening formats.`,
        });

        // Staged GSAP Entrance
        setTimeout(() => {
          if (resultRef.current) {
            gsap.fromTo(
              resultRef.current,
              { opacity: 0, y: 30, scale: 0.98 },
              { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
            );
          }
        }, 50);
      }
    } catch (err) {
      console.error('AI Command Center search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResponseState(null);
    setQuery('');
  };

  return (
    <section className="ai-command-center-section" style={{ padding: '80px 0', background: 'transparent', position: 'relative' }}>
      <div className="cine-container" style={{ maxWidth: '1040px' }}>
        {/* Main Floating Glass Command Terminal */}
        <div
          className="glass-panel glass-reflection"
          style={{
            borderRadius: 'var(--glass-radius-lg)',
            padding: '48px 40px',
            boxShadow: 'var(--glass-shadow-lg)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              className="glass-pill glass-pill-accent"
              style={{
                marginBottom: '16px',
                display: 'inline-flex',
                padding: '6px 16px',
              }}
            >
              <Sparkles size={14} />
              <span>✦ CINEAI COMMAND CENTER</span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1,
                letterSpacing: '0.02em',
              }}
            >
              WHAT ARE YOU IN THE MOOD FOR?
            </h2>
            <p
              style={{
                color: 'var(--cine-muted)',
                fontSize: '0.98rem',
                marginTop: '10px',
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Natural language cinematic curation powered by neural embeddings & real-time showtime inventory.
            </p>
          </div>

          {/* Prompt Input Row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteAI();
            }}
            className="glass-surface"
            style={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--glass-radius-full)',
              padding: '8px 10px 8px 22px',
              marginBottom: '20px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'Something thrilling tonight' or 'Epic sci-fi in IMAX'..."
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '1rem',
                color: '#FFFFFF',
              }}
              data-cursor="ASK"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--cine-muted)', cursor: 'pointer', padding: '6px' }}
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="glass-btn glass-btn-primary"
              style={{
                padding: '12px 28px',
                borderRadius: 'var(--glass-radius-full)',
                fontSize: '0.82rem',
              }}
              data-cursor="ASK"
            >
              {loading ? 'Analyzing...' : 'ASK CINEAI →'}
            </button>
          </form>

          {/* Quick Suggested Prompt Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--cine-muted)', letterSpacing: '0.08em' }}>
              SUGGESTED:
            </span>
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setQuery(prompt);
                  handleExecuteAI(prompt);
                }}
                className="glass-pill"
                style={{
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  padding: '5px 14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
                data-cursor="ASK"
              >
                "{prompt}"
              </button>
            ))}
          </div>

          {/* 15 — STAGED AI RESPONSE ANIMATION */}
          {responseState && (
            <div
              ref={resultRef}
              style={{
                marginTop: '40px',
                borderTop: '1px solid var(--glass-border)',
                paddingTop: '32px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--cine-accent)', letterSpacing: '0.08em' }}>
                  QUERY: "{responseState.queryAsked.toUpperCase()}"
                </div>
                <button
                  onClick={handleClear}
                  style={{ background: 'none', border: 'none', color: 'var(--cine-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  CLEAR MATCHES [✕]
                </button>
              </div>

              {/* Concierge Message Banner */}
              <div
                className="glass-card"
                style={{
                  padding: '18px 24px',
                  marginBottom: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  borderRadius: 'var(--glass-radius-md)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--cine-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    ✦ CINEAI INTELLIGENCE REPORT
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                    Curated match for your evening screening.
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--cine-muted)', marginTop: '4px' }}>
                    {responseState.rationale}
                  </div>
                </div>
                <span className="glass-pill glass-pill-accent" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                  MATCH {responseState.matchPercentage}%
                </span>
              </div>

              {/* Main Featured Movie Match */}
              <div
                className="glass-card glass-reflection"
                style={{
                  padding: '24px',
                  display: 'grid',
                  gridTemplateColumns: '150px 1fr auto',
                  gap: '24px',
                  alignItems: 'center',
                  marginBottom: '24px',
                }}
              >
                <img
                  src={responseState.mainMovie.poster}
                  alt={responseState.mainMovie.title}
                  style={{
                    width: '150px',
                    height: '210px',
                    objectFit: 'cover',
                    borderRadius: 'var(--glass-radius-sm)',
                    border: '1px solid var(--glass-border)',
                  }}
                />

                <div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <span className="glass-pill glass-pill-accent" style={{ fontSize: '0.62rem', padding: '2px 8px' }}>PRIMARY SELECTION</span>
                    <span className="glass-pill" style={{ fontSize: '0.62rem', padding: '2px 8px' }}>{responseState.mainMovie.certification || 'UA'}</span>
                    <span className="glass-pill" style={{ fontSize: '0.62rem', padding: '2px 8px' }}>{responseState.mainMovie.formats?.[0] || 'IMAX'}</span>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px 0', lineHeight: 1 }}>
                    {responseState.mainMovie.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--cine-muted)', marginBottom: '12px' }}>
                    <span style={{ color: '#F59E0B', fontWeight: 800 }}>★ {responseState.mainMovie.rating} / 10</span>
                    <span>•</span>
                    <span>{responseState.mainMovie.duration} MINS</span>
                    <span>•</span>
                    <span>{responseState.mainMovie.genres?.join(', ')}</span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6, margin: '0 0 16px 0', maxWidth: '600px' }}>
                    {responseState.mainMovie.description?.slice(0, 180)}...
                  </p>

                  <button
                    onClick={() => onBookShow(responseState.mainMovie._id)}
                    className="glass-btn glass-btn-primary"
                    style={{ padding: '8px 20px', borderRadius: 'var(--glass-radius-full)' }}
                    data-cursor="BOOK"
                  >
                    BOOK TICKETS →
                  </button>
                </div>
              </div>

              {/* Secondary Alternatives */}
              {responseState.secondaryMovies?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cine-muted)', marginBottom: '14px' }}>
                    ALTERNATIVE SCREENING OPTIONS
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {responseState.secondaryMovies.map((movie) => (
                      <div
                        key={movie._id}
                        className="glass-card glass-card-interactive"
                        onClick={() => onBookShow(movie._id)}
                        style={{
                          display: 'flex',
                          gap: '14px',
                          padding: '14px',
                          alignItems: 'center',
                        }}
                      >
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          style={{ width: '56px', height: '80px', objectFit: 'cover', borderRadius: 'var(--glass-radius-sm)', border: '1px solid var(--glass-border)' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#FFFFFF', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {movie.title}
                          </h4>
                          <div style={{ fontSize: '0.72rem', color: 'var(--cine-muted)' }}>
                            ★ {movie.rating} • {movie.genres?.[0]}
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--cine-accent)', fontWeight: 800, marginTop: '4px', display: 'inline-block' }}>
                            VIEW SHOWS →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
