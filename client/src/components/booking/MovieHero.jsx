import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ThreeCinematicParticles } from './ThreeCinematicParticles';

export const MovieHero = ({ movie, onOpenAuth, onOpenSearch }) => {
  const titleRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    // GSAP Entrance Animation
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }

    // Subtle cursor parallax
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const xOffset = (clientX / window.innerWidth - 0.5) * 12;
      const yOffset = (clientY / window.innerHeight - 0.5) * 8;

      gsap.to(heroRef.current, {
        backgroundPosition: `calc(50% + ${xOffset}px) calc(25% + ${yOffset}px)`,
        duration: 0.6,
        ease: 'power1.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [movie]);

  const backdropUrl = movie?.backdrop || movie?.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80';

  return (
    <div
      ref={heroRef}
      className="cinema-hero-container"
      style={{ backgroundImage: `url(${backdropUrl})` }}
    >
      <div className="cinema-hero-overlay" />
      <ThreeCinematicParticles />

      {/* Hero Movie Title */}
      <div ref={titleRef} className="cinema-hero-title-wrap">
        <h1 className="cinema-hero-title">
          {movie?.title || 'THE LAST VOYAGE'}
        </h1>
        <div className="cinema-hero-subtitle">
          {movie?.genres?.join(' • ') || 'ACTION • SCI-FI • CINEMA EXHIBITION'}
        </div>
      </div>
    </div>
  );
};
