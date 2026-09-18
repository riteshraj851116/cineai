import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { cinemaService } from '../services/cinemaService';
import { showService } from '../services/showService';
import {
  CinePageHeader,
  CineButton,
  CineBadge,
  CineCard,
  CineLoader,
  CineEmptyState,
} from '../components/ui';
import {
  Building2,
  MapPin,
  Film,
  Clock,
  Sparkles,
  ArrowLeft,
  Calendar,
  Volume2,
  ShieldCheck,
  Phone,
  Layers,
} from 'lucide-react';

export const CinemaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [theatre, setTheatre] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    const fetchCinemaDetails = async () => {
      setLoading(true);
      try {
        const [cinemaRes, showsRes] = await Promise.all([
          cinemaService.getCinemaById(id),
          showService.getShows({ theatreId: id }),
        ]);

        if (cinemaRes.data.success) {
          setTheatre(cinemaRes.data.theatre);
        }

        if (showsRes.data.success) {
          const showList = showsRes.data.shows || [];
          setShows(showList);

          // Extract unique dates from shows
          const dates = [...new Set(showList.map((s) => s.date))].filter(Boolean);
          setAvailableDates(dates);
          if (dates.length > 0) {
            setSelectedDate(dates[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load cinema details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCinemaDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CineLoader text="INITIALIZING CINEMA AUDITORIUM INDEX..." />
      </div>
    );
  }

  if (!theatre) {
    return (
      <div style={{ minHeight: '70vh', padding: '120px 24px' }}>
        <CineEmptyState
          title="CINEMA VENUE NOT FOUND"
          description="The requested multiplex auditorium could not be retrieved from the CineAI index."
          actionText="BACK TO CINEMAS"
          onAction={() => navigate('/cinemas')}
        />
      </div>
    );
  }

  // Filter shows by selected date
  const filteredShows = selectedDate
    ? shows.filter((s) => s.date === selectedDate)
    : shows;

  // Group shows by Movie
  const showsByMovie = {};
  filteredShows.forEach((show) => {
    const movieId = show.movie?._id || 'unknown';
    if (!showsByMovie[movieId]) {
      showsByMovie[movieId] = {
        movie: show.movie,
        shows: [],
      };
    }
    showsByMovie[movieId].shows.push(show);
  });

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '96px', paddingTop: '40px' }}>
      <div className="cine-page-container">
        {/* Back navigation */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/cinemas')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--cine-muted)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '6px 0',
            }}
          >
            <ArrowLeft size={16} />
            <span>BACK TO ALL CINEMAS</span>
          </button>
        </div>

        {/* Multiplex Header Hero */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--cine-radius-xl)',
            overflow: 'hidden',
            backgroundColor: 'var(--cine-surface)',
            border: '1px solid var(--cine-border)',
            padding: '36px',
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--cine-accent)',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}
              >
                <Building2 size={14} />
                <span>CERTIFIED EXHIBITION VENUE • {theatre.city?.toUpperCase()}</span>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--cine-font-display)',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 900,
                  color: 'var(--cine-text)',
                  margin: '0 0 12px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                {theatre.name}
              </h1>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--cine-text-secondary)',
                  fontSize: '0.92rem',
                  marginBottom: '20px',
                }}
              >
                <MapPin size={16} color="var(--cine-accent)" style={{ flexShrink: 0 }} />
                <span>{theatre.address}, {theatre.city}</span>
              </div>

              {/* Amenities & Facility Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(theatre.facilities || []).map((fac, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--cine-border)',
                      borderRadius: 'var(--cine-radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--cine-text-secondary)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {fac}
                  </span>
                ))}
              </div>
            </div>

            {/* Multiplex Quick Specs Card */}
            <div
              style={{
                background: 'var(--cine-surface-2)',
                border: '1px solid var(--cine-border)',
                borderRadius: 'var(--cine-radius-lg)',
                padding: '20px 24px',
                minWidth: '220px',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--cine-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>
                AUDITORIUM SPECS
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.84rem' }}>
                <Layers size={16} color="var(--cine-accent)" />
                <span style={{ color: 'var(--cine-text)', fontWeight: 700 }}>
                  {theatre.screens?.length || 4} High-Format Screens
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.84rem' }}>
                <Volume2 size={16} color="var(--cine-gold)" />
                <span style={{ color: 'var(--cine-text-secondary)' }}>Dolby Atmos / DTS:X Calibrated</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
                <ShieldCheck size={16} color="var(--cine-emerald)" />
                <span style={{ color: 'var(--cine-text-secondary)' }}>Instant QR Smartphone Entry</span>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector Tabs */}
        {availableDates.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--cine-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px' }}>
              SELECT DATE
            </div>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
              {availableDates.map((dateStr) => {
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    style={{
                      padding: '10px 20px',
                      background: isSelected ? 'var(--cine-accent)' : 'var(--cine-surface)',
                      border: `1px solid ${isSelected ? 'var(--cine-accent)' : 'var(--cine-border)'}`,
                      borderRadius: 'var(--cine-radius-md)',
                      color: isSelected ? '#FFFFFF' : 'var(--cine-text)',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Calendar size={14} />
                    <span>{dateStr}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Shows Grouped By Movie */}
        <div>
          <h2
            style={{
              fontFamily: 'var(--cine-font-display)',
              fontSize: '1.6rem',
              fontWeight: 900,
              color: 'var(--cine-text)',
              marginBottom: '24px',
            }}
          >
            NOW SHOWING AT {theatre.name.toUpperCase()}
          </h2>

          {Object.keys(showsByMovie).length === 0 ? (
            <CineEmptyState
              title="NO SCREENINGS SCHEDULED"
              description="There are currently no showtimes indexed for this date. Try selecting another date or cinema."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {Object.values(showsByMovie).map(({ movie, shows: movieShows }) => {
                if (!movie) return null;
                return (
                  <div
                    key={movie._id}
                    style={{
                      backgroundColor: 'var(--cine-surface)',
                      border: '1px solid var(--cine-border)',
                      borderRadius: 'var(--cine-radius-lg)',
                      padding: '24px',
                      display: 'flex',
                      gap: '24px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Movie Poster Thumbnail */}
                    <div style={{ width: '100px', flexShrink: 0 }}>
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        style={{
                          width: '100%',
                          aspectRatio: '2/3',
                          objectFit: 'cover',
                          borderRadius: 'var(--cine-radius-sm)',
                        }}
                      />
                    </div>

                    {/* Movie Information & Showtimes Pills */}
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--cine-text)', margin: 0 }}>
                          <Link to={`/movies/${movie.slug || movie._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {movie.title}
                          </Link>
                        </h3>
                        {movie.rating && (
                          <span style={{ fontSize: '0.74rem', color: 'var(--cine-gold)', fontWeight: 800 }}>
                            ★ {movie.rating}
                          </span>
                        )}
                      </div>

                      <div style={{ color: 'var(--cine-muted)', fontSize: '0.8rem', marginBottom: '16px' }}>
                        <span>{movie.duration} mins</span> • <span>{(movie.genres || []).join(', ')}</span> • <span>{(movie.languages || []).join(', ')}</span>
                      </div>

                      {/* Showtimes Grid */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {movieShows.map((show) => (
                          <button
                            key={show._id}
                            onClick={() => navigate(`/booking/${show._id}`)}
                            style={{
                              padding: '10px 16px',
                              backgroundColor: 'var(--cine-surface-2)',
                              border: '1px solid var(--cine-border)',
                              borderRadius: 'var(--cine-radius-md)',
                              color: 'var(--cine-text)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '2px',
                              minWidth: '96px',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--cine-accent)';
                              e.currentTarget.style.backgroundColor = 'rgba(229, 9, 20, 0.08)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--cine-border)';
                              e.currentTarget.style.backgroundColor = 'var(--cine-surface-2)';
                            }}
                          >
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF' }}>
                              {show.startTime}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--cine-accent)', fontWeight: 800 }}>
                              {show.format || 'STANDARD'}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--cine-muted)' }}>
                              ₹{show.pricing?.STANDARD || show.pricing?.Standard || 250}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CinemaDetails;
