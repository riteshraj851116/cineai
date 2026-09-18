import React from 'react';
import { useCity } from '../../context/CityContext';
import { MapPin, X, Check } from 'lucide-react';

export const CityModal = () => {
  const { isCityModalOpen, setIsCityModalOpen, selectedCity, changeCity, citiesList } = useCity();

  if (!isCityModalOpen) return null;

  return (
    <div className="cine-modal-backdrop" onClick={() => setIsCityModalOpen(false)}>
      <div className="cine-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: 'var(--cine-space-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={22} style={{ color: 'var(--cine-accent)' }} />
            <h3 style={{ fontFamily: 'var(--cine-font-heading)', fontSize: '1.4rem', color: 'var(--cine-text)', margin: 0, letterSpacing: '0.04em' }}>
              SELECT CINEMA REGION
            </h3>
          </div>
          <button 
            onClick={() => setIsCityModalOpen(false)} 
            style={{ color: 'var(--cine-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--cine-muted)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.5 }}>
          Localize schedules, technical auditorium formats, and live seat maps for your designated metropolitan area.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {citiesList.map((city) => {
            const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
            return (
              <button
                key={city}
                onClick={() => changeCity(city)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: isSelected ? 'rgba(255, 64, 56, 0.14)' : 'var(--cine-surface-2)',
                  border: isSelected ? '1px solid var(--cine-accent)' : '1px solid var(--cine-border)',
                  borderRadius: 'var(--cine-radius-sm)',
                  color: isSelected ? '#FFFFFF' : 'var(--cine-muted)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--cine-font-heading)',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{city.toUpperCase()}</span>
                {isSelected && <Check size={16} style={{ color: 'var(--cine-accent)' }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
