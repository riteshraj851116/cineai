import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const CineDrawer = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right', // right | left | bottom
  width = '360px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 1050,
        display: 'flex',
        justifyContent: position === 'right' ? 'flex-end' : position === 'left' ? 'flex-start' : 'center',
        alignItems: position === 'bottom' ? 'flex-end' : 'stretch',
        animation: 'cineFadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: position === 'bottom' ? '100%' : width,
          maxWidth: '100vw',
          maxHeight: position === 'bottom' ? '85vh' : '100vh',
          backgroundColor: 'var(--cine-surface)',
          borderLeft: position === 'right' ? '1px solid var(--cine-border)' : 'none',
          borderRight: position === 'left' ? '1px solid var(--cine-border)' : 'none',
          borderTop: position === 'bottom' ? '1px solid var(--cine-border)' : 'none',
          borderRadius: position === 'bottom' ? '20px 20px 0 0' : 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--cine-shadow-modal)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--cine-border)',
          }}
        >
          <h3 style={{ fontFamily: 'var(--cine-font-display)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              color: 'var(--cine-muted)',
              padding: '6px',
              borderRadius: 'var(--cine-radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CineDrawer;
