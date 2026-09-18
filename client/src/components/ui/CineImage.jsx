import React, { useState, useEffect } from 'react';
import { Film } from 'lucide-react';
import { isValidImageUrl, FALLBACK_ASSETS } from '../../services/imageService';

/**
 * CineImage - Resilient Cinematic Image Component
 * Handles lazy loading, graceful fallback transitions, loading skeletons,
 * aspect ratio locks, and avoids broken image icons or layout shift.
 */
export const CineImage = ({
  src,
  alt = 'CineAI Media',
  fallbackSrc = FALLBACK_ASSETS.moviePoster,
  aspectRatio = '2/3', // '2/3' | '16/9' | '1/1' | 'auto'
  objectFit = 'cover',
  className = '',
  style = {},
  placeholder = null,
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isValidImageUrl(src)) {
      setCurrentSrc(src);
      setHasError(false);
      setIsLoaded(false);
    } else {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
      setIsLoaded(true);
    }
  }, [src, fallbackSrc]);

  const handleImageError = (e) => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      if (onError) onError(e);
    } else {
      setIsLoaded(true);
    }
  };

  const handleImageLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  return (
    <div
      className={`cine-image-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: aspectRatio === 'auto' ? 'auto' : aspectRatio,
        backgroundColor: 'var(--cine-surface-2)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, var(--cine-surface-2) 0%, var(--cine-surface-3) 50%, var(--cine-surface-2) 100%)',
            backgroundSize: '200% 100%',
            animation: 'cineShimmer 1.8s infinite',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Film size={24} color="var(--cine-text-dim)" opacity={0.4} />
        </div>
      )}

      {/* Primary Image */}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          display: 'block',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        {...props}
      />
    </div>
  );
};

export default CineImage;
