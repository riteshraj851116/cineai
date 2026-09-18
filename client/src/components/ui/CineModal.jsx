import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const CineModal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '540px',
  showClose = true,
  className = '',
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
    <div className="cine-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`cine-modal-container ${className}`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="cine-modal-header">
            {title && (
              <h3 style={{ fontFamily: 'var(--cine-font-display)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {title}
              </h3>
            )}
            {showClose && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  color: 'var(--cine-muted)',
                  padding: '6px',
                  borderRadius: 'var(--cine-radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color var(--cine-transition-fast), background var(--cine-transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--cine-muted)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="cine-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CineModal;
