import React from 'react';

export const CineContainer = ({
  children,
  size = 'default',
  className = '',
  style = {},
  ...props
}) => {
  const maxMap = {
    narrow: '960px',
    default: '1360px',
    wide: '1540px',
    full: '100%',
  };

  return (
    <div
      className={`cine-container ${className}`}
      style={{
        width: '100%',
        maxWidth: maxMap[size] || maxMap.default,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 'var(--cine-container-pad, 24px)',
        paddingRight: 'var(--cine-container-pad, 24px)',
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default CineContainer;
