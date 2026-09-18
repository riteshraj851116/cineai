import React from 'react';
import { Link } from 'react-router-dom';
import CineButton from '../components/ui/CineButton';

export const NotFound = () => {
  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 'var(--cine-space-6) var(--cine-space-4)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '480px',
        height: '480px',
        background: 'radial-gradient(circle, rgba(255, 64, 56, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '999px',
          background: 'rgba(255, 64, 56, 0.1)',
          border: '1px solid rgba(255, 64, 56, 0.25)',
          color: 'var(--cine-accent)',
          fontSize: '0.75rem',
          fontFamily: 'var(--cine-font-heading)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: 'var(--cine-space-4)'
        }}>
          <span>✦</span> SIGNAL DISRUPTED
        </div>

        <h1 style={{
          fontFamily: 'var(--cine-font-display)',
          fontSize: 'clamp(5rem, 15vw, 10rem)',
          lineHeight: 0.9,
          color: 'var(--cine-text)',
          margin: 0,
          letterSpacing: '0.04em'
        }}>
          404
        </h1>

        <h2 style={{
          fontFamily: 'var(--cine-font-heading)',
          fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
          color: 'var(--cine-text)',
          marginTop: 'var(--cine-space-3)',
          marginBottom: 'var(--cine-space-3)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          REEL NOT FOUND.
        </h2>

        <p style={{
          color: 'var(--cine-muted)',
          fontSize: '1rem',
          lineHeight: 1.6,
          marginBottom: 'var(--cine-space-6)',
          maxWidth: '460px',
          marginInline: 'auto'
        }}>
          The scene or projection room you are searching for has been moved, archived, or does not exist in CineAI's current filmography.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/">
            <CineButton variant="primary">
              RETURN TO CINEMA
            </CineButton>
          </Link>
          <Link to="/movies">
            <CineButton variant="outline">
              EXPLORE FILMS
            </CineButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
