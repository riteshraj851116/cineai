import React, { forwardRef } from 'react';

export const CineInput = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="cine-form-group">
      {label && (
        <label htmlFor={inputId} className="cine-label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--cine-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`cine-input ${className}`}
          style={{
            paddingLeft: Icon ? '40px' : '16px',
            borderColor: error ? '#EF4444' : undefined,
          }}
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '2px', fontWeight: 600 }}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--cine-dim)', marginTop: '2px' }}>
          {helperText}
        </span>
      )}
    </div>
  );
});

CineInput.displayName = 'CineInput';
export default CineInput;
