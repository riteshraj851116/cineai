import React from 'react';

export const CineCard = ({
  children,
  hoverable = true,
  className = '',
  onClick,
  style = {},
  ...props
}) => {
  return (
    <div
      className={`cine-card ${hoverable ? 'cine-card-hover' : ''} ${className}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default CineCard;
