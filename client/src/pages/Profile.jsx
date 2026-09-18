import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Ticket,
  Heart,
  MessageSquare,
  Award,
  Sliders,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  LogOut,
  Save,
  Star,
  Film
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import { bookingService } from '../services/bookingService';
import { watchlistService } from '../services/watchlistService';
import { rewardService } from '../services/rewardService';
import { CineCard } from '../components/ui/CineCard';
import { CineButton } from '../components/ui/CineButton';
import { CineBadge } from '../components/ui/CineBadge';
import { CineTabs } from '../components/ui/CineTabs';
import { CineLoader } from '../components/ui/CineLoader';
import { CineMovieCard } from '../components/ui/CineMovieCard';
import { CineEmptyState } from '../components/ui/CineEmptyState';

export const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const { citiesList } = useCity();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');

  // Profile preferences form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [preferredFormat, setPreferredFormat] = useState('IMAX');
  const [favouriteGenres, setFavouriteGenres] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Data states
  const [bookings, setBookings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loyalty, setLoyalty] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation state
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const availableGenres = ['Action', 'Sci-Fi', 'Drama', 'Thriller', 'Comedy', 'Animation', 'Horror', 'Adventure'];

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCity(user.city || 'Mumbai');
      setPreferredFormat(user.preferences?.preferredFormat || 'IMAX');
      setFavouriteGenres(user.favouriteGenres || ['Sci-Fi', 'Action']);
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [bookingsRes, watchlistRes, loyaltyRes] = await Promise.allSettled([
        bookingService.getMyBookings(),
        watchlistService.getWatchlist(),
        rewardService.getLoyaltyBalance(),
      ]);

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value.data?.success) {
        setBookings(bookingsRes.value.data.bookings || []);
      }
      if (watchlistRes.status === 'fulfilled' && watchlistRes.value.data?.success) {
        setWatchlist(watchlistRes.value.data.watchlist || []);
      }
      if (loyaltyRes.status === 'fulfilled' && loyaltyRes.value.data?.success) {
        setLoyalty(loyaltyRes.value.data.loyalty || null);
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    try {
      const updated = await updateProfile({
        name,
        city,
        preferences: { preferredFormat },
        favouriteGenres,
      });
      if (updated) {
        setSaveMessage('Preferences updated successfully.');
        setTimeout(() => setSaveMessage(''), 4000);
      }
    } catch (err) {
      setSaveMessage('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleGenre = (g) => {
    if (favouriteGenres.includes(g)) {
      setFavouriteGenres(favouriteGenres.filter((item) => item !== g));
    } else {
      setFavouriteGenres([...favouriteGenres, g]);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      const { data } = await bookingService.cancelBooking(
        cancelModalBooking._id,
        'Requested by patron from dashboard'
      );
      if (data.success) {
        setCancelModalBooking(null);
        await loadProfileData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const upcomingBooking = bookings.find((b) => b.bookingStatus === 'confirmed');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cine-bg)', color: 'var(--cine-text)', paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="cine-container">
        {/* Patron Header Banner */}
        <CineCard style={{ padding: '36px', marginBottom: '36px', border: '1px solid var(--cine-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: 'var(--cine-radius-full)',
                  background: 'var(--cine-surface-2)',
                  border: '2px solid var(--cine-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cine-accent)',
                  fontWeight: 900,
                  fontSize: '1.6rem',
                  fontFamily: 'var(--cine-font-heading)',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
                    {user?.name || 'CineAI Patron'}
                  </h1>
                  <CineBadge variant="primary">{user?.role === 'admin' ? 'SYSTEM ARCHITECT' : 'VERIFIED PATRON'}</CineBadge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--cine-text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                  <span>{user?.email}</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} /> {user?.city || 'Mumbai'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-md)', padding: '12px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--cine-text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>CINEPOINTS</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--cine-accent)', fontFamily: 'var(--cine-font-mono)' }}>
                  {loyalty?.points || user?.cinePoints || 450}
                </div>
              </div>
              <div style={{ background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-md)', padding: '12px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--cine-text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>ADMISSIONS</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--cine-text)', fontFamily: 'var(--cine-font-mono)' }}>
                  {bookings.length}
                </div>
              </div>
              <div style={{ background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-md)', padding: '12px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--cine-text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>WATCHLIST</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--cine-text)', fontFamily: 'var(--cine-font-mono)' }}>
                  {watchlist.length}
                </div>
              </div>
            </div>
          </div>
        </CineCard>

        {/* Tab Navigation */}
        <div style={{ marginBottom: '32px' }}>
          <CineTabs
            tabs={[
              { id: 'overview', label: 'User Dashboard' },
              { id: 'bookings', label: `My Bookings (${bookings.length})` },
              { id: 'watchlist', label: `Watchlist (${watchlist.length})` },
              { id: 'rewards', label: 'Loyalty & Rewards' },
              { id: 'preferences', label: 'Preferences' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* TAB: DASHBOARD OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: '32px' }}>
            {/* Next Upcoming Booking Hero */}
            {upcomingBooking ? (
              <CineCard style={{ padding: '28px', border: '1px solid var(--cine-accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--cine-accent)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      UPCOMING RESERVATION PASS
                    </span>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '6px 0 10px 0' }}>
                      {upcomingBooking.movie?.title || 'Screening'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--cine-text-muted)', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} /> {upcomingBooking.theatre?.name}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {upcomingBooking.showDate}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {upcomingBooking.showTime}
                      </span>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--cine-text)' }}>
                      Seats: <strong style={{ color: 'var(--cine-accent)', fontFamily: 'var(--cine-font-mono)' }}>{upcomingBooking.seats?.map((s) => s.seatNumber).join(', ')}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <CineButton
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/tickets/${upcomingBooking._id}`)}
                    >
                      <Eye size={14} />
                      <span>VIEW DIGITAL PASS</span>
                    </CineButton>
                  </div>
                </div>
              </CineCard>
            ) : (
              <CineCard style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--cine-text-muted)', margin: 0, fontSize: '0.92rem' }}>
                  No active upcoming bookings. Explore the theatrical schedule to reserve your seats.
                </p>
                <CineButton
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/movies')}
                  style={{ marginTop: '14px' }}
                >
                  BROWSE NOW SHOWING
                </CineButton>
              </CineCard>
            )}

            {/* Quick Watchlist & AI Recommendations split */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <CineCard style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Watchlist Snapshot</h3>
                  <CineButton variant="ghost" size="sm" onClick={() => setActiveTab('watchlist')}>
                    View All
                  </CineButton>
                </div>
                {watchlist.length > 0 ? (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {watchlist.slice(0, 3).map((m) => (
                      <div
                        key={m._id}
                        onClick={() => navigate(`/movies/${m._id}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px',
                          borderRadius: 'var(--cine-radius-sm)',
                          background: 'var(--cine-surface-2)',
                          cursor: 'pointer',
                        }}
                      >
                        <img
                          src={m.poster}
                          alt={m.title}
                          style={{ width: '36px', height: '52px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{m.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--cine-text-muted)' }}>{m.genres?.join(', ')}</div>
                        </div>
                        <ArrowRight size={14} color="var(--cine-text-dim)" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--cine-text-dim)', fontSize: '0.85rem' }}>No titles bookmarked yet.</p>
                )}
              </CineCard>

              <CineCard style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Sparkles size={16} color="var(--cine-accent)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>AI Cinema Suggestions</h3>
                </div>
                <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '16px' }}>
                  Based on your affinity for {favouriteGenres.join(' & ') || 'Sci-Fi'}, CineAI recommends experiencing new large-format screenings.
                </p>
                <CineButton variant="outline" size="sm" onClick={() => navigate('/ai?mode=matchmaker')}>
                  OPEN MATCHMAKER
                </CineButton>
              </CineCard>
            </div>
          </div>
        )}

        {/* TAB: MY BOOKINGS */}
        {activeTab === 'bookings' && (
          <div>
            {loading ? (
              <CineLoader text="Loading your admission ledger..." />
            ) : bookings.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {bookings.map((b) => (
                  <CineCard
                    key={b._id}
                    style={{
                      padding: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flex: 1, minWidth: '260px' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--cine-radius-md)',
                          background: 'var(--cine-surface-2)',
                          border: '1px solid var(--cine-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: b.bookingStatus === 'confirmed' ? '#10B981' : '#EF4444',
                        }}
                      >
                        <Ticket size={22} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{b.movie?.title}</span>
                          <CineBadge variant={b.bookingStatus === 'confirmed' ? 'success' : 'error'}>
                            {b.bookingStatus?.toUpperCase()}
                          </CineBadge>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--cine-text-muted)', marginTop: '4px' }}>
                          <span>{b.theatre?.name}</span>
                          <span>•</span>
                          <span>{b.showDate} at {b.showTime}</span>
                          <span>•</span>
                          <span>Seats: {b.seats?.map((s) => s.seatNumber).join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--cine-font-mono)' }}>
                          ₹{b.totalPrice || b.amount}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--cine-text-dim)' }}>
                          ID: {b.bookingId || b._id?.slice(-8)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <CineButton variant="outline" size="sm" onClick={() => navigate(`/tickets/${b._id}`)}>
                          <Eye size={13} />
                          <span>PASS</span>
                        </CineButton>
                        {b.bookingStatus === 'confirmed' && (
                          <CineButton
                            variant="ghost"
                            size="sm"
                            style={{ color: '#EF4444' }}
                            onClick={() => setCancelModalBooking(b)}
                          >
                            CANCEL
                          </CineButton>
                        )}
                      </div>
                    </div>
                  </CineCard>
                ))}
              </div>
            ) : (
              <CineEmptyState
                icon={Ticket}
                title="No Bookings on Record"
                description="You have not purchased any cinema admissions yet. Book a ticket for an upcoming screening."
                actionLabel="Explore Movies"
                onAction={() => navigate('/movies')}
              />
            )}
          </div>
        )}

        {/* TAB: WATCHLIST */}
        {activeTab === 'watchlist' && (
          <div>
            {watchlist.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {watchlist.map((movie) => (
                  <CineMovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            ) : (
              <CineEmptyState
                icon={Heart}
                title="Watchlist is Empty"
                description="Add upcoming or currently running movies to your watchlist to track showtimes and alerts."
                actionLabel="Browse Movies"
                onAction={() => navigate('/movies')}
              />
            )}
          </div>
        )}

        {/* TAB: REWARDS & LOYALTY */}
        {activeTab === 'rewards' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <CineCard style={{ padding: '36px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <Award size={28} color="var(--cine-accent)" />
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>CineAI Elite Rewards</h2>
                  <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
                    Accumulate points on every exhibition admission and unlock complimentary concessions.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                <div style={{ background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-md)', padding: '16px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--cine-text-dim)', fontWeight: 700 }}>MEMBERSHIP STATUS</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--cine-text)', marginTop: '4px' }}>
                    {loyalty?.tier || 'PLATINUM PATRON'}
                  </div>
                </div>
                <div style={{ background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-md)', padding: '16px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--cine-text-dim)', fontWeight: 700 }}>ACCUMULATED BALANCE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--cine-accent)', fontFamily: 'var(--cine-font-mono)', marginTop: '4px' }}>
                    {loyalty?.points || 450} PTS
                  </div>
                </div>
                <div style={{ background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-md)', padding: '16px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--cine-text-dim)', fontWeight: 700 }}>SAVED ON TICKETS</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10B981', fontFamily: 'var(--cine-font-mono)', marginTop: '4px' }}>
                    ₹850
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px' }}>Member Privileges</h4>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>Zero convenience fee on IMAX & Laser 4K bookings</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>Complimentary gourmet caramel popcorn voucher on 5th booking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>Priority seat reservation lock 15 minutes before public sale</span>
                </div>
              </div>
            </CineCard>
          </div>
        )}

        {/* TAB: PREFERENCES */}
        {activeTab === 'preferences' && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <CineCard style={{ padding: '36px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '6px' }}>Viewing Preferences</h2>
              <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                Fine-tune your personal metadata to calibrate AI recommendations.
              </p>

              <form onSubmit={handleSavePreferences}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>FULL NAME</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', height: '46px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 14px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>DEFAULT CITY</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ width: '100%', height: '46px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 14px' }}
                  >
                    {citiesList?.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>PREFERRED FORMAT</label>
                  <select
                    value={preferredFormat}
                    onChange={(e) => setPreferredFormat(e.target.value)}
                    style={{ width: '100%', height: '46px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 14px' }}
                  >
                    <option value="IMAX">IMAX 70mm / Laser</option>
                    <option value="4DX">4DX Motion</option>
                    <option value="3D">RealD 3D</option>
                    <option value="2D">Standard 2D</option>
                  </select>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '10px' }}>FAVORITE GENRES</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {availableGenres.map((g) => {
                      const isSelected = favouriteGenres.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handleToggleGenre(g)}
                          style={{
                            background: isSelected ? 'var(--cine-accent)' : 'var(--cine-surface-2)',
                            color: isSelected ? '#FFFFFF' : 'var(--cine-text-muted)',
                            border: `1px solid ${isSelected ? 'var(--cine-accent)' : 'var(--cine-border)'}`,
                            borderRadius: 'var(--cine-radius-full)',
                            padding: '6px 14px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {saveMessage && (
                  <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: '#10B981', fontWeight: 700 }}>
                    {saveMessage}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <CineButton variant="primary" type="submit" disabled={saving}>
                    <Save size={16} />
                    <span>{saving ? 'SAVING...' : 'SAVE CHANGES'}</span>
                  </CineButton>

                  <CineButton variant="ghost" onClick={logout} style={{ color: '#EF4444' }}>
                    <LogOut size={16} />
                    <span>SIGN OUT</span>
                  </CineButton>
                </div>
              </form>
            </CineCard>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {cancelModalBooking && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <CineCard style={{ maxWidth: '440px', width: '100%', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#EF4444', marginBottom: '12px' }}>
                <AlertTriangle size={24} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>Cancel Reservation?</h3>
              </div>
              <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                Are you sure you want to cancel admission for <strong>{cancelModalBooking.movie?.title}</strong>? A refund of 80% will be credited to your account.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <CineButton variant="outline" size="sm" onClick={() => setCancelModalBooking(null)} disabled={cancelling}>
                  KEEP BOOKING
                </CineButton>
                <CineButton
                  variant="primary"
                  size="sm"
                  style={{ background: '#EF4444' }}
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                >
                  {cancelling ? 'PROCESSING...' : 'CONFIRM CANCELLATION'}
                </CineButton>
              </div>
            </CineCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
