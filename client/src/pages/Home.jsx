import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Search,
  Star,
  Film,
  Building2,
  Calendar,
  Clock,
  MessageSquare,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { movieService } from '../services/movieService';
import { cinemaService } from '../services/cinemaService';
import { reviewService } from '../services/reviewService';
import { aiService } from '../services/aiService';
import { useCity } from '../context/CityContext';
import {
  CineMovieCard,
  CineCinemaCard,
  CineSectionHeader,
  CineButton,
  CineBadge,
  CineLoader,
  CineCard,
} from '../components/ui';

export const Home = () => {
  const navigate = useNavigate();
  const { selectedCity } = useCity();

  // State
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Search state
  const [aiQuery, setAiQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState(null);

  // Mood filter state
  const [selectedMood, setSelectedMood] = useState('Thrill');
  const [moodMovies, setMoodMovies] = useState([]);

  const promptExamples = [
    'Find a thriller for tonight',
    'Movies like Interstellar',
    'Something funny under 2 hours',
    'Best movie near me',
  ];

  const moods = [
    { id: 'Relax', label: 'Relaxing & Easy', emoji: '☕', genre: 'Animation' },
    { id: 'Laugh', label: 'Laugh Out Loud', emoji: '😂', genre: 'Comedy' },
    { id: 'Think', label: 'Mind-Bending', emoji: '🧠', genre: 'Sci-Fi' },
    { id: 'Thrill', label: 'Edge-of-Seat Thrill', emoji: '⚡', genre: 'Thriller' },
    { id: 'Adventure', label: 'Epic Adventure', emoji: '🚀', genre: 'Adventure' },
    { id: 'Emotional', label: 'Deep & Emotional', emoji: '🎭', genre: 'Drama' },
  ];

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [moviesRes, theatresRes, reviewsRes] = await Promise.all([
          movieService.getMovies(),
          cinemaService.getCinemas({ city: selectedCity }),
          reviewService.getCommunityFeed({ limit: 4 }),
        ]);

        const allMovies = moviesRes.data?.movies || [];
        setMovies(allMovies);
        setTheatres(theatresRes.data?.theatres || theatresRes.data?.cinemas || []);
        setReviews(reviewsRes.data?.reviews || []);

        // Initial mood filter
        filterMoviesByMood('Thrill', allMovies);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [selectedCity]);

  const filterMoviesByMood = (moodId, currentMovies = movies) => {
    setSelectedMood(moodId);
    const target = moods.find((m) => m.id === moodId);
    if (!target) return;

    const filtered = currentMovies.filter((m) =>
      m.genres?.some((g) => g.toLowerCase().includes(target.genre.toLowerCase()))
    );
    setMoodMovies(filtered.length > 0 ? filtered : currentMovies.slice(0, 4));
  };

  const handleAISearch = async (queryText) => {
    const q = queryText || aiQuery;
    if (!q.trim()) return;

    setAiSearching(true);
    setAiSearchResult(null);
    try {
      const { data } = await aiService.searchMoviesNeural(q);
      if (data.success && data.movies?.length > 0) {
        setAiSearchResult({
          query: q,
          movies: data.movies,
          interpretation: data.interpretation || `Matches for "${q}"`,
        });
      } else {
        // Fallback local match
        const localMatches = movies.filter(
          (m) =>
            m.title.toLowerCase().includes(q.toLowerCase()) ||
            m.genres?.some((g) => g.toLowerCase().includes(q.toLowerCase()))
        );
        setAiSearchResult({
          query: q,
          movies: localMatches.length > 0 ? localMatches : movies.slice(0, 3),
          interpretation: `Curated cinema recommendations for "${q}"`,
        });
      }
    } catch (err) {
      console.error('AI search failed, using fallback:', err);
      setAiSearchResult({
        query: q,
        movies: movies.slice(0, 3),
        interpretation: `Recommended titles for "${q}"`,
      });
    } finally {
      setAiSearching(false);
    }
  };

  // Section categories
  const trendingNow = movies.filter((m) => (m.trendingScore || 0) >= 80 || m.rating >= 8.5);
  const nowShowing = movies.filter((m) => m.status === 'now_showing');
  const comingSoon = movies.filter((m) => m.status === 'coming_soon' || (m.releaseDate && new Date(m.releaseDate) > new Date()));
  const aiPicks = movies.slice(0, 4);
  const tonightPicks = movies.filter((m) => m.formats?.includes('IMAX') || m.rating >= 8.0).slice(0, 4);

  // Hero featured title
  const featuredMovie = movies[0] || {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    rating: 8.8,
    genres: ['Sci-Fi', 'Adventure'],
    duration: 166,
  };

  if (loading) {
    return <CineLoader text="SYNCHRONIZING CINEMATIC PLATFORM..." minHeight="80vh" />;
  }

  return (
    <div style={{ paddingBottom: '96px' }}>
      {/* ===================================================================
          1. CINEMATIC EDITORIAL HERO SECTION
          =================================================================== */}
      <section
        style={{
          position: 'relative',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--cine-bg)',
          backgroundImage: `radial-gradient(ellipse at 85% 20%, rgba(22, 74, 65, 0.7) 0%, rgba(16, 63, 58, 0.98) 70%), url(${featuredMovie.backdrop})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          overflow: 'hidden',
          borderBottom: '1px solid var(--cine-border)',
        }}
      >
        <div className="cine-page-container" style={{ width: '100%', padding: '70px 0', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '48px',
              alignItems: 'center',
            }}
          >
            {/* LEFT EDITORIAL COLUMN */}
            <div style={{ maxWidth: '640px' }}>
              {/* Small Label */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: 'var(--cine-radius-full)',
                  backgroundColor: 'var(--cine-surface)',
                  border: '1px solid var(--cine-border)',
                  marginBottom: '24px',
                }}
              >
                <Sparkles size={14} color="var(--cine-accent)" />
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    color: 'var(--cine-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  CINEAI INTELLIGENCE
                </span>
              </div>

              {/* Huge Condensed Display Heading */}
              <h1
                className="cine-display-title"
                style={{
                  fontSize: 'clamp(3.4rem, 7.5vw, 5.8rem)',
                  lineHeight: 0.92,
                  letterSpacing: '0.02em',
                  marginBottom: '24px',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                }}
              >
                YOUR NEXT<br />
                GREAT MOVIE<br />
                <span style={{ color: 'var(--cine-accent)' }}>IS WAITING.</span>
              </h1>

              {/* Supporting Editorial Text */}
              <p
                style={{
                  fontSize: '1.1rem',
                  lineHeight: 1.65,
                  color: 'var(--cine-text-secondary)',
                  marginBottom: '36px',
                  maxWidth: '520px',
                }}
              >
                Discover movies, find the perfect showtime, choose your seats and book your entire cinema experience with AI.
              </p>

              {/* CTA Row */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '44px' }}>
                <CineButton
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/movies')}
                  style={{
                    padding: '16px 36px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                  }}
                >
                  <span>EXPLORE MOVIES</span>
                  <ArrowRight size={18} />
                </CineButton>

                <CineButton
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/ai')}
                  style={{
                    padding: '16px 26px',
                    fontSize: '0.92rem',
                    backgroundColor: 'var(--cine-surface)',
                  }}
                >
                  <Sparkles size={16} color="var(--cine-accent)" />
                  <span>AI CONCIERGE</span>
                </CineButton>
              </div>

              {/* Key Platform Specs / Metrics */}
              <div
                style={{
                  display: 'flex',
                  gap: '24px',
                  alignItems: 'center',
                  borderTop: '1px solid var(--cine-border-subtle)',
                  paddingTop: '24px',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--cine-font-display)', fontSize: '1.9rem', color: '#FFFFFF', lineHeight: 1 }}>
                    41+
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--cine-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
                    DAILY SCREENINGS
                  </div>
                </div>
                <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--cine-border-subtle)' }} />
                <div>
                  <div style={{ fontFamily: 'var(--cine-font-display)', fontSize: '1.9rem', color: '#FFFFFF', lineHeight: 1 }}>
                    5
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--cine-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
                    IMAX MULTIPLEXES
                  </div>
                </div>
                <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--cine-border-subtle)' }} />
                <div>
                  <div style={{ fontFamily: 'var(--cine-font-display)', fontSize: '1.9rem', color: 'var(--cine-accent)', lineHeight: 1 }}>
                    100%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--cine-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
                    ATOMIC SEAT LOCKS
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Strong Hero Showcase & AI Search Capsule */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Featured Exhibition Showcase Card */}
              <div
                style={{
                  backgroundColor: 'var(--cine-surface)',
                  border: '1px solid var(--cine-border)',
                  borderRadius: 'var(--cine-radius-lg)',
                  padding: '24px',
                  boxShadow: 'var(--cine-shadow-lg)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <CineBadge variant="accent">FEATURED EXHIBITION</CineBadge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cine-muted)', fontFamily: 'var(--cine-font-mono)' }}>
                      CRITIC CHOICE
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--cine-accent)' }}>
                    ★ {featuredMovie.rating} IMDb
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {featuredMovie.poster && (
                    <img
                      src={featuredMovie.poster}
                      alt={featuredMovie.title}
                      style={{
                        width: '100px',
                        height: '148px',
                        objectFit: 'cover',
                        borderRadius: 'var(--cine-radius-sm)',
                        border: '1px solid var(--cine-border)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3
                      style={{
                        fontFamily: 'var(--cine-font-display)',
                        fontSize: '1.8rem',
                        lineHeight: 1.05,
                        textTransform: 'uppercase',
                        color: '#FFFFFF',
                        marginBottom: '8px',
                      }}
                    >
                      {featuredMovie.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.825rem',
                        color: 'var(--cine-text-secondary)',
                        lineHeight: 1.5,
                        marginBottom: '14px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {featuredMovie.description}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <CineButton
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/movie/${featuredMovie.slug || featuredMovie._id}`)}
                      >
                        <span>BOOK SEATS</span>
                        <ArrowRight size={14} />
                      </CineButton>
                      <CineButton
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/movie/${featuredMovie.slug || featuredMovie._id}`)}
                      >
                        TRAILER & SHOWS
                      </CineButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Natural Language Search Input Capsule */}
              <div
                style={{
                  background: 'var(--cine-surface)',
                  border: '1px solid var(--cine-border)',
                  borderRadius: 'var(--cine-radius-lg)',
                  padding: '20px',
                  boxShadow: 'var(--cine-shadow-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--cine-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                  <Sparkles size={14} color="var(--cine-accent)" /> ASK CINEAI CONCIERGE
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAISearch();
                  }}
                  style={{ display: 'flex', gap: '10px' }}
                >
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} color="var(--cine-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="e.g., 'Find a sci-fi thriller in IMAX tonight'..."
                      className="cine-input"
                      style={{ paddingLeft: '40px', backgroundColor: 'var(--cine-surface-2)' }}
                    />
                  </div>
                  <CineButton
                    type="submit"
                    variant="primary"
                    loading={aiSearching}
                    disabled={!aiQuery.trim()}
                  >
                    SEARCH
                  </CineButton>
                </form>

                {/* Sample Prompt Chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {promptExamples.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        setAiQuery(prompt);
                        handleAISearch(prompt);
                      }}
                      style={{
                        fontSize: '0.72rem',
                        padding: '4px 10px',
                        borderRadius: 'var(--cine-radius-sm)',
                        backgroundColor: 'var(--cine-surface-2)',
                        border: '1px solid var(--cine-border)',
                        color: 'var(--cine-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.borderColor = 'var(--cine-border-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--cine-muted)';
                        e.currentTarget.style.borderColor = 'var(--cine-border)';
                      }}
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Search Result Panel (If Query Active) */}
      {aiSearchResult && (
        <section style={{ backgroundColor: 'var(--cine-surface)', borderBottom: '1px solid var(--cine-border)', padding: '40px 0' }}>
          <div className="cine-page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div className="cine-eyebrow">
                  <Sparkles size={13} /> AI INTELLIGENCE DOSSIER
                </div>
                <h3 className="cine-h2" style={{ margin: '4px 0 0 0' }}>
                  {aiSearchResult.interpretation}
                </h3>
              </div>
              <CineButton variant="outline" size="sm" onClick={() => setAiSearchResult(null)}>
                Dismiss Results
              </CineButton>
            </div>

            <div className="cine-grid-movies">
              {aiSearchResult.movies.map((movie) => (
                <CineMovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================
          2. TRENDING NOW
          =================================================================== */}
      <section style={{ padding: '64px 0 32px' }}>
        <div className="cine-page-container">
          <CineSectionHeader
            eyebrow="HIGH-VELOCITY BOX OFFICE"
            title="TRENDING NOW"
            subtitle="The most-watched exhibitions and critically acclaimed titles this week."
            action={
              <Link to="/movies?sort=trending" className="cine-btn cine-btn-outline cine-btn-sm">
                <span>VIEW ALL</span>
                <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="cine-grid-movies">
            {(trendingNow.length > 0 ? trendingNow : movies).slice(0, 4).map((movie) => (
              <CineMovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          3. AI PICKS FOR YOU
          =================================================================== */}
      <section style={{ padding: '32px 0 48px' }}>
        <div className="cine-page-container">
          <CineSectionHeader
            eyebrow="NEURAL TASTE VECTOR"
            title="AI PICKS FOR YOU"
            subtitle="Personalized curation matched with your preferred projection formats and genres."
            action={
              <Link to="/ai" className="cine-btn cine-btn-outline cine-btn-sm">
                <span>AI MATCHMAKER</span>
                <Sparkles size={14} />
              </Link>
            }
          />
          <div className="cine-grid-movies">
            {aiPicks.map((movie) => (
              <CineMovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          4 & 5. NOW SHOWING & COMING SOON
          =================================================================== */}
      <section style={{ padding: '32px 0 48px', backgroundColor: 'var(--cine-surface-2)' }}>
        <div className="cine-page-container">
          <CineSectionHeader
            eyebrow="AUDITORIUM CATALOG"
            title="NOW SHOWING IN CINEMAS"
            subtitle={`Active showtimes and laser screenings across ${selectedCity.toUpperCase()}.`}
            action={
              <Link to="/movies" className="cine-btn cine-btn-outline cine-btn-sm">
                <span>COMPLETE SCHEDULE</span>
                <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="cine-grid-movies">
            {(nowShowing.length > 0 ? nowShowing : movies).slice(0, 8).map((movie) => (
              <CineMovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          6. POPULAR CINEMAS IN CITY
          =================================================================== */}
      <section style={{ padding: '64px 0 32px' }}>
        <div className="cine-page-container">
          <CineSectionHeader
            eyebrow="EXHIBITION VENUES"
            title={`POPULAR CINEMAS IN ${selectedCity.toUpperCase()}`}
            subtitle="Premium multiplexes equipped with 70mm IMAX laser, Dolby Atmos sound, and VIP lounges."
            action={
              <Link to="/cinemas" className="cine-btn cine-btn-outline cine-btn-sm">
                <span>ALL CINEMAS</span>
                <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="cine-grid-cinemas">
            {theatres.slice(0, 3).map((theatre) => (
              <CineCinemaCard key={theatre._id} theatre={theatre} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          7. MOOD DISCOVERY
          =================================================================== */}
      <section style={{ padding: '48px 0', backgroundColor: 'var(--cine-surface)' }}>
        <div className="cine-page-container">
          <CineSectionHeader
            eyebrow="EMOTIONAL FREQUENCY SELECTOR"
            title="WHAT ARE YOU IN THE MOOD FOR?"
            subtitle="Select how you want to feel tonight. CineAI recalibrates its recommendation matrix instantly."
          />

          {/* Mood Pill Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px' }}>
            {moods.map((m) => {
              const isSelected = selectedMood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => filterMoviesByMood(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: 'var(--cine-radius-full)',
                    backgroundColor: isSelected ? 'var(--cine-accent)' : 'var(--cine-surface-2)',
                    border: isSelected ? '1px solid var(--cine-accent)' : '1px solid var(--cine-border)',
                    color: isSelected ? 'var(--cine-dark-text)' : 'var(--cine-text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all var(--cine-transition-fast)',
                  }}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Movies matching selected mood */}
          <div className="cine-grid-movies">
            {moodMovies.slice(0, 4).map((movie) => (
              <CineMovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          8. TONIGHT'S PICKS
          =================================================================== */}
      <section style={{ padding: '64px 0 32px' }}>
        <div className="cine-page-container">
          <CineSectionHeader
            eyebrow="INSTANT RESERVATIONS"
            title="TONIGHT'S PRIME SCREENINGS"
            subtitle="Evening showtimes available right now with verified high-quality acoustic seating."
          />
          <div className="cine-grid-movies">
            {tonightPicks.map((movie) => (
              <CineMovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          9. COMMUNITY ACTIVITY
          =================================================================== */}
      {reviews.length > 0 && (
        <section style={{ padding: '48px 0', backgroundColor: 'var(--cine-surface)' }}>
          <div className="cine-page-container">
            <CineSectionHeader
              eyebrow="THE CINEPHILE GUILD"
              title="VERIFIED PATRON PERSPECTIVES"
              subtitle="Critical perspectives and verified reviews directly from audience members."
              action={
                <Link to="/community" className="cine-btn cine-btn-outline cine-btn-sm">
                  <span>JOIN DISCUSSION</span>
                  <MessageSquare size={14} />
                </Link>
              }
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {reviews.map((rev) => (
                <CineCard key={rev._id} style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
                        {rev.user?.name || 'Verified Patron'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cine-muted)' }}>
                        On: {rev.movie?.title || 'Cinema Screening'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--cine-gold)', fontSize: '0.8125rem', fontWeight: 700 }}>
                      <Star size={13} fill="currentColor" />
                      <span>{rev.rating} / 5</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--cine-text-secondary)', lineHeight: 1.5, fontStyle: 'italic', margin: 0 }}>
                    "{rev.comment}"
                  </p>
                </CineCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================
          10. FINAL CALL TO ACTION
          =================================================================== */}
      <section style={{ padding: '80px 0 32px' }}>
        <div className="cine-page-container">
          <div
            style={{
              backgroundColor: 'var(--cine-surface)',
              border: '1px solid var(--cine-border)',
              borderRadius: 'var(--cine-radius-xl)',
              padding: '60px 32px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="cine-eyebrow" style={{ marginBottom: '12px' }}>
              ✦ SMART CINEMA PROTOCOL
            </div>
            <h2 className="cine-display-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>
              READY TO EXPERIENCE CINEMA ELEVATED?
            </h2>
            <p style={{ color: 'var(--cine-muted)', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
              Join thousands of filmgoers using CineAI to discover masterpieces, secure prime auditorium sightlines, and earn loyalty perks.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <CineButton variant="primary" size="lg" onClick={() => navigate('/movies')}>
                BROWSE ALL MOVIES
              </CineButton>
              <CineButton variant="secondary" size="lg" onClick={() => navigate('/ai')}>
                TRY AI CONCIERGE
              </CineButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
