import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { MagneticButton } from '../common/MagneticButton';

export const AIMoodDiscovery = ({ movies = [], onSelectMoodMovie }) => {
  const [selectedMood, setSelectedMood] = useState('THRILLED');

  const moods = [
    { key: 'THRILLED', label: 'THRILLED', desc: 'Heart-pounding high stakes & suspense', genreMatch: ['Thriller', 'Action'] },
    { key: 'LAUGH', label: 'LAUGH', desc: 'Smart satire, comedic timing & joy', genreMatch: ['Comedy', 'Animation'] },
    { key: 'CRY', label: 'CRY', desc: 'Profound emotional resonance & human drama', genreMatch: ['Drama', 'Romance'] },
    { key: 'ESCAPE', label: 'ESCAPE', desc: 'Spectacular alien vistas & mythical worlds', genreMatch: ['Sci-Fi', 'Fantasy'] },
    { key: 'THINK', label: 'THINK', desc: 'Philosophical mysteries & complex narratives', genreMatch: ['Sci-Fi', 'History', 'Drama'] },
    { key: 'FAMILY', label: 'FAMILY', desc: 'Wholesome wonders suitable for all generations', genreMatch: ['Animation', 'Adventure'] },
    { key: 'ROMANCE', label: 'ROMANCE', desc: 'Intimate chemistry, longing & passion', genreMatch: ['Romance', 'Drama'] },
    { key: 'ADVENTURE', label: 'ADVENTURE', desc: 'Expeditions across uncharted horizons', genreMatch: ['Adventure', 'Action'] },
  ];

  const currentMoodObj = moods.find((m) => m.key === selectedMood) || moods[0];

  // Filter or prioritize movies matching mood
  const matchedMovies = movies.filter((m) =>
    m.genres?.some((g) => currentMoodObj.genreMatch.includes(g))
  );
  const displayMovies = matchedMovies.length > 0 ? matchedMovies.slice(0, 3) : movies.slice(0, 3);

  return (
    <section className="mood-discovery-section" style={{ padding: '70px 0', borderBottom: '2px solid #050505', background: '#F3F1EB' }}>
      <div className="editorial-container">
        {/* Section Header with Massive Editorial Typography */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#050505', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
            <Sparkles size={16} /> CINEAI AFFECTIVE TASTE ENGINE
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 6vw, 4.8rem)', fontWeight: 900, lineHeight: 0.95, color: '#050505', margin: 0 }}>
            WHAT ARE YOU<br />IN THE MOOD FOR?
          </h2>
          <p style={{ color: '#6B6B65', fontSize: '1rem', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
            Select an emotional frequency. CineAI recomposes the screening program in real-time.
          </p>
        </div>

        {/* Mood Selector Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '36px' }}>
          {moods.map((m) => {
            const isSelected = selectedMood === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setSelectedMood(m.key)}
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-full)',
                  border: '2px solid #050505',
                  background: isSelected ? '#050505' : '#FFFFFF',
                  color: isSelected ? '#F3F1EB' : '#050505',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelected ? '4px 4px 0px #050505' : '2px 2px 0px rgba(5,5,5,0.1)',
                  transform: isSelected ? 'translate(-2px, -2px)' : 'none',
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Mood Descriptor & Staged Matches */}
        <div style={{ background: '#FFFFFF', border: '2px solid #050505', borderRadius: 'var(--radius-sm)', padding: '28px', boxShadow: '5px 5px 0px #050505' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px', borderBottom: '1px solid #050505', paddingBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#8B8B86', textTransform: 'uppercase' }}>
                CURRENT FREQUENCY:
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: '#050505', margin: '2px 0' }}>
                {currentMoodObj.label}
              </h3>
              <p style={{ margin: 0, color: '#6B6B65', fontSize: '0.9rem' }}>
                {currentMoodObj.desc}
              </p>
            </div>

            <span style={{ background: '#050505', color: '#F3F1EB', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
              {displayMovies.length} CURATED MATCHES
            </span>
          </div>

          {/* Matches Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {displayMovies.map((movie, idx) => (
              <div
                key={movie._id || idx}
                style={{
                  background: '#F3F1EB',
                  border: '1.5px solid #050505',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  style={{ width: '80px', height: '110px', objectFit: 'cover', border: '1.5px solid #050505', borderRadius: '2px' }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#050505' }}>
                    ★ {movie.rating} / 10 • {movie.duration}M
                  </span>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: '#050505', margin: '4px 0 6px 0', lineHeight: 1.1 }}>
                    {movie.title}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#6B6B65', margin: '0 0 10px 0', fontFamily: 'var(--font-mono)' }}>
                    {movie.genres?.join(', ')}
                  </p>

                  <a
                    href={`/movie/${movie._id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: '#050505',
                      textDecoration: 'underline',
                    }}
                  >
                    EXPERIENCE FILM →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
