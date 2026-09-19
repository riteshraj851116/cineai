import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { showService } from '../services/showService';
import { reviewService } from '../services/reviewService';
import { watchlistService } from '../services/watchlistService';
import { useCity } from '../context/CityContext';
import { useAuth } from '../context/AuthContext';
import {
  CineButton,
  CineBadge,
  CineModal,
  CineMovieCard,
  CineLoader,
  CineCard,
  CineSectionHeader,
  CineAvatar,
  CineImage,
} from '../components/ui';
import { getMoviePoster, getMovieBackdrop } from '../services/imageService';
import {
  Star,
  Clock,
  Play,
  Heart,
  Calendar,
  MapPin,
  Ticket,
  MessageSquare,
  Sparkles,
  Share2,
  ChevronRight,
  ShieldCheck,
  Send,
  Bot,
  Volume2,
  Zap,
} from 'lucide-react';

export const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedCity } = useCity();
  const { user } = useAuth();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  // Review Form
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Generate next 5 dates for showtime tabs
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      fullDate: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    });
  }

  useEffect(() => {
    if (!selectedDate && dates.length > 0) {
      setSelectedDate(dates[0].fullDate);
    }
  }, []);

  const fetchMovieDetails = async () => {
    setLoading(true);
    try {
      const isSlug = !id.match(/^[0-9a-fA-F]{24}$/);
      const moviePromise = isSlug ? movieService.getMovieBySlug(id) : movieService.getMovieById(id);

      const [movieRes, reviewsRes] = await Promise.all([
        moviePromise,
        reviewService.getReviewsByMovie(id),
      ]);

      if (movieRes.data?.success) {
        setMovie(movieRes.data.movie);
      }
      if (reviewsRes.data?.success) {
        setReviews(reviewsRes.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load movie details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShows = async () => {
    if (!movie?._id) return;
    try {
      const { data } = await showService.getShows({
        movieId: movie._id,
        city: selectedCity,
        date: selectedDate,
      });
      if (data.success) {
        setShows(data.shows || []);
      }
    } catch (err) {
      console.error('Failed to fetch shows:', err);
    }
  };

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    if (movie?._id) {
      fetchShows();
    }
  }, [movie?._id, selectedCity, selectedDate]);

  const handleWatchlistToggle = async () => {
    if (!user) {
      alert('Please sign in to save movies to your watchlist.');
      return;
    }
    try {
      const { data } = await watchlistService.toggleWatchlist(movie._id);
      if (data.success) {
        setInWatchlist(data.inWatchlist);
      }
    } catch (err) {
      console.error('Watchlist toggle failed:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to submit a review.');
      return;
    }
    if (!userComment.trim()) return;

    setSubmittingReview(true);
    setReviewSuccess('');
    try {
      const { data } = await reviewService.submitReview({
        movieId: movie._id,
        rating: Number(userRating),
        comment: userComment,
      });

      if (data.success) {
        setReviewSuccess('✓ Perspective published! +25 CinePoints awarded.');
        setUserComment('');
        // Refresh reviews
        const res = await reviewService.getReviewsByMovie(movie._id);
        if (res.data?.success) setReviews(res.data.reviews || []);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Group shows by Theatre
  const showsByTheatre = shows.reduce((acc, show) => {
    const theatreId = show.theatre?._id || 'other';
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre: show.theatre,
        shows: [],
      };
    }
    acc[theatreId].shows.push(show);
    return acc;
  }, {});

  if (loading) {
    return <CineLoader text="SYNCHRONIZING MOVIE INFORMATION..." minHeight="80vh" />;
  }

  if (!movie) {
    return (
      <div className="cine-page-container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2 className="cine-h2" style={{ marginBottom: '12px' }}>MOVIE NOT FOUND</h2>
        <p style={{ color: 'var(--cine-muted)', marginBottom: '24px' }}>
          The requested theatrical title could not be located in the current database catalog.
        </p>
        <CineButton variant="primary" onClick={() => navigate('/movies')}>
          BACK TO MOVIES
        </CineButton>
      </div>
    );
  }

  const {
    title,
    poster,
    backdrop,
    rating,
    genres = [],
    duration,
    languages = [],
    certification,
    releaseDate,
    description,
    cast = [],
    crew = [],
    trailerUrl,
    formats = [],
  } = movie;

  // Extract YouTube embed URL if available
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
  };

  return (
    <div style={{ paddingBottom: '96px' }}>
      {/* ===================================================================
          1. CINEMATIC BACKDROP HERO
          =================================================================== */}
      <div
        style={{
          position: 'relative',
          minHeight: '68vh',
          display: 'flex',
          alignItems: 'flex-end',
          backgroundColor: '#000000',
          backgroundImage: `linear-gradient(to top, var(--cine-bg) 5%, rgba(9, 9, 11, 0.8) 50%, rgba(9, 9, 11, 0.4) 100%), url(${getMovieBackdrop(movie)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          paddingBottom: '48px',
        }}
      >
        <div className="cine-page-container" style={{ width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '40px', alignItems: 'flex-end' }} className="movie-details-hero-grid">
            {/* Poster Card with Trailer Action */}
            <div
              style={{
                width: '260px',
                borderRadius: 'var(--cine-radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--cine-shadow-modal)',
                border: '1px solid var(--cine-border)',
                backgroundColor: 'var(--cine-surface)',
                position: 'relative',
              }}
            >
              <CineImage src={getMoviePoster(movie)} alt={title} aspectRatio="2/3" />
              {trailerUrl && (
                <button
                  type="button"
                  onClick={() => setTrailerOpen(true)}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#FFFFFF',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.55)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.35)')}
                >
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--cine-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 20px rgba(229, 9, 20, 0.5)',
                    }}
                  >
                    <Play size={24} fill="#FFFFFF" style={{ marginLeft: '4px' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>WATCH TRAILER</span>
                </button>
              )}
            </div>

            {/* Movie Header Content */}
            <div>
              {/* Badges Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <CineBadge variant="accent">NOW SHOWING</CineBadge>
                {certification && <CineBadge variant="outline">{certification}</CineBadge>}
                {formats.map((f) => (
                  <CineBadge key={f} variant="neutral">{f}</CineBadge>
                ))}
              </div>

              {/* Title */}
              <h1 className="cine-display-title" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', marginBottom: '12px' }}>
                {title}
              </h1>

              {/* Meta information */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--cine-text-secondary)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--cine-gold)', fontWeight: 800 }}>
                  <Star size={16} fill="currentColor" />
                  <span>{rating} / 10 IMDb</span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={15} color="var(--cine-muted)" />
                  <span>{duration} minutes</span>
                </div>
                <span>•</span>
                <span>{genres.join(', ')}</span>
                <span>•</span>
                <span>{languages.join(', ')}</span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <CineButton
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('showtimes-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  icon={Ticket}
                >
                  BOOK TICKETS NOW
                </CineButton>

                <CineButton
                  variant="secondary"
                  size="lg"
                  onClick={handleWatchlistToggle}
                  icon={Heart}
                >
                  {inWatchlist ? 'IN WATCHLIST' : 'SAVE TO WATCHLIST'}
                </CineButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cine-page-container">
        {/* ===================================================================
            2. SYNOPSIS & CAST + AI MOVIE INTELLIGENCE DOSSIER
            =================================================================== */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '48px', margin: '48px 0' }} className="movie-details-info-grid">
          {/* Left: Synopsis & Cast */}
          <div>
            <h2 className="cine-h2" style={{ marginBottom: '14px' }}>ABOUT THE FILM</h2>
            <p className="cine-body" style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '32px' }}>
              {description}
            </p>

            {/* Cast & Crew */}
            {cast.length > 0 && (
              <div style={{ marginBottom: '36px' }}>
                <h3 className="cine-h3" style={{ marginBottom: '16px' }}>FEATURED CAST</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
                  {cast.map((actor, idx) => (
                    <div key={idx} style={{ textAlign: 'center' }}>
                      <img
                        src={actor.image || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'}
                        alt={actor.name}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          margin: '0 auto 8px auto',
                          border: '2px solid var(--cine-border)',
                        }}
                      />
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF' }}>{actor.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--cine-muted)' }}>{actor.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: AI Movie Insight Dossier */}
          <div>
            <CineCard style={{ padding: '26px', background: 'rgba(18, 20, 28, 0.95)', border: '1px solid rgba(225, 29, 72, 0.25)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--cine-accent)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                <Sparkles size={14} /> CINEAI NEURAL DOSSIER
              </div>
              <h3 style={{ fontFamily: 'var(--cine-font-display)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px', color: '#FFFFFF' }}>
                EXHIBITION & ACOUSTIC CALIBRATION
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <ShieldCheck size={18} color="var(--cine-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#FFFFFF' }}>Audience Consensus: </strong>
                    <span style={{ color: 'var(--cine-text-secondary)' }}>
                      {(rating * 10).toFixed(0)}% verified patron acclaim. Praised for high kinetic scale, worldbuilding depth, and sensory intensity.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Zap size={18} color="var(--cine-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#FFFFFF' }}>Optimal Exhibition Format: </strong>
                    <span style={{ color: 'var(--cine-text-secondary)' }}>
                      {formats.includes('IMAX')
                        ? 'Mastered for IMAX dual-laser screens; expanded 1.43:1 aspect ratio provides up to 40% more visible image area.'
                        : formats.includes('4DX')
                        ? 'Mastered for 4DX environmental simulation, synchronized motion, and atmospheric cinema effects.'
                        : 'Optimized for Dolby Cinema 4K Laser with 1,000,000:1 ultra-high dynamic contrast ratio.'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Volume2 size={18} color="#06B6D4" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#FFFFFF' }}>Acoustic Sweet Spot: </strong>
                    <span style={{ color: 'var(--cine-text-secondary)' }}>
                      For calibrated Dolby Atmos 64-channel spatial sound, reserve Rows D through F in the center seating axis to avoid acoustic phase cancellation.
                    </span>
                  </div>
                </div>

                {/* Sensory Radar Scores */}
                <div style={{ marginTop: '8px', padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                    Sensory Fidelity Breakdown
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px', fontWeight: 700 }}>
                        <span>Visual Grandeur & CGI</span>
                        <span style={{ color: '#06B6D4' }}>98%</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: '98%', height: '100%', background: 'linear-gradient(90deg, #E11D48, #06B6D4)' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px', fontWeight: 700 }}>
                        <span>Soundscape & Sub-Bass</span>
                        <span style={{ color: '#F1B24A' }}>96%</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: '96%', height: '100%', background: '#F1B24A' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px', fontWeight: 700 }}>
                        <span>Pacing & Immersion</span>
                        <span style={{ color: '#10B981' }}>92%</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: '92%', height: '100%', background: '#10B981' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Interactive Chat CTA */}
                <button
                  type="button"
                  onClick={() => navigate(`/ai?mode=chat&query=${encodeURIComponent(`Tell me about ${title} and showtimes in ${selectedCity}`)}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'rgba(225, 29, 72, 0.12)',
                    border: '1px solid rgba(225, 29, 72, 0.35)',
                    color: '#FFF',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    marginTop: '4px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E11D48';
                    e.currentTarget.style.borderColor = '#E11D48';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(225, 29, 72, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(225, 29, 72, 0.35)';
                  }}
                >
                  <Bot size={15} color="#06B6D4" />
                  <span>Ask CineAI About {title}</span>
                </button>
              </div>
            </CineCard>
          </div>
        </div>

        {/* ===================================================================
            3. SHOWTIMES & CINEMA SELECTOR
            =================================================================== */}
        <section id="showtimes-section" style={{ paddingTop: '32px', marginBottom: '64px' }}>
          <CineSectionHeader
            eyebrow="RESERVE AUDITORIUM SIGHTLINES"
            title={`SHOWTIMES IN ${selectedCity.toUpperCase()}`}
            subtitle="Select your preferred screening date, multiplex auditorium, and time slot."
          />

          {/* Date Selector Tabs */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '28px' }}>
            {dates.map((d) => {
              const isSelected = selectedDate === d.fullDate;
              return (
                <button
                  key={d.fullDate}
                  type="button"
                  onClick={() => setSelectedDate(d.fullDate)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '12px 20px',
                    borderRadius: 'var(--cine-radius-md)',
                    backgroundColor: isSelected ? 'var(--cine-accent)' : 'var(--cine-surface)',
                    border: isSelected ? '1px solid var(--cine-accent)' : '1px solid var(--cine-border)',
                    color: isSelected ? '#FFFFFF' : 'var(--cine-text-secondary)',
                    minWidth: '96px',
                    cursor: 'pointer',
                    transition: 'all var(--cine-transition-fast)',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: isSelected ? '#FFFFFF' : 'var(--cine-muted)' }}>
                    {d.dayName}
                  </span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, margin: '2px 0' }}>
                    {d.dayNumber}
                  </span>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: isSelected ? '#FFFFFF' : 'var(--cine-dim)' }}>
                    {d.month}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Multiplex Shows List */}
          {Object.keys(showsByTheatre).length === 0 ? (
            <CineCard style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--cine-muted)' }}>
              <Calendar size={36} color="var(--cine-muted)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ color: '#FFFFFF', marginBottom: '8px' }}>NO SCREENINGS FOR THIS DATE</h3>
              <p>Try selecting another date or check other multiplex venues in {selectedCity}.</p>
            </CineCard>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {Object.values(showsByTheatre).map(({ theatre, shows: tShows }) => (
                <CineCard key={theatre?._id || 't'} style={{ padding: '24px' }}>
                  {/* Multiplex Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--cine-font-display)', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                        {theatre?.name || 'Multiplex Cinema'}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--cine-muted)', marginTop: '4px' }}>
                        <MapPin size={13} color="var(--cine-accent)" />
                        <span>{theatre?.address}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {theatre?.facilities?.map((f) => (
                        <CineBadge key={f} variant="outline" size="sm">{f}</CineBadge>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes Pills Grid */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {tShows.map((s) => (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => navigate(`/booking/${s._id}`)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '12px 18px',
                          borderRadius: 'var(--cine-radius-md)',
                          backgroundColor: 'var(--cine-surface-2)',
                          border: '1px solid var(--cine-border)',
                          cursor: 'pointer',
                          transition: 'all var(--cine-transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--cine-accent)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--cine-border)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                          {s.startTime}
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--cine-accent)', textTransform: 'uppercase', marginTop: '2px' }}>
                          {s.format || 'IMAX 2D'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--cine-dim)', marginTop: '2px' }}>
                          ₹{s.price || 350}
                        </span>
                      </button>
                    ))}
                  </div>
                </CineCard>
              ))}
            </div>
          )}
        </section>

        {/* ===================================================================
            4. VERIFIED PATRON REVIEWS & ESSAY PUBLISHER
            =================================================================== */}
        <section style={{ paddingTop: '32px' }}>
          <CineSectionHeader
            eyebrow="AUDIENCE DISPATCHES"
            title={`VERIFIED PERSPECTIVES (${reviews.length})`}
            subtitle="Read critiques from patrons who attended theatrical exhibitions of this film."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '36px', alignItems: 'start' }} className="movie-details-reviews-grid">
            {/* Reviews List */}
            <div>
              {reviews.length === 0 ? (
                <CineCard style={{ padding: '36px', textAlign: 'center', color: 'var(--cine-muted)' }}>
                  <MessageSquare size={32} color="var(--cine-muted)" style={{ margin: '0 auto 10px auto' }} />
                  <p>Be the first verified patron to publish an essay or critique on this exhibition.</p>
                </CineCard>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.map((rev) => (
                    <CineCard key={rev._id} style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <CineAvatar name={rev.user?.name || 'Patron'} size={32} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF' }}>
                              {rev.user?.name || 'Anonymous Cinephile'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--cine-muted)' }}>
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--cine-gold)', fontWeight: 700, fontSize: '0.8125rem' }}>
                          <Star size={13} fill="currentColor" />
                          <span>{rev.rating} / 5</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--cine-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        "{rev.comment}"
                      </p>
                    </CineCard>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Critique Form */}
            <CineCard style={{ padding: '24px' }}>
              <h3 className="cine-h3" style={{ marginBottom: '6px' }}>SUBMIT YOUR PERSPECTIVE</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--cine-muted)', marginBottom: '18px' }}>
                Share your critique on projection quality, direction, or score. Earn 25 CinePoints.
              </p>

              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="cine-label" style={{ display: 'block', marginBottom: '6px' }}>
                    YOUR RATING
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className={`cine-btn cine-btn-sm ${userRating === star ? 'cine-btn-primary' : 'cine-btn-secondary'}`}
                        style={{ flex: 1 }}
                      >
                        {star}★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="cine-label" style={{ display: 'block', marginBottom: '6px' }}>
                    CRITIQUE / ESSAY
                  </label>
                  <textarea
                    rows={4}
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Analyze sound design, 70mm frame rate, direction, or performance..."
                    className="cine-textarea"
                  />
                </div>

                {reviewSuccess && (
                  <div style={{ color: 'var(--cine-emerald)', fontSize: '0.8125rem', fontWeight: 700 }}>
                    {reviewSuccess}
                  </div>
                )}

                <CineButton
                  type="submit"
                  variant="primary"
                  loading={submittingReview}
                  icon={Send}
                  style={{ width: '100%' }}
                >
                  PUBLISH CRITIQUE
                </CineButton>
              </form>
            </CineCard>
          </div>
        </section>
      </div>

      {/* Embedded Trailer Modal */}
      {trailerUrl && (
        <CineModal
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          title={`${title} — OFFICIAL TRAILER`}
          maxWidth="840px"
        >
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', backgroundColor: '#000000', borderRadius: 'var(--cine-radius-md)', overflow: 'hidden' }}>
            <iframe
              src={getEmbedUrl(trailerUrl)}
              title={`${title} Official Trailer`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </CineModal>
      )}

      <style>{`
        @media (max-width: 860px) {
          .movie-details-hero-grid {
            grid-template-columns: 1fr !important;
          }
          .movie-details-info-grid,
          .movie-details-reviews-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MovieDetails;
