import React from 'react';

export const CineBadge = ({
  children,
  variant = 'neutral', // neutral | accent | gold | emerald | outline
  size = 'md',        // sm | md
  className = '',
  style = {},
}) => {
  const variantClass = `cine-badge-${variant}`;
  return (
    <span
      className={`cine-badge ${variantClass} ${className}`}
      style={{
        fontSize: size === 'sm' ? '0.65rem' : '0.72rem',
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default CineBadge;
