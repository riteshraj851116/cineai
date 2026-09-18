import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import {
  FilmProjectorArt,
  ClapperboardArt,
  FilmReelArt,
  GlassesArt,
  TicketStubArt,
  PopcornArt,
  VintageCameraArt,
  OrganicBlackBlob,
  OrganicBlobSecondary,
} from './CinemaIllustrations';
import { Sparkles, ArrowRight, Star, X, Film } from 'lucide-react';
import gsap from 'gsap';
import { MagneticButton } from '../common/MagneticButton';

export const CinematicHero = ({ movies = [] }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMatch, setAiMatch] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const heroWrapperRef = useRef(null);
  const posterRef = useRef(null);
  const titleRef = useRef(null);
  const matchCardRef = useRef(null);
  const navigate = useNavigate();

  const featuredMovie = movies[0] || {
    _id: 'featured_1',
    title: 'OPPENHEIMER',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    rating: 8.9,
    genres: ['Biography', 'Drama', 'History'],
    duration: 180,
  };

  // 07 — HERO MOVIE POSTER 3D TILT & PARALLAX
  useEffect(() => {
    const hero = heroWrapperRef.current;
    const poster = posterRef.current;
    if (!hero || !poster || window.matchMedia('(pointer: coarse)').matches) return;

    // Load settle animation
    gsap.fromTo(
      poster,
      { scale: 0.88, rotate: -4, opacity: 0 },
      { scale: 1, rotate: -1.5, opacity: 1, duration: 1.2, ease: 'power3.out' }
    );

    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(poster, {
        rotateY: x * 20,
        rotateX: -y * 20,
        x: x * 25,
        y: y * 25,
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(poster, {
        rotateY: 0,
        rotateX: 0,
        rotateZ: -1.5,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)',
      });
    };

    hero.addEventListener('mousemove', handleMouseMove);
    hero.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleHeroAISearch = async (e) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const data = await aiService.searchMovies(aiPrompt);
      if (data.success && data.movies?.length > 0) {
        setAiMatch(data.movies[0]);

        setTimeout(() => {
          if (matchCardRef.current) {
            gsap.fromTo(
              matchCardRef.current,
              { opacity: 0, scale: 0.9, y: 20 },
              { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }
            );
          }
        }, 50);
      }
    } catch (err) {
      console.error('Hero AI search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      ref={heroWrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '82vh',
        padding: '60px 0 80px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 80% 30%, rgba(255, 64, 56, 0.08) 0%, rgba(8, 8, 8, 1) 70%)',
      }}
    >
      {/* Cinematic Ambient Atmosphere (Vignette & Light Glow) */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          right: '5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 64, 56, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(60px)',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(50px)',
          zIndex: 1,
        }}
      />

      <div className="cine-container" style={{ position: 'relative', zIndex: 3 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '48px',
            alignItems: 'center',
          }}
          className="hero-grid-responsive"
        >
          {/* Left Side: Cinematic Typography & Glass AI Capsule */}
          <div>
            <div
              className="glass-pill glass-pill-accent"
              style={{ marginBottom: '18px', display: 'inline-flex' }}
            >
              <Sparkles size={13} />
              <span>CINEAI REVOLUTION • 2026 ARCHIVE</span>
            </div>

            <h1
              ref={titleRef}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(3.4rem, 7vw, 5.8rem)',
                lineHeight: 0.92,
                letterSpacing: '0.03em',
                color: '#FFFFFF',
                margin: '0 0 16px 0',
                textTransform: 'uppercase',
              }}
            >
              FIND<br />
              YOUR NEXT<br />
              <span style={{ color: 'var(--cine-accent)' }}>MASTERPIECE.</span>
            </h1>

            <p
              style={{
                fontSize: '1rem',
                color: 'var(--cine-muted)',
                maxWidth: '520px',
                lineHeight: 1.6,
                marginBottom: '32px',
              }}
            >
              Neural-powered cinematic curation, seamless booking, and instant high-fidelity digital passes.
            </p>

            {/* 05 — HERO GLASS: AI SEARCH CAPSULE */}
            <form
              onSubmit={handleHeroAISearch}
              className="glass-surface glass-reflection"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px 8px 20px',
                borderRadius: 'var(--glass-radius-full)',
                maxWidth: '580px',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.4)',
              }}
            >
              <Sparkles size={18} color="var(--cine-accent)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask CineAI: 'Find me a sci-fi thriller in IMAX'..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.92rem',
                  fontFamily: 'inherit',
                }}
                data-cursor="ASK"
              />
              <button
                type="submit"
                disabled={isSearching || !aiPrompt.trim()}
                className="glass-btn glass-btn-primary"
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--glass-radius-full)',
                  fontSize: '0.78rem',
                }}
                data-cursor="ASK"
              >
                {isSearching ? 'Finding...' : 'Ask CineAI →'}
              </button>
            </form>

            {/* Quick Prompt Suggestions */}
            {!aiMatch && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                {['Action in IMAX', 'Christopher Nolan epic', 'Family 3D adventure'].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setAiPrompt(prompt);
                      handleHeroAISearch();
                    }}
                    className="glass-pill"
                    style={{
                      cursor: 'pointer',
                      fontSize: '0.68rem',
                      opacity: 0.85,
                      background: 'rgba(255, 255, 255, 0.04)',
                    }}
                    data-cursor="ASK"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            )}

            {/* 05 — HERO GLASS: MOVIE INFORMATION MATCH PANEL */}
            {aiMatch && (
              <div
                ref={matchCardRef}
                className="glass-card glass-reflection"
                style={{
                  marginTop: '24px',
                  maxWidth: '520px',
                  display: 'flex',
                  gap: '18px',
                  padding: '16px',
                  alignItems: 'center',
                }}
              >
                <img
                  src={aiMatch.poster}
                  alt={aiMatch.title}
                  style={{
                    width: '84px',
                    height: '118px',
                    objectFit: 'cover',
                    borderRadius: 'var(--glass-radius-sm)',
                    border: '1px solid var(--glass-border)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="glass-pill glass-pill-accent" style={{ fontSize: '0.62rem', padding: '3px 8px' }}>
                      ✦ 94% MATCH
                    </span>
                    <button
                      onClick={() => setAiMatch(null)}
                      style={{ color: 'var(--cine-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.4rem',
                      color: '#FFFFFF',
                      margin: '4px 0',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {aiMatch.title}
                  </h3>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--cine-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}
                  >
                    <span style={{ color: '#F59E0B', fontWeight: 800 }}>★ {aiMatch.rating}</span>
                    <span>•</span>
                    <span>{aiMatch.genres?.[0]}</span>
                    <span>•</span>
                    <span>{aiMatch.duration}m</span>
                  </div>
                  <button
                    onClick={() => navigate(`/movie/${aiMatch._id}`)}
                    className="glass-btn glass-btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.72rem', borderRadius: 'var(--glass-radius-full)' }}
                    data-cursor="BOOK"
                  >
                    BOOK TICKETS →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: 3D Tilt Poster with Subtle Glass Overlays */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div
              ref={posterRef}
              onClick={() => navigate(`/movie/${featuredMovie._id}`)}
              className="glass-reflection"
              style={{
                position: 'relative',
                width: '320px',
                maxWidth: '100%',
                borderRadius: 'var(--glass-radius)',
                overflow: 'hidden',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.75), 0 0 40px rgba(255, 64, 56, 0.15)',
                cursor: 'pointer',
                transition: 'transform 0.4s ease, box-shadow 0.4s ease',
              }}
              data-cursor="VIEW"
            >
              <img
                src={featuredMovie.poster}
                alt={featuredMovie.title}
                style={{
                  width: '100%',
                  height: '460px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />

              {/* Glass Metadata Overlay at Top */}
              <div
                className="glass-surface"
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  right: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: 'var(--glass-radius-full)',
                }}
              >
                <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--cine-accent)' }}>
                  ★ {featuredMovie.rating}
                </span>
                <span className="glass-pill" style={{ padding: '2px 8px', fontSize: '0.62rem' }}>
                  AI PICK
                </span>
              </div>

              {/* Glass Action Overlay at Bottom */}
              <div
                className="glass-surface"
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  left: '14px',
                  right: '14px',
                  padding: '12px 16px',
                  borderRadius: 'var(--glass-radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h4
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.2rem',
                      color: '#FFFFFF',
                      margin: 0,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {featuredMovie.title}
                  </h4>
                  <span style={{ fontSize: '0.68rem', color: 'var(--cine-muted)' }}>
                    {featuredMovie.genres?.slice(0, 2).join(' · ')}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--cine-accent)',
                    letterSpacing: '0.08em',
                  }}
                >
                  BOOK →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
        }
      `}</style>
    </div>
  );
};
