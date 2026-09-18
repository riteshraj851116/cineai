import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

export const AISeatAssistant = ({ isOpen, onClose, onRecommend, loading }) => {
  const [preference, setPreference] = useState('Best overall');
  const [partySize, setPartySize] = useState(2);

  if (!isOpen) return null;

  const options = [
    { id: 'Best overall', label: 'Best overall acoustics & sightlines' },
    { id: 'Near center', label: 'Center view (Direct focal angle)' },
    { id: 'Sit together', label: 'Sit together (Adjacent consecutive seats)' },
    { id: 'Away from screen', label: 'Away from screen (Elevated back tiers)' },
    { id: 'Premium', label: 'Premium experience (Recliner / VIP lounge)' },
    { id: 'Budget', label: 'Budget friendly (Standard front tier)' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onRecommend({ preference, partySize: Number(partySize) });
    onClose();
  };

  return (
    <div className="ai-modal-backdrop" onClick={onClose}>
      <div className="ai-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <div className="ai-modal-title">
            <Sparkles size={16} color="var(--cinema-accent)" />
            <span>CINEAI SEAT ASSISTANT</span>
          </div>
          <button onClick={onClose} className="ai-modal-close" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.74rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cinema-text-secondary)', display: 'block', marginBottom: '8px' }}>
              PARTY SIZE
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4].map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setPartySize(size)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '4px',
                    background: partySize === size ? 'var(--cinema-accent)' : 'rgba(255, 255, 255, 0.04)',
                    color: partySize === size ? '#FFFFFF' : 'var(--cinema-text-secondary)',
                    border: '1px solid var(--cinema-border)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {size} {size === 1 ? 'Seat' : 'Seats'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.74rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cinema-text-secondary)', display: 'block', marginBottom: '10px' }}>
              WHAT MATTERS MOST?
            </label>
            <div className="ai-modal-body">
              {options.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setPreference(opt.id)}
                  className={`ai-option-item ${preference === opt.id ? 'selected' : ''}`}
                >
                  <div className="ai-option-radio" />
                  <span>{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cinema-continue"
            style={{ width: '100%' }}
          >
            {loading ? 'ANALYZING AUDITORIUM...' : 'FIND SEATS →'}
          </button>
        </form>
      </div>
    </div>
  );
};
