import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

export const PageTransition = ({ children }) => {
  const location = useLocation();
  const containerRef = useRef(null);

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (containerRef.current) {
      window.scrollTo(0, 0);
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [location.pathname]);

  return (
    <div ref={containerRef} style={{ width: '100%', minHeight: '100%' }}>
      {children}
    </div>
  );
};
