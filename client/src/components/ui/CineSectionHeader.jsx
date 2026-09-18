import React from 'react';

export const CineSectionHeader = ({
  eyebrow,
  title,
  subtitle,
  action,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
        ...style,
      }}
    >
      <div>
        {eyebrow && (
          <div className="cine-eyebrow" style={{ marginBottom: '6px' }}>
            <span>✦</span> {eyebrow}
          </div>
        )}
        <h2 className="cine-h2" style={{ margin: 0, letterSpacing: '-0.01em' }}>
          {title}
        </h2>
        {subtitle && (
          <p className="cine-subtitle" style={{ fontSize: '0.9rem', marginTop: '4px', maxWidth: '600px' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div style={{ alignSelf: 'center' }}>
          {action}
        </div>
      )}
    </div>
  );
};

export const CinePageHeader = ({
  eyebrow,
  title,
  subtitle,
  children,
}) => {
  return (
    <div style={{ paddingTop: '32px', marginBottom: '36px' }}>
      {eyebrow && (
        <div className="cine-eyebrow" style={{ marginBottom: '8px' }}>
          <span>✦</span> {eyebrow}
        </div>
      )}
      <h1 className="cine-display-title" style={{ margin: '0 0 10px 0' }}>
        {title}
      </h1>
      {subtitle && (
        <p className="cine-subtitle" style={{ maxWidth: '680px', margin: '0 0 16px 0' }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
};

export default CineSectionHeader;
