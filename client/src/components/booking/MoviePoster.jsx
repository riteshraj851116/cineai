import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const MoviePoster = ({ posterUrl, title }) => {
  const posterRef = useRef(null);

  useEffect(() => {
    if (posterRef.current) {
      gsap.fromTo(
        posterRef.current,
        { opacity: 0, scale: 0.96, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'power2.out' }
      );
    }
  }, [posterUrl]);

  return (
    <div ref={posterRef} className="cinema-poster-frame">
      <img
        src={posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'}
        alt={title || 'Movie Poster'}
        className="cinema-poster-img"
        loading="lazy"
      />
    </div>
  );
};
