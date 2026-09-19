import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Volume2,
  Target,
  Crown,
  Users,
  Heart,
  Zap,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export const AISeatAssistant = ({ isOpen, onClose, onRecommend, loading }) => {
  const [preference, setPreference] = useState('Best overall');
  const [partySize, setPartySize] = useState(2);

  if (!isOpen) return null;

  const options = [
    {
      id: 'Best overall',
      title: 'Optimal Acoustics (Dolby Atmos)',
      subtitle: 'Rows D–F center axis. Perfect 64-channel spatial sound calibration and zero phase distortion.',
      icon: Volume2,
      accent: '#06B6D4',
      badge: 'RECOMMENDED',
    },
    {
      id: 'Near center',
      title: 'Direct Center Focal Angle',
      subtitle: 'Exact geometric auditorium center. Balanced 120° visual throw with zero peripheral parallax.',
      icon: Target,
      accent: '#E11D48',
      badge: 'SIGHTLINE',
    },
    {
      id: 'Premium',
      title: 'VIP Recliner Luxury',
      subtitle: 'Back tiers with electric recliners, maximum legroom, and expansive panoramic screen coverage.',
      icon: Crown,
      accent: '#F1B24A',
      badge: 'LUXURY',
    },
    {
      id: 'Sit together',
      title: 'Adjacent Group Block',
      subtitle: 'Guaranteed uninterrupted contiguous seats side-by-side with clear line-of-sight.',
      icon: Users,
      accent: '#10B981',
      badge: 'SOCIAL',
    },
    {
      id: 'Away from screen',
      title: 'Elevated Back Tiers',
      subtitle: 'Higher row positioning for relaxed neck posture and complete auditorium overview.',
      icon: Heart,
      accent: '#A855F7',
      badge: 'RELAXED',
    },
    {
      id: 'Budget',
      title: 'Budget Value Front Tiers',
      subtitle: 'Front and mid-front rows with standard category pricing and high kinetic immersion.',
      icon: Zap,
      accent: '#F59E0B',
      badge: 'VALUE',
    },
  ];

  const partyOptions = [
    { count: 1, label: 'Solo', desc: 'Single Spot' },
    { count: 2, label: 'Pair', desc: '2 Adjacent', recommended: true },
    { count: 3, label: 'Trio', desc: '3 in a Row' },
    { count: 4, label: 'Quad', desc: '4 Friends' },
    { count: 5, label: 'Group', desc: '5+ Seats' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onRecommend({ preference, partySize: Number(partySize) });
    onClose();
  };

  return (
    <div className="ai-modal-backdrop" onClick={onClose}>
      <div
        className="ai-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          padding: '24px',
          background: 'rgba(13, 15, 22, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '24px',
          boxShadow: '0 24px 70px -10px rgba(0, 0, 0, 0.85), 0 0 30px rgba(6, 182, 212, 0.15)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #E11D48, #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.4)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  CineAI Neural Seat Optimizer
                </span>
                <span
                  style={{
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: '#06B6D4',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    letterSpacing: '0.06em',
                  }}
                >
                  DOLBY ATMOS
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '2px' }}>
                Calibrates auditorium acoustic sweet spots & optimal geometric sightlines.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94A3B8',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFF';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94A3B8';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            }}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Acoustic Schematic Preview */}
        <div
          style={{
            background: 'radial-gradient(ellipse at center bottom, rgba(6, 182, 212, 0.12) 0%, rgba(15, 17, 25, 0.8) 70%)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '14px',
            padding: '12px 16px',
            marginBottom: '18px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: '#06B6D4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={13} /> Auditorium Acoustic Calibration Zone
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontFamily: 'monospace' }}>
              ROWS D, E, F • CENTER CLUSTER
            </span>
          </div>
          {/* Visual curved screen bar */}
          <div style={{ width: '60%', height: '3px', background: 'linear-gradient(90deg, transparent, #FFFFFF, transparent)', margin: '0 auto 6px auto', borderRadius: '2px', boxShadow: '0 -2px 8px rgba(255, 255, 255, 0.8)' }} />
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#64748B', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
            SCREEN DIRECTION
          </div>
          {/* Miniature seat rows illustration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
            {[8, 10, 12, 12, 10].map((count, rIdx) => {
              const isSweetSpot = rIdx === 2 || rIdx === 3;
              return (
                <div key={rIdx} style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.58rem', color: isSweetSpot ? '#06B6D4' : '#475569', width: '12px', textAlign: 'right', fontWeight: 700 }}>
                    {String.fromCharCode(65 + rIdx)}
                  </span>
                  {Array.from({ length: count }).map((_, cIdx) => {
                    const isCenter = cIdx >= Math.floor(count / 2) - 1 && cIdx <= Math.floor(count / 2) + 1;
                    const isTarget = isSweetSpot && isCenter;
                    return (
                      <div
                        key={cIdx}
                        style={{
                          width: '8px',
                          height: '6px',
                          borderRadius: '1px',
                          background: isTarget
                            ? '#06B6D4'
                            : isSweetSpot
                            ? 'rgba(6, 182, 212, 0.35)'
                            : 'rgba(255, 255, 255, 0.15)',
                          boxShadow: isTarget ? '0 0 6px #06B6D4' : 'none',
                        }}
                      />
                    );
                  })}
                  <span style={{ fontSize: '0.58rem', color: isSweetSpot ? '#06B6D4' : '#475569', width: '12px', fontWeight: 700 }}>
                    {String.fromCharCode(65 + rIdx)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Party Size Stepper */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
              HOW MANY TICKETS?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {partyOptions.map((opt) => {
                const isSelected = partySize === opt.count;
                return (
                  <button
                    type="button"
                    key={opt.count}
                    onClick={() => setPartySize(opt.count)}
                    style={{
                      padding: '10px 4px',
                      borderRadius: '10px',
                      background: isSelected ? 'linear-gradient(135deg, #E11D48, #BE123C)' : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? '#FFFFFF' : '#94A3B8',
                      border: isSelected ? '1px solid #E11D48' : '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 14px rgba(225, 29, 72, 0.4)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 900 }}>{opt.count}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, marginTop: '2px', opacity: 0.85 }}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preference Cards */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
              SELECT CINEMA SENSORY PREFERENCE
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '230px', overflowY: 'auto', paddingRight: '4px' }}>
              {options.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = preference === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPreference(opt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? `1px solid ${opt.accent}` : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 0 16px ${opt.accent}25` : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: isSelected ? opt.accent : 'rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? '#000' : '#94A3B8',
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={17} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? '#FFFFFF' : '#E2E8F0' }}>
                          {opt.title}
                        </span>
                        {opt.badge && (
                          <span
                            style={{
                              fontSize: '0.6rem',
                              fontWeight: 800,
                              color: opt.accent,
                              background: `${opt.accent}20`,
                              padding: '1px 5px',
                              borderRadius: '4px',
                            }}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px', lineHeight: 1.3 }}>
                        {opt.subtitle}
                      </div>
                    </div>

                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: isSelected ? `5px solid ${opt.accent}` : '2px solid rgba(255, 255, 255, 0.2)',
                        background: isSelected ? '#FFF' : 'transparent',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: '0 8px 24px rgba(225, 29, 72, 0.45)',
              transition: 'all 0.2s ease',
            }}
          >
            <Sparkles size={16} />
            <span>{loading ? 'CALIBRATING AUDITORIUM ACOUSTICS...' : `FIND BEST ${partySize} SEATS →`}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AISeatAssistant;
