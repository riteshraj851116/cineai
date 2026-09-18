import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { CineCard } from '../components/ui/CineCard';
import { CineButton } from '../components/ui/CineButton';
import { CineBadge } from '../components/ui/CineBadge';
import { CineLoader } from '../components/ui/CineLoader';
import { CinemaTicket } from '../components/booking/CinemaTicket';
import { ArrowLeft, Printer, Download, Share2, AlertCircle } from 'lucide-react';

export const TicketView = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const { data } = await bookingService.getBookingById(bookingId);
        if (data.success) {
          setBooking(data.booking);
        } else {
          setError('Booking could not be retrieved.');
        }
      } catch (err) {
        console.error('Failed to load booking:', err);
        setError(err.response?.data?.message || 'Error fetching ticket details.');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CineLoader text="Decrypting admission barcode and verification credentials..." />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <CineCard style={{ maxWidth: '460px', textAlign: 'center', padding: '36px' }}>
          <AlertCircle size={40} color="#EF4444" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '8px' }}>Ticket Not Found</h2>
          <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
            {error || 'We could not locate this admission stub in the CineAI database.'}
          </p>
          <CineButton variant="primary" onClick={() => navigate('/profile?tab=bookings')}>
            RETURN TO MY BOOKINGS
          </CineButton>
        </CineCard>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cine-bg)', color: 'var(--cine-text)', paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="cine-container" style={{ maxWidth: '800px' }}>
        {/* Actions bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <CineButton variant="ghost" size="sm" onClick={() => navigate('/profile')}>
            <ArrowLeft size={16} />
            <span>BACK TO DASHBOARD</span>
          </CineButton>

          <div style={{ display: 'flex', gap: '10px' }}>
            <CineButton variant="outline" size="sm" onClick={handlePrint}>
              <Printer size={16} />
              <span>PRINT PASS</span>
            </CineButton>
          </div>
        </div>

        {/* Digital Pass Presentation */}
        <CinemaTicket booking={booking} />
      </div>
    </div>
  );
};

export default TicketView;
