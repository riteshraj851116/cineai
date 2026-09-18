import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CheckCircle2, QrCode, Download, Share2, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CinemaTicket = ({ booking, onDownload }) => {
  const ticketRef = useRef(null);

  useEffect(() => {
    if (ticketRef.current) {
      gsap.fromTo(
        ticketRef.current,
        { opacity: 0, scale: 0.9, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.75)' }
      );
    }
  }, []);

  if (!booking) return null;

  const { show, movie, theatre, seats, totalAmount, bookingReference, qrCode } = booking;

  return (
    <div className="cinema-ticket-viewport">
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--cinema-accent)', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          <CheckCircle2 size={18} />
          <span>BOOKING CONFIRMED & ISSUED</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.6rem', color: '#FFFFFF', letterSpacing: '0.04em' }}>
          YOUR CINEMA ENTRY PASS
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--cinema-text-secondary)' }}>
          Present this digital pass or scannable QR code at the cinema turnstile.
        </p>
      </div>

      <div ref={ticketRef} className="cinema-physical-ticket">
        {/* Top Header Artwork */}
        <div
          className="ticket-header-art"
          style={{
            backgroundImage: `url(${movie?.backdrop || movie?.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80'})`,
          }}
        />

        <div className="ticket-body-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cinema-accent)', fontWeight: 800 }}>
                {show?.format || 'IMAX 3D'} • AUDITORIUM {show?.screen?.name || '04'}
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#FFFFFF', marginTop: '2px', lineHeight: 1 }}>
                {movie?.title || 'THE LAST VOYAGE'}
              </h3>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cinema-text-secondary)' }}>
                REF NO.
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 900, color: '#FFFFFF' }}>
                {bookingReference || 'CINE-78921'}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', margin: '20px 0', padding: '14px 18px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--cinema-border)', borderRadius: '6px' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--cinema-text-secondary)', textTransform: 'uppercase' }}>DATE</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                {show?.date || '14 SEP 2026'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--cinema-text-secondary)', textTransform: 'uppercase' }}>TIME</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                {show?.startTime || '9:40 PM'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--cinema-text-secondary)', textTransform: 'uppercase' }}>SEATS</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--cinema-accent)', marginTop: '2px' }}>
                {seats?.map((s) => s.seatId).join(', ') || 'B12, B13'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--cinema-text-secondary)', textTransform: 'uppercase' }}>AMOUNT</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                ₹{totalAmount?.toLocaleString() || '1,640'}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--cinema-text-secondary)', marginBottom: '16px' }}>
            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>VENUE: </span>
            {theatre?.name || 'CINEPLEX CENTRAL'} — {theatre?.address || 'Connaught Place, New Delhi'}
          </div>

          {/* Perforation Line */}
          <div className="ticket-perforation">
            <div className="perforation-notch-left" />
            <div className="perforation-line" />
            <div className="perforation-notch-right" />
          </div>

          {/* QR Code Section */}
          <div className="ticket-qr-section">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: '#FFFFFF', textTransform: 'uppercase' }}>
                CRYPTOGRAPHIC ENTRY PASS
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--cinema-text-secondary)' }}>
                Valid for direct contactless turnstile admission.
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--cinema-accent)', marginTop: '4px' }}>
                STATUS: VERIFIED & CONFIRMED
              </span>
            </div>

            <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {qrCode ? (
                <img src={qrCode} alt="Ticket QR" style={{ width: '84px', height: '84px' }} />
              ) : (
                <QrCode size={84} color="#080808" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '14px', marginTop: '28px' }}>
        <button
          onClick={onDownload || (() => window.print())}
          className="btn-cinema-continue"
          style={{ padding: '12px 24px' }}
        >
          <Download size={16} />
          <span>PRINT / SAVE TICKET</span>
        </button>

        <Link
          to="/"
          className="btn-cinema-cancel"
          style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Film size={16} />
          <span>BACK TO HOME</span>
        </Link>
      </div>
    </div>
  );
};
