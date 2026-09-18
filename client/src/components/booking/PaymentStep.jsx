import React, { useState } from 'react';
import { CreditCard, ShieldCheck, ArrowLeft, ArrowRight, Tag } from 'lucide-react';

export const PaymentStep = ({
  movie,
  show,
  selectedSeats,
  cartFood,
  pricing,
  subtotal,
  discount,
  convenienceFee,
  total,
  couponCode,
  setCouponCode,
  appliedCoupon,
  couponError,
  onApplyCoupon,
  onBack,
  onPay,
  processing,
  paymentError,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');

  return (
    <div className="cinema-payment-viewport">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '0.74rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cinema-accent)', fontWeight: 800 }}>
            FINAL CONFIRMATION & SETTLEMENT
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', color: '#FFFFFF', letterSpacing: '0.04em' }}>
            PAYMENT
          </h2>
        </div>

        <button
          onClick={onBack}
          className="btn-cinema-cancel"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.74rem' }}
        >
          <ArrowLeft size={14} />
          <span>BACK TO CONCESSIONS</span>
        </button>
      </div>

      <div className="glass-panel glass-reflection" style={{ maxWidth: '820px', margin: '0 auto', padding: '36px' }}>
        {/* Payment Error Notice */}
        {paymentError && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--glass-radius-sm)',
              color: '#FF6B6B',
              fontSize: '0.85rem',
              marginBottom: '22px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontWeight: 800 }}>⚠️</span>
            <span>{paymentError}</span>
          </div>
        )}

        {/* Booking Summary Section */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--cinema-text-secondary)', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 800 }}>
            RESERVATION SUMMARY
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.84rem' }}>
            <div>
              <span style={{ color: 'var(--cinema-text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', display: 'block' }}>MOVIE</span>
              <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.05rem' }}>{movie?.title}</span>
            </div>

            <div>
              <span style={{ color: 'var(--cinema-text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', display: 'block' }}>CINEMA</span>
              <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{show?.theatre?.name} ({show?.screen?.name})</span>
            </div>

            <div>
              <span style={{ color: 'var(--cinema-text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', display: 'block' }}>SHOWTIME</span>
              <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{show?.date} @ {show?.startTime} ({show?.format})</span>
            </div>

            <div>
              <span style={{ color: 'var(--cinema-text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', display: 'block' }}>SEATS ({selectedSeats.length})</span>
              <span style={{ color: 'var(--cinema-accent)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {selectedSeats.map((s) => s.seatId).join(', ')}
              </span>
            </div>
          </div>

          {/* Concessions List if any */}
          {Object.keys(cartFood).length > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--glass-border)' }}>
              <span style={{ color: 'var(--cinema-text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>FOOD & DRINKS</span>
              {Object.values(cartFood).map((item) => (
                <div key={item.foodItem} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#CCCCCC', marginBottom: '3px' }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Promo Voucher Input */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--cinema-text-secondary)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 800 }}>
            PROMO CODE / VOUCHER
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Tag size={16} color="var(--cinema-text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. CINEAI20, WELCOME10"
                className="glass-input"
                style={{
                  paddingLeft: '38px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                }}
              />
            </div>
            <button
              onClick={onApplyCoupon}
              type="button"
              className="glass-btn glass-btn-outline"
              style={{ padding: '0 20px', height: '44px' }}
            >
              APPLY
            </button>
          </div>

          {appliedCoupon && (
            <div style={{ color: 'var(--cinema-accent)', fontSize: '0.78rem', marginTop: '6px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              ✓ PROMO CODE {appliedCoupon.code} APPLIED (-₹{appliedCoupon.calculatedDiscount})
            </div>
          )}
          {couponError && (
            <div style={{ color: '#FF6B6B', fontSize: '0.75rem', marginTop: '6px' }}>
              {couponError}
            </div>
          )}
        </div>

        {/* 14 — PAYMENT METHODS IN GLASS CARDS */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--cinema-text-secondary)', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 800 }}>
            SELECT PAYMENT METHOD
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
            {[
              { id: 'upi', label: 'UPI / QR', desc: 'Pay securely with GPay, PhonePe, Paytm' },
              { id: 'card', label: 'CREDIT / DEBIT', desc: 'Visa, Mastercard, RuPay' },
              { id: 'netbanking', label: 'NET BANKING', desc: 'All Indian major banks' },
            ].map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`glass-card ${isSelected ? 'glass-card-selected' : ''}`}
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    borderRadius: 'var(--glass-radius-sm)',
                    background: isSelected ? 'rgba(255, 64, 56, 0.12)' : 'var(--glass-bg)',
                    borderColor: isSelected ? 'var(--cine-accent)' : 'var(--glass-border)',
                    boxShadow: isSelected ? '0 8px 24px rgba(255, 64, 56, 0.25)' : 'none',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.06em' }}>
                      {method.label}
                    </span>
                    {isSelected && (
                      <span style={{ color: 'var(--cine-accent)', fontWeight: 900, fontSize: '0.9rem' }}>✓</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--cinema-text-secondary)', margin: 0 }}>
                    {method.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {paymentMethod === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Card Number"
                className="glass-input"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="glass-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
                <input
                  type="password"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="CVV"
                  maxLength={4}
                  className="glass-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Financial Breakdown */}
        <div className="glass-surface" style={{ padding: '18px 24px', borderRadius: 'var(--glass-radius-sm)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--cinema-text-secondary)', marginBottom: '6px' }}>
            <span>Tickets + Concessions</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>₹{subtotal.toLocaleString()}</span>
          </div>

          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--cinema-accent)', marginBottom: '6px', fontWeight: 800 }}>
              <span>Voucher Discount</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>-₹{discount.toLocaleString()}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--cinema-text-secondary)', marginBottom: '12px' }}>
            <span>Convenience Fee & GST</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>₹{convenienceFee.toLocaleString()}</span>
          </div>

          <div style={{ height: '1px', background: 'var(--glass-border)', margin: '10px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#FFFFFF' }}>TOTAL DUE</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 900, color: '#FFFFFF' }}>
              ₹{total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onPay}
          disabled={processing}
          type="button"
          className="glass-btn glass-btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '0.9rem', borderRadius: 'var(--glass-radius-sm)' }}
        >
          <CreditCard size={18} />
          <span>{processing ? 'PROCESSING PAYMENT & ISSUING PASS...' : `PAY ₹${total.toLocaleString()} & PRINT PASS →`}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--cinema-text-secondary)', fontSize: '0.72rem', marginTop: '14px' }}>
          <ShieldCheck size={14} color="var(--cinema-accent)" />
          <span>256-bit Encrypted Banking Gateway • Instant QR Delivery</span>
        </div>
      </div>
    </div>
  );
};
