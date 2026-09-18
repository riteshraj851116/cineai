import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Shield, Sparkles, Heart } from 'lucide-react';

export const CineFooter = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--cine-surface)',
        borderTop: '1px solid var(--cine-border)',
        padding: '60px 0 32px 0',
        marginTop: 'auto',
      }}
    >
      <div className="cine-page-container">
        {/* Main 4-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Brand Col */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-display)',
                fontSize: '1.9rem',
                letterSpacing: '0.06em',
                color: '#FFFFFF',
                marginBottom: '10px',
              }}
            >
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cine-accent)',
                  boxShadow: '0 0 10px var(--cine-accent)',
                }}
              />
              <span>CINEAI</span>
            </div>
            <p className="cine-body-muted" style={{ fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '14px' }}>
              Autonomous digital cinema magazine & real-time IMAX/Dolby exhibition booking ecosystem built for cinematic purists.
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--cine-accent)', fontWeight: 800 }}>
              VERSION 4.0 • HIGH PERFORMANCE
            </div>
          </div>

          {/* Navigation Col */}
          <div>
            <div className="cine-eyebrow">EXPLORE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
              <Link to="/movies" style={{ color: 'var(--cine-muted)', transition: 'color 0.2s' }}>
                Now Showing
              </Link>
              <Link to="/cinemas" style={{ color: 'var(--cine-muted)', transition: 'color 0.2s' }}>
                Cinemas & Formats
              </Link>
              <Link to="/ai" style={{ color: 'var(--cine-muted)', transition: 'color 0.2s' }}>
                AI Taste Concierge
              </Link>
              <Link to="/community" style={{ color: 'var(--cine-muted)', transition: 'color 0.2s' }}>
                Cinephile Community
              </Link>
              <Link to="/rewards" style={{ color: 'var(--cine-muted)', transition: 'color 0.2s' }}>
                CinePoints Club
              </Link>
            </div>
          </div>

          {/* Architecture Specs Col */}
          <div>
            <div className="cine-eyebrow">ENGINEERING SPECS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem', color: 'var(--cine-muted)', fontFamily: 'var(--font-mono)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--cine-accent)' }}>•</span> SOCKET.IO REAL-TIME LOCKS
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--cine-accent)' }}>•</span> 256-BIT CRYPTOGRAPHIC QR PASS
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--cine-accent)' }}>•</span> ATOMIC TRANSACTION SAFEGUARDS
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--cine-accent)' }}>•</span> WEBGL / THREE.JS PARTICLES
              </span>
            </div>
          </div>

          {/* Cities Col */}
          <div>
            <div className="cine-eyebrow">ACTIVE METROS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['MUMBAI', 'DELHI-NCR', 'BENGALURU', 'HYDERABAD', 'CHENNAI', 'KOLKATA', 'PUNE'].map((city) => (
                <span
                  key={city}
                  className="cine-badge"
                  style={{ fontSize: '0.65rem', padding: '3px 8px' }}
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Legal Colophon Line */}
        <div
          style={{
            borderTop: '1px solid var(--cine-border)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            fontSize: '0.74rem',
            color: 'var(--cine-dim)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div>© 2026 CINEAI ENTERTAINMENT. ALL RIGHTS RESERVED.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ color: 'var(--cine-muted)' }}>PRIVACY POLICY</span>
            <span style={{ color: 'var(--cine-muted)' }}>TERMS OF SERVICE</span>
            <span style={{ color: 'var(--cine-muted)' }}>100% OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
