import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { CineCard } from '../components/ui/CineCard';
import { CineButton } from '../components/ui/CineButton';
import { CineBadge } from '../components/ui/CineBadge';
import { CineLoader } from '../components/ui/CineLoader';
import { CineEmptyState } from '../components/ui/CineEmptyState';
import { Ticket, Calendar, Clock, MapPin, Eye, AlertTriangle, ArrowRight } from 'lucide-react';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingService.getMyBookings();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      const { data } = await bookingService.cancelBooking(cancelModalBooking._id, 'Cancelled by patron');
      if (data.success) {
        setCancelModalBooking(null);
        await fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (activeFilter === 'confirmed') return b.bookingStatus === 'confirmed';
    if (activeFilter === 'cancelled') return b.bookingStatus === 'cancelled';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cine-bg)', color: 'var(--cine-text)', paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="cine-container">
        {/* Masthead */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--cine-accent)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
            <Ticket size={14} />
            <span>TRANSACTION AUDIT & ADMISSIONS</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            MY CINEMA BOOKINGS
          </h1>
          <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.95rem', marginTop: '8px' }}>
            Digital admissions ledger, verified QR codes, and seat allocation passes.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
          {[
            { id: 'all', label: `ALL BOOKINGS (${bookings.length})` },
            { id: 'confirmed', label: `CONFIRMED (${bookings.filter((b) => b.bookingStatus === 'confirmed').length})` },
            { id: 'cancelled', label: `CANCELLED (${bookings.filter((b) => b.bookingStatus === 'cancelled').length})` },
          ].map((tab) => (
            <CineButton
              key={tab.id}
              variant={activeFilter === tab.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label}
            </CineButton>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <CineLoader text="Synchronizing admissions ledger..." />
        ) : filtered.length > 0 ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filtered.map((b) => (
              <CineCard
                key={b._id}
                style={{
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '280px' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: 'var(--cine-radius-md)',
                      background: 'var(--cine-surface-2)',
                      border: '1px solid var(--cine-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: b.bookingStatus === 'confirmed' ? '#10B981' : '#EF4444',
                    }}
                  >
                    <Ticket size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{b.movie?.title}</span>
                      <CineBadge variant={b.bookingStatus === 'confirmed' ? 'success' : 'error'}>
                        {b.bookingStatus?.toUpperCase()}
                      </CineBadge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem', color: 'var(--cine-text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} /> {b.theatre?.name}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> {b.showDate}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {b.showTime}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--cine-text-dim)', marginTop: '4px' }}>
                      Reserved Seats: <strong style={{ color: 'var(--cine-text)', fontFamily: 'var(--cine-font-mono)' }}>{b.seats?.map((s) => s.seatNumber).join(', ')}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--cine-text)', fontFamily: 'var(--cine-font-mono)' }}>
                      ₹{b.totalPrice || b.amount}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--cine-text-dim)', fontFamily: 'var(--cine-font-mono)' }}>
                      REF #{b.bookingId || b._id?.slice(-8)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <CineButton variant="outline" size="sm" onClick={() => navigate(`/tickets/${b._id}`)}>
                      <Eye size={14} />
                      <span>VIEW PASS</span>
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
            title="No Bookings in this Category"
            description="You have no tickets matching this filter. Explore current theatrical releases to reserve a seat."
            actionLabel="Discover Movies"
            onAction={() => navigate('/movies')}
          />
        )}

        {/* Cancellation Modal */}
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>Cancel Admission?</h3>
              </div>
              <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                Are you sure you want to cancel admission for <strong>{cancelModalBooking.movie?.title}</strong>? A refund will be initiated to your payment method.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <CineButton variant="outline" size="sm" onClick={() => setCancelModalBooking(null)} disabled={cancelling}>
                  KEEP PASS
                </CineButton>
                <CineButton
                  variant="primary"
                  size="sm"
                  style={{ background: '#EF4444' }}
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                >
                  {cancelling ? 'PROCESSING...' : 'CONFIRM CANCEL'}
                </CineButton>
              </div>
            </CineCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
