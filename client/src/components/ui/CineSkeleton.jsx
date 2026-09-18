import React from 'react';

export const CineSkeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--cine-radius-sm)',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`cine-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

export const CineMovieCardSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <CineSkeleton height="320px" borderRadius="var(--cine-radius-lg)" />
    <CineSkeleton height="18px" width="75%" />
    <CineSkeleton height="14px" width="50%" />
  </div>
);

export default CineSkeleton;
