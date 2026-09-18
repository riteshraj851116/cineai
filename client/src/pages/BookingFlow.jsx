import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showService } from '../services/showService';
import { bookingService } from '../services/bookingService';
import { aiService } from '../services/aiService';
import apiClient from '../services/apiClient';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import '../styles/booking-dark.css';

// Modular Components
import { MovieHero } from '../components/booking/MovieHero';
import { BookingProgress } from '../components/booking/BookingProgress';
import { MoviePoster } from '../components/booking/MoviePoster';
import { SelectedSeats } from '../components/booking/SelectedSeats';
import { SeatMap } from '../components/booking/SeatMap';
import { AISeatAssistant } from '../components/booking/AISeatAssistant';
import { ShowInfo } from '../components/booking/ShowInfo';
import { PriceSummary } from '../components/booking/PriceSummary';
import { BookingActions } from '../components/booking/BookingActions';
import { FoodSelector } from '../components/booking/FoodSelector';
import { PaymentStep } from '../components/booking/PaymentStep';
import { CinemaTicket } from '../components/booking/CinemaTicket';
import { AuthModal } from '../components/common/AuthModal';

export const BookingFlow = () => {
  const { showId } = useParams();
  const [show, setShow] = useState(null);
  const [screen, setScreen] = useState(null);
  const [seatsMaster, setSeatsMaster] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [cartFood, setCartFood] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stepper state: 'seats' -> 'food' -> 'payment' -> 'ticket'
  const [step, setStep] = useState('seats');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [remainingTime, setRemainingTime] = useState(600);

  // AI Assistant Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendedSeats, setRecommendedSeats] = useState([]);
  const [aiReason, setAiReason] = useState('');

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Fetch Show and Seats Layout
  useEffect(() => {
    const fetchShowData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [showRes, seatsRes, foodRes] = await Promise.all([
          showService.getShowById(showId),
          showService.getSeatsByShow(showId),
          bookingService.getFoodItems(),
        ]);

        if (showRes.data.success) setShow(showRes.data.show);
        if (seatsRes.data.success) {
          setScreen(seatsRes.data.screen);
          setSeatsMaster(seatsRes.data.seats);
          setOccupiedSeats(seatsRes.data.occupiedSeats || []);
          setLockedSeats(seatsRes.data.lockedSeats || []);
        }
        if (foodRes.data.success) setFoodItems(foodRes.data.items);
      } catch (err) {
        console.error('Failed to load show:', err);
        setError("The cinema couldn't load right now. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchShowData();
  }, [showId]);

  // 2. Setup Socket.IO Live Synchronization
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_show', showId);

    socket.on('seat_state_sync', (state) => {
      setOccupiedSeats(state.occupiedSeats || []);
      setLockedSeats(state.lockedSeats || []);
    });

    socket.on('lock_success', ({ expiresAt }) => {
      setLockExpiresAt(new Date(expiresAt));
    });

    socket.on('lock_error', ({ message }) => {
      alert(message);
    });

    return () => {
      socket.emit('leave_show', showId);
      socket.off('seat_state_sync');
      socket.off('lock_success');
      socket.off('lock_error');
    };
  }, [socket, showId]);

  // Lock Countdown Timer
  useEffect(() => {
    if (!lockExpiresAt) return;

    const timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(lockExpiresAt) - new Date()) / 1000));
      setRemainingTime(diff);

      if (diff <= 0) {
        clearInterval(timer);
        setSelectedSeats([]);
        alert('Seat lock reservation expired. Please re-select your seats.');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockExpiresAt]);

  // 3. Seat Selection Handler
  const handleSeatClick = (seat) => {
    const isOccupied = occupiedSeats.includes(seat.seatId);
    if (isOccupied) return;

    const isLockedByOther = lockedSeats.some(
      (l) => l.seatId === seat.seatId && l.lockedBy !== socket?.id
    );
    if (isLockedByOther) {
      alert('THAT SEAT JUST GOT TAKEN. We have refreshed the seating map.');
      return;
    }

    const isAlreadySelected = selectedSeats.some((s) => s.seatId === seat.seatId);

    let updatedSelection;
    if (isAlreadySelected) {
      updatedSelection = selectedSeats.filter((s) => s.seatId !== seat.seatId);
      socket?.emit('request_unlock_seats', { showId, seatIds: [seat.seatId] });
    } else {
      if (selectedSeats.length >= 8) {
        alert('Maximum 8 seats allowed per booking.');
        return;
      }
      updatedSelection = [...selectedSeats, seat];
      socket?.emit('request_lock_seats', { showId, seatIds: [seat.seatId] });
    }

    setSelectedSeats(updatedSelection);
  };

  const handleRemoveSeat = (seat) => {
    const updated = selectedSeats.filter((s) => s.seatId !== seat.seatId);
    setSelectedSeats(updated);
    socket?.emit('request_unlock_seats', { showId, seatIds: [seat.seatId] });
  };

  // 4. AI Seat Recommender
  const handleAIRecommend = async ({ preference, partySize }) => {
    setAiLoading(true);
    try {
      const { data } = await apiClient.post('/ai/recommend-seats', {
        rows: screen?.rows || 8,
        columns: screen?.columns || 12,
        occupiedSeats,
        lockedSeats,
        preference,
        partySize,
      });

      if (data.success && data.result.recommendedSeats?.length > 0) {
        setRecommendedSeats(data.result.recommendedSeats);
        setAiReason(data.result.reason);

        const seatsToSelect = seatsMaster.filter((s) =>
          data.result.recommendedSeats.includes(s.seatId)
        );
        setSelectedSeats(seatsToSelect);

        socket?.emit('request_lock_seats', {
          showId,
          seatIds: data.result.recommendedSeats,
        });
      } else {
        alert(data.result?.reason || 'No adjacent seats found for this preference.');
      }
    } catch (err) {
      console.error('AI seat recommendation failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // 5. Food Cart Steppers
  const updateFoodQty = (foodItem, delta) => {
    setCartFood((prev) => {
      const currentQty = prev[foodItem._id]?.quantity || 0;
      const nextQty = Math.max(0, currentQty + delta);

      if (nextQty === 0) {
        const copy = { ...prev };
        delete copy[foodItem._id];
        return copy;
      }

      return {
        ...prev,
        [foodItem._id]: {
          foodItem: foodItem._id,
          name: foodItem.name,
          price: foodItem.price,
          quantity: nextQty,
        },
      };
    });
  };

  // 6. Coupon Application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');

    try {
      const { data } = await bookingService.validateCoupon(couponCode, calculateSubtotal());

      if (data.success) {
        setAppliedCoupon(data.coupon);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  // 7. Pricing Calculations
  const calculateSeatsTotal = () => {
    return selectedSeats.reduce((sum, seat) => {
      const price = show?.pricing?.[seat.category] || 250;
      return sum + price;
    }, 0);
  };

  const calculateFoodTotal = () => {
    return Object.values(cartFood).reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateSubtotal = () => calculateSeatsTotal() + calculateFoodTotal();

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.calculatedDiscount || 0;
  };

  const calculateConvenienceFee = () => (selectedSeats.length > 0 ? 60 : 0);

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - calculateDiscount() + calculateConvenienceFee());
  };

  // 8. Payment & Booking Execution
  const handleProceedToPayment = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setPaymentProcessing(true);
    try {
      const { data: intentData } = await bookingService.createBookingIntent({
        showId,
        seats: selectedSeats.map((s) => ({
          seatId: s.seatId,
          row: s.row,
          number: s.number,
          category: s.category,
          price: show.pricing[s.category] || 250,
        })),
        foodItems: Object.values(cartFood),
        couponCode: appliedCoupon?.code,
      });

      if (!intentData.success) throw new Error('Failed to create booking intent');

      const booking = intentData.booking;
      const order = intentData.orderData;

      const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const mockSignature = `mock_sig_${Date.now()}`;

      const { data: confirmData } = await bookingService.confirmBooking({
        bookingId: booking._id,
        orderId: order.orderId,
        paymentId: mockPaymentId,
        signature: mockSignature,
      });

      if (confirmData.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF4038', '#FFFFFF', '#333333'],
        });

        setConfirmedBooking(confirmData.booking);
        setStep('ticket');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // 9. Error or Loading State
  if (loading) {
    return (
      <div className="dark-booking-viewport" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', fontFamily: 'var(--font-mono)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '8px', letterSpacing: '0.1em' }}>
            CINEAI AUDITORIUM INITIALIZATION
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--cinema-text-secondary)' }}>
            ✦ CineAI is loading the seating map and acoustics parameters...
          </div>
        </div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="dark-booking-viewport" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '440px', padding: '32px', background: 'var(--cinema-card)', border: '1px solid var(--cinema-border)', borderRadius: '8px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#FFFFFF', marginBottom: '10px' }}>
            WE LOST THE SIGNAL.
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--cinema-text-secondary)', marginBottom: '20px' }}>
            {error || "The cinema couldn't load right now."}
          </p>
          <button onClick={() => window.location.reload()} className="btn-cinema-continue" style={{ margin: '0 auto' }}>
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-booking-viewport">
      {/* 2. CINEMATIC HERO HEADER */}
      <MovieHero
        movie={show.movie}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSearch={() => navigate('/movies')}
      />

      {/* 5. BOOKING PROGRESS */}
      <BookingProgress
        step={step}
        onStepChange={(targetStep) => {
          if (targetStep === 'seats') setStep('seats');
          else if (targetStep === 'payment' && selectedSeats.length > 0) setStep('payment');
        }}
      />

      {/* 6. MAIN BOOKING 3-ZONE LAYOUT (STEP 1: SEATS) */}
      {step === 'seats' && (
        <div className="cinema-booking-grid">
          {/* ZONE 1 (LEFT): MOVIE POSTER & SELECTED SEATS */}
          <div className="zone-poster-seats">
            <MoviePoster posterUrl={show.movie?.poster} title={show.movie?.title} />
            <SelectedSeats
              selectedSeats={selectedSeats}
              pricing={show.pricing}
              onRemoveSeat={handleRemoveSeat}
            />
          </div>

          {/* ZONE 2 (CENTER): REALISTIC CINEMA SEAT MAP */}
          <SeatMap
            screen={screen}
            seatsMaster={seatsMaster}
            occupiedSeats={occupiedSeats}
            lockedSeats={lockedSeats}
            selectedSeats={selectedSeats}
            recommendedSeats={recommendedSeats}
            pricing={show.pricing}
            socketId={socket?.id}
            onSeatClick={handleSeatClick}
            onOpenAIAssistant={() => setIsAIModalOpen(true)}
            aiReason={aiReason}
          />

          {/* ZONE 3 (RIGHT): DATE / TIME / CINEMA / PRICE / ACTIONS */}
          <div className="zone-info-checkout">
            <div className="cinema-info-card">
              <ShowInfo show={show} movie={show.movie} />
              <PriceSummary
                ticketsTotal={calculateSeatsTotal()}
                convenienceFee={calculateConvenienceFee()}
                discount={calculateDiscount()}
                total={calculateTotal()}
              />
              <BookingActions
                onCancel={() => navigate(-1)}
                onContinue={() => setStep('food')}
                continueDisabled={selectedSeats.length === 0}
                continueLabel="CONTINUE"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CONCESSIONS ORDER */}
      {step === 'food' && (
        <FoodSelector
          foodItems={foodItems}
          cartFood={cartFood}
          onUpdateQty={updateFoodQty}
          onBack={() => setStep('seats')}
          onProceed={() => setStep('payment')}
          foodTotal={calculateFoodTotal()}
        />
      )}

      {/* STEP 3: PAYMENT & CHECKOUT */}
      {step === 'payment' && (
        <PaymentStep
          movie={show.movie}
          show={show}
          selectedSeats={selectedSeats}
          cartFood={cartFood}
          pricing={show.pricing}
          subtotal={calculateSubtotal()}
          discount={calculateDiscount()}
          convenienceFee={calculateConvenienceFee()}
          total={calculateTotal()}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          appliedCoupon={appliedCoupon}
          couponError={couponError}
          onApplyCoupon={handleApplyCoupon}
          onBack={() => setStep('food')}
          onPay={handleProceedToPayment}
          processing={paymentProcessing}
        />
      )}

      {/* STEP 4: CONFIRMED PHYSICAL DIGITAL TICKET */}
      {step === 'ticket' && (
        <CinemaTicket
          booking={confirmedBooking}
          onDownload={() => window.print()}
        />
      )}

      {/* 19. MOBILE STICKY SUMMARY BAR */}
      {step === 'seats' && selectedSeats.length > 0 && (
        <div className="mobile-sticky-summary">
          <div className="mobile-summary-meta">
            <span className="mobile-seats-count">
              {selectedSeats.length} {selectedSeats.length === 1 ? 'SEAT' : 'SEATS'}
            </span>
            <span className="mobile-price-val">₹{calculateTotal().toLocaleString()}</span>
          </div>

          <button
            onClick={() => setStep('food')}
            className="btn-cinema-continue"
            style={{ padding: '10px 20px', fontSize: '0.78rem' }}
          >
            <span>CONTINUE →</span>
          </button>
        </div>
      )}

      {/* 12. AI SEAT ASSISTANT MODAL */}
      <AISeatAssistant
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onRecommend={handleAIRecommend}
        loading={aiLoading}
      />

      {/* Auth Modal Trigger */}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </div>
  );
};
