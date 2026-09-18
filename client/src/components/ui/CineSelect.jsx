import React, { forwardRef } from 'react';

export const CineSelect = forwardRef(({
  label,
  error,
  options = [],
  children,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="cine-form-group">
      {label && (
        <label htmlFor={selectId} className="cine-label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`cine-select ${className}`}
        style={{
          borderColor: error ? '#EF4444' : undefined,
        }}
        {...props}
      >
        {children ? children : options.map((opt) => {
          const value = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={value} value={value} style={{ background: '#121216', color: '#FFF' }}>
              {optLabel}
            </option>
          );
        })}
      </select>
      {error && (
        <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '2px', fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  );
});

CineSelect.displayName = 'CineSelect';
export default CineSelect;
