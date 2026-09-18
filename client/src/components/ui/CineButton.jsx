import React from 'react';
import { Loader2 } from 'lucide-react';

export const CineButton = ({
  children,
  variant = 'primary', // primary | secondary | outline | ghost | danger
  size = 'md',        // sm | md | lg | icon
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  onClick,
  style = {},
  ...props
}) => {
  const variantClass = `cine-btn-${variant}`;
  const sizeClass = size === 'md' ? '' : `cine-btn-${size}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`cine-btn ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      style={style}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" style={{ animation: 'cineSpin 0.8s linear infinite' }} />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
          {children}
        </>
      )}
    </button>
  );
};

export default CineButton;
