import React from 'react';
import { Loader2 } from 'lucide-react';

export const CineLoader = ({
  text = 'LOADING CINEMATIC DATA...',
  size = 32,
  minHeight = '300px',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        minHeight,
        width: '100%',
        color: 'var(--cine-muted)',
      }}
    >
      <Loader2
        size={size}
        color="var(--cine-accent)"
        style={{ animation: 'cineSpin 0.9s linear infinite' }}
      />
      {text && (
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--cine-muted)',
          }}
        >
          {text}
        </span>
      )}
      <style>{`
        @keyframes cineSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CineLoader;
