import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { showService } from '../services/showService';
import { movieService } from '../services/movieService';
import { cinemaService } from '../services/cinemaService';
import { useCity } from '../context/CityContext';
import {
  CinePageHeader,
  CineButton,
  CineBadge,
  CineLoader,
  CineEmptyState,
} from '../components/ui';
import { Calendar, Clock, MapPin, Film, Sparkles, Filter } from 'lucide-react';

export const Schedule = () => {
  const navigate = useNavigate();
  const { selectedCity } = useCity();

  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState('ALL');
  const [selectedFormat, setSelectedFormat] = useState('ALL');

  const formats = ['ALL', 'IMAX', '3D', '4DX', '2D'];

  useEffect(() => {
    const fetchScheduleData = async () => {
      setLoading(true);
      try {
        const [showsRes, moviesRes, theatresRes] = await Promise.all([
          showService.getShows({ city: selectedCity }),
          movieService.getMovies({ status: 'now_showing' }),
          cinemaService.getCinemas({ city: selectedCity }),
        ]);

        if (showsRes.data.success) {
          const showList = showsRes.data.shows || [];
          setShows(showList);

          const dates = [...new Set(showList.map((s) => s.date))].filter(Boolean);
          setAvailableDates(dates);
          if (dates.length > 0) {
            setSelectedDate(dates[0]);
          }
        }

        if (moviesRes.data.success) {
          setMovies(moviesRes.data.movies || []);
        }

        if (theatresRes.data.success) {
          setTheatres(theatresRes.data.theatres || []);
        }
      } catch (err) {
        console.error('Failed to load schedule data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, [selectedCity]);

  // Filter shows based on controls
  const filteredShows = shows.filter((s) => {
    const matchesDate = !selectedDate || s.date === selectedDate;
    const matchesMovie = selectedMovie === 'ALL' || (s.movie?._id === selectedMovie || s.movie === selectedMovie);
    const matchesFormat = selectedFormat === 'ALL' || (s.format?.toUpperCase().includes(selectedFormat));
    return matchesDate && matchesMovie && matchesFormat;
  });

  // Group shows by Cinema -> then Movie
  const scheduleByCinema = {};
  filteredShows.forEach((show) => {
    const theatreId = show.theatre?._id || 'unknown';
    if (!scheduleByCinema[theatreId]) {
      scheduleByCinema[theatreId] = {
        theatre: show.theatre,
        moviesMap: {},
      };
    }

    const movieId = show.movie?._id || 'unknown';
    if (!scheduleByCinema[theatreId].moviesMap[movieId]) {
      scheduleByCinema[theatreId].moviesMap[movieId] = {
        movie: show.movie,
        shows: [],
      };
    }
    scheduleByCinema[theatreId].moviesMap[movieId].shows.push(show);
  });

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '96px', paddingTop: '40px' }}>
      <div className="cine-page-container">
        {/* Page Header */}
        <CinePageHeader
          eyebrow={`SHOWTIME INTELLIGENCE • ${selectedCity.toUpperCase()}`}
          title="MASTER SCHEDULE"
          subtitle="Explore real-time cinema schedules across certified multiplexes with audio and format specifications."
        />

        {/* Filter Controls Bar */}
        <div
          style={{
            backgroundColor: 'var(--cine-surface)',
            border: '1px solid var(--cine-border)',
            borderRadius: 'var(--cine-radius-xl)',
            padding: '24px',
            marginBottom: '36px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Date Picker Row */}
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--cine-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '10px' }}>
              SELECT SCREENING DATE
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {availableDates.map((d) => {
                const isSelected = selectedDate === d;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    style={{
                      padding: '8px 18px',
                      background: isSelected ? 'var(--cine-accent)' : 'var(--cine-surface-2)',
                      border: `1px solid ${isSelected ? 'var(--cine-accent)' : 'var(--cine-border)'}`,
                      borderRadius: 'var(--cine-radius-md)',
                      color: isSelected ? '#FFFFFF' : 'var(--cine-text)',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Calendar size={13} />
                    <span>{d}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Filter Row: Film & Format */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Film Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Film size={16} color="var(--cine-accent)" />
              <select
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
                style={{
                  height: '40px',
                  background: 'var(--cine-surface-2)',
                  border: '1px solid var(--cine-border)',
                  borderRadius: 'var(--cine-radius-sm)',
                  color: 'var(--cine-text)',
                  padding: '0 12px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="ALL">All Now Showing Movies</option>
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {formats.map((fmt) => {
                const isSelected = selectedFormat === fmt;
                return (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    style={{
                      padding: '6px 14px',
                      background: isSelected ? 'rgba(229, 9, 20, 0.15)' : 'transparent',
                      border: `1px solid ${isSelected ? 'var(--cine-accent)' : 'var(--cine-border)'}`,
                      color: isSelected ? 'var(--cine-accent)' : 'var(--cine-muted)',
                      borderRadius: 'var(--cine-radius-full)',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {fmt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        {loading ? (
          <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CineLoader text="SYNCHRONIZING THEATRE AUDITORIUM SCHEDULES..." />
          </div>
        ) : Object.keys(scheduleByCinema).length === 0 ? (
          <CineEmptyState
            title="NO SHOWTIMES FOUND"
            description="No scheduled shows matched your date and format filters. Try resetting the filters."
            actionText="VIEW ALL SHOWTIMES"
            onAction={() => {
              setSelectedMovie('ALL');
              setSelectedFormat('ALL');
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {Object.values(scheduleByCinema).map(({ theatre, moviesMap }) => {
              if (!theatre) return null;
              return (
                <div
                  key={theatre._id}
                  style={{
                    backgroundColor: 'var(--cine-surface)',
                    border: '1px solid var(--cine-border)',
                    borderRadius: 'var(--cine-radius-xl)',
                    padding: '28px',
                  }}
                >
                  {/* Theatre Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--cine-text)', margin: '0 0 6px 0' }}>
                        <Link to={`/cinemas/${theatre._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {theatre.name}
                        </Link>
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cine-muted)', fontSize: '0.82rem' }}>
                        <MapPin size={14} color="var(--cine-accent)" />
                        <span>{theatre.address}, {theatre.city}</span>
                      </div>
                    </div>

                    <Link
                      to={`/cinemas/${theatre._id}`}
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: 'var(--cine-accent)',
                        textDecoration: 'none',
                        letterSpacing: '0.05em',
                      }}
                    >
                      VIEW VENUE SPECS →
                    </Link>
                  </div>

                  {/* Movies playing at this theatre */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {Object.values(moviesMap).map(({ movie, shows: mShows }) => {
                      if (!movie) return null;
                      return (
                        <div
                          key={movie._id}
                          style={{
                            backgroundColor: 'var(--cine-surface-2)',
                            border: '1px solid var(--cine-border)',
                            borderRadius: 'var(--cine-radius-lg)',
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '16px',
                          }}
                        >
                          <div style={{ minWidth: '200px' }}>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px 0' }}>
                              <Link to={`/movies/${movie.slug || movie._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                {movie.title}
                              </Link>
                            </h4>
                            <div style={{ color: 'var(--cine-muted)', fontSize: '0.74rem' }}>
                              <span>{movie.duration}m</span> • <span>{(movie.genres || []).slice(0, 2).join(', ')}</span>
                            </div>
                          </div>

                          {/* Time pills */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {mShows.map((s) => (
                              <button
                                key={s._id}
                                onClick={() => navigate(`/booking/${s._id}`)}
                                style={{
                                  padding: '8px 14px',
                                  background: 'var(--cine-surface)',
                                  border: '1px solid var(--cine-border)',
                                  borderRadius: 'var(--cine-radius-sm)',
                                  color: 'var(--cine-text)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--cine-accent)';
                                  e.currentTarget.style.color = '#FFFFFF';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--cine-border)';
                                  e.currentTarget.style.color = 'var(--cine-text)';
                                }}
                              >
                                <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{s.startTime}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--cine-accent)', fontWeight: 800 }}>
                                  {s.format || '2D'}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
