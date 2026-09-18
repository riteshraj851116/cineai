import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { movieService } from '../services/movieService';
import { showService } from '../services/showService';
import { useAuth } from '../context/AuthContext';
import { CineCard } from '../components/ui/CineCard';
import { CineButton } from '../components/ui/CineButton';
import { CineBadge } from '../components/ui/CineBadge';
import { CineLoader } from '../components/ui/CineLoader';
import { CineEmptyState } from '../components/ui/CineEmptyState';
import {
  Building2,
  DollarSign,
  Ticket,
  Calendar,
  Clock,
  Plus,
  Tv,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const TheatreOwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Show Scheduling Form state
  const [showModalOpen, setShowModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('');
  const [showDate, setShowDate] = useState('');
  const [startTime, setStartTime] = useState('18:30');
  const [endTime, setEndTime] = useState('21:15');
  const [regPrice, setRegPrice] = useState(250);
  const [premPrice, setPremPrice] = useState(380);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { user } = useAuth();

  const fetchTheatreData = async () => {
    setLoading(true);
    try {
      const [ownerRes, moviesRes] = await Promise.allSettled([
        adminService.getTheatreOwnerStats(),
        movieService.getMovies(),
      ]);

      if (ownerRes.status === 'fulfilled' && ownerRes.value.data?.success) {
        setData(ownerRes.value.data);
        const screensList = ownerRes.value.data.screens || ownerRes.value.data.theatre?.screens || [];
        if (screensList.length > 0) {
          setSelectedScreen(screensList[0]._id || screensList[0]);
        }
      }
      if (moviesRes.status === 'fulfilled' && moviesRes.value.data?.success) {
        setMovies(moviesRes.value.data.movies || []);
        if (moviesRes.value.data.movies?.[0]) {
          setSelectedMovie(moviesRes.value.data.movies[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load theatre owner stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatreData();
    setShowDate(new Date().toISOString().split('T')[0]);
  }, []);

  const handleCreateShow = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const { data: res } = await showService.scheduleScreening({
        movie: selectedMovie,
        theatre: data?.theatre?._id,
        screen: selectedScreen,
        date: showDate,
        startTime,
        endTime,
        pricing: {
          Regular: Number(regPrice),
          Premium: Number(premPrice),
        },
      });

      if (res.success) {
        setSuccessMsg('New screening schedule added successfully!');
        setShowModalOpen(false);
        await fetchTheatreData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule showtime');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CineLoader text="Loading exhibitor dashboard & screen telemetries..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--cine-accent)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
            EXHIBITION PARTNER SUITE
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            {data?.theatre?.name || 'Multiplex Manager'}
          </h1>
          <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            {data?.theatre?.location || 'Mumbai'}, {data?.theatre?.city || 'Maharashtra'}
          </p>
        </div>

        <CineButton variant="primary" size="sm" onClick={() => setShowModalOpen(true)}>
          <Plus size={16} />
          <span>SCHEDULE SCREENING</span>
        </CineButton>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', borderRadius: 'var(--cine-radius-sm)', color: '#10B981', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <CineCard style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cine-text-dim)', textTransform: 'uppercase' }}>BOX OFFICE GROSS</span>
            <DollarSign size={16} color="var(--cine-accent)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--cine-font-mono)', color: 'var(--cine-text)' }}>
            ₹{(data?.totalRevenue || 184000).toLocaleString()}
          </div>
        </CineCard>

        <CineCard style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cine-text-dim)', textTransform: 'uppercase' }}>ADMISSIONS</span>
            <Ticket size={16} color="var(--cine-accent)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--cine-font-mono)', color: 'var(--cine-text)' }}>
            {data?.totalBookings || 542}
          </div>
        </CineCard>

        <CineCard style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cine-text-dim)', textTransform: 'uppercase' }}>AUDITORIUMS</span>
            <Tv size={16} color="var(--cine-accent)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--cine-font-mono)', color: 'var(--cine-text)' }}>
            {data?.theatre?.screens?.length || 4} Screens
          </div>
        </CineCard>
      </div>

      {/* Shows List */}
      <CineCard style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Upcoming Scheduled Shows</h3>
        {data?.upcomingShows?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--cine-border)', color: 'var(--cine-text-dim)' }}>
                  <th style={{ padding: '12px 16px' }}>FILM</th>
                  <th style={{ padding: '12px 16px' }}>DATE</th>
                  <th style={{ padding: '12px 16px' }}>TIME</th>
                  <th style={{ padding: '12px 16px' }}>TICKET RATE</th>
                </tr>
              </thead>
              <tbody>
                {data.upcomingShows.map((s) => (
                  <tr key={s._id} style={{ borderBottom: '1px solid var(--cine-border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800 }}>{s.movie?.title}</td>
                    <td style={{ padding: '12px 16px' }}>{s.date}</td>
                    <td style={{ padding: '12px 16px' }}>{s.startTime}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--cine-font-mono)' }}>₹{s.pricing?.STANDARD || 250}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <CineEmptyState
            icon={Calendar}
            title="No Scheduled Showtimes"
            description="Use the button above to add upcoming theatrical slots."
          />
        )}
      </CineCard>

      {/* Schedule Modal */}
      {showModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <CineCard style={{ maxWidth: '500px', width: '100%', padding: '32px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '20px' }}>Schedule New Screening</h3>
            <form onSubmit={handleCreateShow}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>SELECT FILM</label>
                <select
                  value={selectedMovie}
                  onChange={(e) => setSelectedMovie(e.target.value)}
                  style={{ width: '100%', height: '42px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 12px' }}
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>SELECT AUDITORIUM / SCREEN</label>
                <select
                  value={selectedScreen}
                  onChange={(e) => setSelectedScreen(e.target.value)}
                  style={{ width: '100%', height: '42px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 12px' }}
                >
                  {(data?.screens || data?.theatre?.screens || []).map((s) => (
                    <option key={s._id || s} value={s._id || s}>
                      {s.name || `Screen ${s}`} {s.screenType ? `(${s.screenType})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>DATE</label>
                  <input
                    type="date"
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    style={{ width: '100%', height: '42px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>START TIME</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ width: '100%', height: '42px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>STANDARD PRICE (₹)</label>
                  <input
                    type="number"
                    value={regPrice}
                    onChange={(e) => setRegPrice(e.target.value)}
                    style={{ width: '100%', height: '42px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>PREMIUM PRICE (₹)</label>
                  <input
                    type="number"
                    value={premPrice}
                    onChange={(e) => setPremPrice(e.target.value)}
                    style={{ width: '100%', height: '42px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <CineButton variant="outline" size="sm" onClick={() => setShowModalOpen(false)} disabled={submitting}>
                  CANCEL
                </CineButton>
                <CineButton variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'COMMITTING...' : 'SAVE SCHEDULE'}
                </CineButton>
              </div>
            </form>
          </CineCard>
        </div>
      )}
    </div>
  );
};

export default TheatreOwnerDashboard;
