/**
 * CineAI Centralized Image System
 * Provides guaranteed fallback hierarchy, aspect-ratio preservation,
 * and graceful error handling across movies, cinemas, screens, and profiles.
 */

// Fallback high-definition cinematic assets
export const FALLBACK_ASSETS = {
  moviePoster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
  movieBackdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
  cinemaInterior: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
  cinemaExterior: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
  concessions: 'https://images.unsplash.com/photo-1572177812156-58036aae439c?auto=format&fit=crop&w=800&q=80',
};

/**
 * Returns initials from a full name (e.g. "Christopher Nolan" -> "CN")
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'CI';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Generates an SVG Data URI for an initials avatar
 */
export const generateAvatarSvg = (name = 'User', bg = '#18181b', text = '#ffffff') => {
  const initials = getInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#27272a"/>
        <stop offset="100%" stop-color="#09090b"/>
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="64" fill="url(#g)"/>
    <circle cx="64" cy="64" r="62" stroke="#e50914" stroke-width="2" fill="none" opacity="0.4"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="${text}" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="44" letter-spacing="2">
      ${initials}
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Validates whether an image URL string is non-empty and well-formed
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:');
};

/**
 * Resolve movie poster with fallback hierarchy:
 * 1. poster
 * 2. posterUrl
 * 3. backdrop
 * 4. Fallback asset
 */
export const getMoviePoster = (movie) => {
  if (!movie) return FALLBACK_ASSETS.moviePoster;
  if (isValidImageUrl(movie.poster)) return movie.poster;
  if (isValidImageUrl(movie.posterUrl)) return movie.posterUrl;
  if (isValidImageUrl(movie.backdrop)) return movie.backdrop;
  return FALLBACK_ASSETS.moviePoster;
};

/**
 * Resolve movie backdrop with fallback hierarchy:
 * 1. backdrop
 * 2. backdropUrl
 * 3. poster
 * 4. Fallback asset
 */
export const getMovieBackdrop = (movie) => {
  if (!movie) return FALLBACK_ASSETS.movieBackdrop;
  if (isValidImageUrl(movie.backdrop)) return movie.backdrop;
  if (isValidImageUrl(movie.backdropUrl)) return movie.backdropUrl;
  if (isValidImageUrl(movie.poster)) return movie.poster;
  return FALLBACK_ASSETS.movieBackdrop;
};

/**
 * Resolve cinema/theatre image with fallback hierarchy:
 * 1. images[0]
 * 2. coverImage
 * 3. image
 * 4. Fallback cinema interior
 */
export const getCinemaImage = (theatre) => {
  if (!theatre) return FALLBACK_ASSETS.cinemaInterior;
  if (Array.isArray(theatre.images) && theatre.images.length > 0 && isValidImageUrl(theatre.images[0])) {
    return theatre.images[0];
  }
  if (isValidImageUrl(theatre.coverImage)) return theatre.coverImage;
  if (isValidImageUrl(theatre.image)) return theatre.image;
  return FALLBACK_ASSETS.cinemaInterior;
};

/**
 * Resolve user avatar with fallback hierarchy:
 * 1. avatar
 * 2. profilePicture
 * 3. photoUrl
 * 4. SVG initials data URI
 */
export const getAvatarUrl = (user) => {
  if (!user) return generateAvatarSvg('Guest');
  if (isValidImageUrl(user.avatar)) return user.avatar;
  if (isValidImageUrl(user.profilePicture)) return user.profilePicture;
  if (isValidImageUrl(user.photoUrl)) return user.photoUrl;
  return generateAvatarSvg(user.name || user.username || 'User');
};

export const imageService = {
  getMoviePoster,
  getMovieBackdrop,
  getCinemaImage,
  getAvatarUrl,
  getInitials,
  generateAvatarSvg,
  isValidImageUrl,
  FALLBACK_ASSETS,
};

export default imageService;
