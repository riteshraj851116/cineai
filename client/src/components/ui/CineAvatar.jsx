import React from 'react';

export const CineAvatar = ({
  src,
  name = 'User',
  size = 38,
  status, // online | offline | undefined
  className = '',
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const [hasError, setHasError] = React.useState(false);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        flexShrink: 0,
      }}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={name}
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid var(--cine-border)',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--cine-surface-3) 0%, #09090B 100%)',
            border: '1px solid var(--cine-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: `${size * 0.38}px`,
            fontFamily: 'var(--cine-font-sans)',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
          }}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: '1px',
            right: '1px',
            width: `${Math.max(size * 0.25, 8)}px`,
            height: `${Math.max(size * 0.25, 8)}px`,
            borderRadius: '50%',
            backgroundColor: status === 'online' ? 'var(--cine-emerald)' : 'var(--cine-dim)',
            border: '2px solid var(--cine-bg)',
          }}
        />
      )}
    </div>
  );
};

export default CineAvatar;
