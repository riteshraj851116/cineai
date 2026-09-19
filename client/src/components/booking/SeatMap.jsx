import React from 'react';
import { Sparkles, Volume2, Target, RotateCcw, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Seat } from './Seat';
import { SeatLegend } from './SeatLegend';

export const SeatMap = ({
  screen,
  seatsMaster,
  occupiedSeats,
  lockedSeats,
  selectedSeats,
  recommendedSeats,
  pricing,
  socketId,
  onSeatClick,
  onOpenAIAssistant,
  aiReason,
}) => {
  // Group seats by row
  const rowsMap = {};
  seatsMaster.forEach((seat) => {
    if (!rowsMap[seat.row]) rowsMap[seat.row] = [];
    rowsMap[seat.row].push(seat);
  });

  const isSweetSpotRow = (rowLetter) => ['D', 'E', 'F'].includes(rowLetter);

  return (
    <div className="zone-seat-map">
      {/* 1. HIGH-TECH CINEAI NEURAL SEAT OPTIMIZER BANNER */}
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          margin: '0 auto 20px auto',
          background: 'radial-gradient(ellipse at top left, rgba(225, 29, 72, 0.15), rgba(6, 182, 212, 0.1) 60%, rgba(18, 20, 28, 0.95) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(6, 182, 212, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #E11D48, #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.4)',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#FFFFFF' }}>
                  CineAI Acoustic Sweet Spot Finder
                </span>
                <span
                  style={{
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: '#06B6D4',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  AI ENGINE
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px' }}>
                Auto-calibrates Rows D–F for zero-distortion Dolby Atmos 64-channel spatial sound.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAIAssistant}
            style={{
              background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(225, 29, 72, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(225, 29, 72, 0.4)';
            }}
          >
            <Sparkles size={13} />
            <span>FIND BEST SEATS</span>
          </button>
        </div>

        {/* 1-Click Quick Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', alignSelf: 'center' }}>
            PRESETS:
          </span>
          <button
            type="button"
            onClick={onOpenAIAssistant}
            style={{
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: '#06B6D4',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Volume2 size={11} /> Dolby Atmos Sweet Spot (Rows D–F)
          </button>
          <button
            type="button"
            onClick={onOpenAIAssistant}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#CBD5E1',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Target size={11} /> Center Focal Axis
          </button>
          <button
            type="button"
            onClick={onOpenAIAssistant}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#CBD5E1',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Zap size={11} /> VIP Recliners
          </button>
        </div>
      </div>

      {/* 2. AI REASONING CALIBRATION BANNER (WHEN SEATS ARE RECOMMENDED) */}
      {aiReason && (
        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            margin: '0 auto 20px auto',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#06B6D4',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px',
            }}
          >
            <CheckCircle2 size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#06B6D4', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                CineAI Calibrated Sweet Spot
              </span>
              <span style={{ fontSize: '0.68rem', color: '#10B981', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                {recommendedSeats.length} SEATS LOCKED
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#E2E8F0', marginTop: '4px', lineHeight: 1.4 }}>
              {aiReason}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', fontSize: '0.68rem', color: '#94A3B8' }}>
              <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: '4px' }}>✓ 64-Channel Atmos Balance</span>
              <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: '4px' }}>✓ Zero Geometric Parallax</span>
              <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: '4px' }}>✓ 120° Horizontal FOV</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SCREEN ARC WITH AMBIENT BACKLIGHT */}
      <div className="cinema-screen-wrap">
        <div className="cinema-screen-arc" />
        <div className="cinema-screen-label">SCREEN PROJECTION SURFACE</div>
      </div>

      {/* 4. REALISTIC CINEMA SEATING MATRIX WITH ACOUSTIC SWEET SPOT HIGHLIGHT */}
      <div className="cinema-seats-matrix">
        {Object.keys(rowsMap)
          .sort()
          .reverse()
          .map((rowLetter) => {
            const isSweet = isSweetSpotRow(rowLetter);
            return (
              <div
                key={rowLetter}
                className="cinema-seat-row"
                style={{
                  position: 'relative',
                  padding: isSweet ? '4px 8px' : '0',
                  borderRadius: isSweet ? '8px' : '0',
                  background: isSweet ? 'rgba(6, 182, 212, 0.04)' : 'transparent',
                  border: isSweet ? '1px dashed rgba(6, 182, 212, 0.25)' : '1px solid transparent',
                }}
              >
                <span className="cinema-row-label" style={{ color: isSweet ? '#06B6D4' : undefined, fontWeight: isSweet ? 900 : undefined }}>
                  {rowLetter}
                </span>

                {rowsMap[rowLetter].map((seat) => {
                  const isOccupied = occupiedSeats.includes(seat.seatId);
                  const isLocked = lockedSeats.some(
                    (l) => l.seatId === seat.seatId && l.lockedBy !== socketId
                  );
                  const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);
                  const isRec = recommendedSeats.includes(seat.seatId);
                  const price = pricing?.[seat.category] || 250;

                  return (
                    <Seat
                      key={seat.seatId}
                      seat={seat}
                      price={price}
                      isOccupied={isOccupied}
                      isLocked={isLocked}
                      isSelected={isSelected}
                      isRecommended={isRec}
                      onClick={onSeatClick}
                    />
                  );
                })}

                <span className="cinema-row-label" style={{ color: isSweet ? '#06B6D4' : undefined, fontWeight: isSweet ? 900 : undefined }}>
                  {rowLetter}
                </span>

                {isSweet && rowLetter === 'E' && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '-110px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      color: '#06B6D4',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      display: 'none', // Shown on wider screens
                    }}
                    className="acoustic-zone-pill"
                  >
                    ✦ SWEET SPOT
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* 5. SEAT LEGEND WITH SWEET SPOT INDICATOR */}
      <SeatLegend />
    </div>
  );
};

export default SeatMap;
