import React from 'react';

export const CineIconButton = ({
  icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  badge = null,
  disabled = false,
  ariaLabel,
  title,
  style = {},
  className = '',
  ...props
}) => {
  const sizeMap = {
    sm: { width: '32px', height: '32px', fontSize: '14px' },
    md: { width: '40px', height: '40px', fontSize: '18px' },
    lg: { width: '48px', height: '48px', fontSize: '22px' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const variantStyles = {
    primary: {
      background: 'var(--cine-accent)',
      color: '#FFFFFF',
      border: '1px solid var(--cine-accent)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--cine-text)',
      border: '1px solid var(--cine-border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--cine-text-muted)',
      border: '1px solid transparent',
    },
    surface: {
      background: 'var(--cine-surface-2)',
      color: 'var(--cine-text)',
      border: '1px solid var(--cine-border)',
    },
  };

  const selectedVariant = variantStyles[variant] || variantStyles.ghost;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || title}
      title={title}
      className={`cine-icon-btn ${className}`}
      style={{
        ...currentSize,
        ...selectedVariant,
        borderRadius: 'var(--cine-radius-md)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        position: 'relative',
        padding: 0,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && variant === 'ghost') {
          e.currentTarget.style.background = 'var(--cine-surface-2)';
          e.currentTarget.style.color = 'var(--cine-text)';
        } else if (!disabled && variant === 'outline') {
          e.currentTarget.style.borderColor = 'var(--cine-border-hover)';
          e.currentTarget.style.color = '#FFFFFF';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && variant === 'ghost') {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--cine-text-muted)';
        } else if (!disabled && variant === 'outline') {
          e.currentTarget.style.borderColor = 'var(--cine-border)';
          e.currentTarget.style.color = 'var(--cine-text)';
        }
      }}
      {...props}
    >
      {icon}
      {badge !== null && badge > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-3px',
            right: '-3px',
            background: 'var(--cine-accent)',
            color: '#FFFFFF',
            fontSize: '0.65rem',
            fontWeight: 800,
            padding: '2px 5px',
            borderRadius: '999px',
            minWidth: '16px',
            textAlign: 'center',
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

export default CineIconButton;
