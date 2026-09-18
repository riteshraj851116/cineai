import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export const MagneticButton = ({
  children,
  className = '',
  style = {},
  onClick,
  strength = 0.25,
  ...props
}) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn || window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);

      gsap.to(btn, {
        x: relX * strength,
        y: relY * strength,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)',
      });
    };

    btn.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      btn.removeEventListener('mousemove', handleMouseMove);
      btn.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(btn);
    };
  }, [strength]);

  return (
    <button
      ref={buttonRef}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        willChange: 'transform',
        ...style,
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
