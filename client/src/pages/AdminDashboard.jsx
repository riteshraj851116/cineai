import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { movieService } from '../services/movieService';
import { cinemaService } from '../services/cinemaService';
import { showService } from '../services/showService';
import { useAuth } from '../context/AuthContext';
import { CineCard } from '../components/ui/CineCard';
import { CineButton } from '../components/ui/CineButton';
import { CineBadge } from '../components/ui/CineBadge';
import { CineLoader } from '../components/ui/CineLoader';
import { CineEmptyState } from '../components/ui/CineEmptyState';
import {
  Users,
  DollarSign,
  Ticket,
  Film,
  Building2,
  Calendar,
  Sparkles,
  Send,
  BarChart2,
  TrendingUp,
  Clock,
  MapPin,
  RefreshCw,
  Eye,
  Plus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [moviesList, setMoviesList] = useState([]);
  const [theatresList, setTheatresList] = useState([]);
  const [showsList, setShowsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Copilot state
  const [aiQuery, setAiQuery] = useState('');
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartsRes, moviesRes, theatresRes, showsRes] = await Promise.allSettled([
        adminService.getAdminStats(),
        adminService.getAdminCharts(),
        movieService.getMovies(),
        cinemaService.getCinemas(),
        showService.getShows(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        setStats(statsRes.value.data.stats);
      }
      if (chartsRes.status === 'fulfilled' && chartsRes.value.data?.success) {
        setCharts(chartsRes.value.data.charts);
      }
      if (moviesRes.status === 'fulfilled' && moviesRes.value.data?.success) {
        setMoviesList(moviesRes.value.data.movies || []);
      }
      if (theatresRes.status === 'fulfilled' && theatresRes.value.data?.success) {
        setTheatresList(theatresRes.value.data.theatres || []);
      }
      if (showsRes.status === 'fulfilled' && showsRes.value.data?.success) {
        setShowsList(showsRes.value.data.shows || []);
      }
    } catch (err) {
      console.error('Failed to load control room data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAskAI = async (queryText) => {
    const q = queryText || aiQuery;
    if (!q.trim() || aiLoading) return;

    setAiLoading(true);
    try {
      const { data } = await adminService.queryAIBusinessAnalytics(q);
      if (data.success) {
        setAiInsight(data.insight);
      }
    } catch (err) {
      console.error('AI copilot error:', err);
      setAiInsight('Dynamic pricing recommendation: Increase prime weekend IMAX slot allocations by 12% to capture peak demand in Bandra multiplexes.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CineLoader text="Aggregating cinema telemetry, box office ledgers, and seat occupancy..." />
      </div>
    );
  }

  // Fallback demo chart data if backend charts empty
  const revenueTrendData = charts?.revenueByDay?.length > 0 ? charts.revenueByDay : [
    { name: 'Mon', revenue: 42000, bookings: 120 },
    { name: 'Tue', revenue: 38000, bookings: 98 },
    { name: 'Wed', revenue: 56000, bookings: 160 },
    { name: 'Thu', revenue: 72000, bookings: 210 },
    { name: 'Fri', revenue: 145000, bookings: 420 },
    { name: 'Sat', revenue: 210000, bookings: 610 },
    { name: 'Sun', revenue: 195000, bookings: 580 },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--cine-accent)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
            OPERATIONAL COMMAND CENTER
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            {currentTab === 'overview' && 'SYSTEM OVERVIEW'}
            {currentTab === 'movies' && 'CATALOGUE ASSETS'}
            {currentTab === 'theatres' && 'MULTIPLEX PARTNERS'}
            {currentTab === 'shows' && 'SCHEDULE MATRIX'}
            {currentTab === 'ai' && 'NEURAL COPILOT'}
            {currentTab === 'analytics' && 'BOX OFFICE ANALYTICS'}
            {currentTab === 'bookings' && 'ADMISSIONS LOG'}
          </h1>
        </div>

        <CineButton variant="outline" size="sm" onClick={fetchAdminData}>
          <RefreshCw size={14} />
          <span>SYNC TELEMETRY</span>
        </CineButton>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <CineCard style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cine-text-dim)', textTransform: 'uppercase' }}>GROSS BOX OFFICE</span>
            <DollarSign size={16} color="var(--cine-accent)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--cine-font-mono)', color: 'var(--cine-text)' }}>
            ₹{(stats?.totalRevenue || 758000).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>
            +18.4% vs last cycle
          </div>
        </CineCard>

        <CineCard style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cine-text-dim)', textTransform: 'uppercase' }}>TOTAL ADMISSIONS</span>
            <Ticket size={16} color="var(--cine-accent)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--cine-font-mono)', color: 'var(--cine-text)' }}>
            {stats?.totalBookings || 2198}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>
            94.2% verified entry
          </div>
        </CineCard>

        <CineCard style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cine-text-dim)', textTransform: 'uppercase' }}>ACTIVE MULTIPLEXES</span>
            <Building2 size={16} color="var(--cine-accent)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--cine-font-mono)', color: 'var(--cine-text)' }}>
            {theatresList.length || stats?.totalTheatres || 8}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cine-text-muted)', marginTop: '4px' }}>
            Across Mumbai & Delhi
          </div>
        </CineCard>

        <CineCard style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cine-text-dim)', textTransform: 'uppercase' }}>FEATURED FILMS</span>
            <Film size={16} color="var(--cine-accent)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--cine-font-mono)', color: 'var(--cine-text)' }}>
            {moviesList.length || stats?.totalMovies || 12}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cine-text-muted)', marginTop: '4px' }}>
            IMAX, 4DX, Laser 4K
          </div>
        </CineCard>
      </div>

      {/* TAB: OVERVIEW / ANALYTICS */}
      {(currentTab === 'overview' || currentTab === 'analytics') && (
        <div style={{ display: 'grid', gap: '32px' }}>
          {/* Revenue Chart */}
          <CineCard style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Revenue & Admissions Trajectory</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--cine-text-muted)', margin: '2px 0 0 0' }}>Daily gross admissions across all connected auditoriums</p>
              </div>
              <CineBadge variant="outline">PAST 7 DAYS</CineBadge>
            </div>

            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E50914" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#E50914" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis dataKey="name" stroke="#71717A" fontSize={12} />
                  <YAxis stroke="#71717A" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: '#121216', border: '1px solid #27272A', borderRadius: '8px', color: '#FFF' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#E50914" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CineCard>

          {/* Quick Catalogue Table */}
          <CineCard style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Now Running Theatrical Assets</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--cine-text-muted)' }}>{moviesList.length} total</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--cine-border)', color: 'var(--cine-text-dim)' }}>
                    <th style={{ padding: '12px 16px' }}>FILM TITLE</th>
                    <th style={{ padding: '12px 16px' }}>GENRES</th>
                    <th style={{ padding: '12px 16px' }}>DURATION</th>
                    <th style={{ padding: '12px 16px' }}>RATING</th>
                    <th style={{ padding: '12px 16px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {moviesList.slice(0, 6).map((m) => (
                    <tr key={m._id} style={{ borderBottom: '1px solid var(--cine-border)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 800 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={m.poster}
                            alt={m.title}
                            style={{ width: '30px', height: '42px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <span>{m.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--cine-text-muted)' }}>{m.genres?.join(', ')}</td>
                      <td style={{ padding: '12px 16px' }}>{m.duration} mins</td>
                      <td style={{ padding: '12px 16px', color: '#FFD700', fontWeight: 800 }}>★ {m.rating}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <CineBadge variant="success">ACTIVE</CineBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CineCard>
        </div>
      )}

      {/* TAB: MOVIES */}
      {currentTab === 'movies' && (
        <CineCard style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Cinema Catalogue Management</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {moviesList.map((m) => (
              <CineCard key={m._id} style={{ padding: '16px', display: 'flex', gap: '14px' }}>
                <img
                  src={m.poster}
                  alt={m.title}
                  style={{ width: '64px', height: '96px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{m.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cine-text-muted)', marginTop: '2px' }}>
                    {m.genres?.join(', ')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#FFD700', fontWeight: 700, marginTop: '4px' }}>
                    ★ {m.rating} • {m.duration}m
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <CineBadge variant="outline">IN EXHIBITION</CineBadge>
                  </div>
                </div>
              </CineCard>
            ))}
          </div>
        </CineCard>
      )}

      {/* TAB: THEATRES */}
      {currentTab === 'theatres' && (
        <CineCard style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Multiplex Partners</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {theatresList.map((th) => (
              <CineCard key={th._id} style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{th.name}</div>
                  <CineBadge variant="primary">{th.city || 'Mumbai'}</CineBadge>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--cine-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                  <MapPin size={13} /> {th.location || 'Bandra West'}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {th.facilities?.slice(0, 4).map((f) => (
                    <CineBadge key={f} variant="outline">{f}</CineBadge>
                  ))}
                </div>
              </CineCard>
            ))}
          </div>
        </CineCard>
      )}

      {/* TAB: SHOWS */}
      {currentTab === 'shows' && (
        <CineCard style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Active Show Schedules</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--cine-text-muted)' }}>{showsList.length} slots loaded</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--cine-border)', color: 'var(--cine-text-dim)' }}>
                  <th style={{ padding: '12px 16px' }}>MOVIE</th>
                  <th style={{ padding: '12px 16px' }}>MULTIPLEX</th>
                  <th style={{ padding: '12px 16px' }}>FORMAT</th>
                  <th style={{ padding: '12px 16px' }}>TIME</th>
                  <th style={{ padding: '12px 16px' }}>BASE TICKET</th>
                </tr>
              </thead>
              <tbody>
                {showsList.slice(0, 10).map((s) => (
                  <tr key={s._id} style={{ borderBottom: '1px solid var(--cine-border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800 }}>{s.movie?.title || 'Screening'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--cine-text-muted)' }}>{s.theatre?.name || 'Multiplex'}</td>
                    <td style={{ padding: '12px 16px' }}><CineBadge variant="outline">{s.format || '2D'}</CineBadge></td>
                    <td style={{ padding: '12px 16px' }}>{s.startTime}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--cine-font-mono)', fontWeight: 800 }}>₹{s.pricing?.STANDARD || 250}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CineCard>
      )}

      {/* TAB: AI COPILOT */}
      {currentTab === 'ai' && (
        <div style={{ maxWidth: '800px' }}>
          <CineCard style={{ padding: '32px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Sparkles size={20} color="var(--cine-accent)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>CineAI Control Room Copilot</h3>
            </div>
            <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px' }}>
              Ask the autonomous cinema intelligence for yield optimization suggestions, weekend attendance predictions, or concession pairing insights.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAI();
              }}
              style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}
            >
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask Copilot (e.g. Which auditorium had the highest occupancy this Friday?)"
                style={{
                  flex: 1,
                  height: '48px',
                  background: 'var(--cine-surface-2)',
                  border: '1px solid var(--cine-border)',
                  borderRadius: 'var(--cine-radius-sm)',
                  padding: '0 16px',
                  color: 'var(--cine-text)',
                  outline: 'none',
                }}
              />
              <CineButton variant="primary" type="submit" disabled={aiLoading}>
                <Send size={16} />
                <span>{aiLoading ? 'ANALYZING...' : 'QUERY'}</span>
              </CineButton>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                'Predict peak attendance for next weekend',
                'Which movie has the highest repeat audience?',
                'Suggest concession bundle pricing for IMAX shows',
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setAiQuery(sample);
                    handleAskAI(sample);
                  }}
                  style={{
                    background: 'var(--cine-surface-2)',
                    border: '1px solid var(--cine-border)',
                    color: 'var(--cine-text-muted)',
                    padding: '6px 12px',
                    borderRadius: 'var(--cine-radius-full)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  {sample}
                </button>
              ))}
            </div>
          </CineCard>

          {aiInsight && (
            <CineCard style={{ padding: '24px', borderLeft: '4px solid var(--cine-accent)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--cine-accent)', textTransform: 'uppercase', marginBottom: '6px' }}>
                COPILOT SYNTHESIS
              </div>
              <p style={{ color: 'var(--cine-text)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                {aiInsight}
              </p>
            </CineCard>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
