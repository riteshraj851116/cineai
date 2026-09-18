import React, { useState } from 'react';

export const CineTooltip = ({
  content,
  children,
  position = 'top',
  delay = 150,
}) => {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setVisible(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setVisible(false);
  };

  const positionStyles = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%) translateY(-8px)',
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%) translateY(8px)',
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%) translateX(-8px)',
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%) translateX(8px)',
    },
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {visible && content && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 1000,
            background: 'var(--cine-surface-3)',
            border: '1px solid var(--cine-border)',
            borderRadius: 'var(--cine-radius-sm)',
            padding: '6px 10px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--cine-text)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: 'var(--cine-shadow-lg)',
            ...positionStyles[position],
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default CineTooltip;
