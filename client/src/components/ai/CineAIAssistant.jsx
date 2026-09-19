import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCity } from '../../context/CityContext';
import { aiService } from '../../services/aiService';
import { bookingService } from '../../services/bookingService';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Ticket,
  Film,
  Tag,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
  Star,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const CineAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { selectedCity } = useCity();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const initialGreeting = user
    ? `Welcome back, ${user.name.split(' ')[0]}! I'm CineAI, your neural cinema concierge. Ask me for IMAX screenings in ${selectedCity || 'Mumbai'}, personalized movie picks, acoustic sweet spots, or booking status.`
    : `Hello! I'm CineAI, your personal cinema concierge. I can find IMAX shows, recommend movies tailored to your taste, locate acoustic sweet spot seats, or check today's offers. What would you like to explore?`;

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: initialGreeting,
      suggestions: ['Top Rated Movies', 'Hindi Action Movies', 'Show Today Offers', 'Recommend IMAX'],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (textToSend) => {
    const message = textToSend || inputMessage;
    if (!message.trim() || loading) return;

    // Add user message to state
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInputMessage('');
    setLoading(true);

    try {
      const sessionId = localStorage.getItem('cineai_session_id') || `sess_${Date.now()}`;
      localStorage.setItem('cineai_session_id', sessionId);

      const { data } = await aiService.sendChatMessage(message, sessionId, selectedCity);

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply || data.message,
            intent: data.intent,
            actionData: data.actionData || (data.movies?.length ? { type: 'MOVIE_LIST', movies: data.movies } : null),
            suggestions: data.suggestions || [],
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having a brief connection flutter with our cinema network. You can explore our featured movies or try again in a moment!",
          suggestions: ['Top Rated Movies', 'IMAX Specials', 'Action Movies'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Conversation reset! How can I assist your cinematic journey in ${selectedCity || 'Mumbai'}?`,
        suggestions: ['Trending Movies', 'Sci-Fi in IMAX', 'Offers & Coupons', 'Best Acoustic Seats'],
      },
    ]);
  };

  const handleCancelBookingConfirm = async (bookingId) => {
    setLoading(true);
    try {
      const { data } = await bookingService.cancelBooking(bookingId, 'Cancelled via CineAI Assistant');
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Booking cancelled successfully! ₹${data.refundAmount} has been refunded to your CineAI wallet balance.`,
            suggestions: ['Explore Movies', 'Check Wallet Balance'],
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Cancellation failed: ${err.response?.data?.message || 'Unable to cancel booking.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="cineai-assistant-trigger"
          title="Open CineAI Neural Assistant"
          aria-label="Open CineAI Assistant"
        >
          <div className="cineai-trigger-badge">AI</div>
          <Sparkles size={28} />
          <div className="cineai-trigger-label">Ask CineAI Concierge</div>
        </button>
      )}

      {/* Assistant Window */}
      {isOpen && (
        <div className="assistant-window" role="dialog" aria-modal="true" aria-label="CineAI Concierge">
          {/* Header */}
          <div className="assistant-header">
            <div className="assistant-title-group">
              <div className="assistant-avatar-badge">
                <Bot size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="assistant-status-dot" />
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                    CineAI Concierge
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '1px' }}>
                  Neural Cinema Core • {selectedCity || 'Mumbai'}
                </div>
              </div>
            </div>

            <div className="assistant-actions">
              <button
                type="button"
                onClick={handleResetChat}
                className="assistant-header-btn"
                title="Restart conversation"
                aria-label="Restart chat"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="assistant-header-btn"
                title="Close assistant"
                aria-label="Close assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="assistant-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`message-row ${m.role}`}>
                {m.role === 'assistant' && (
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #E11D48, #06B6D4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <Bot size={14} />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '85%' }}>
                  <div className={`message-bubble ${m.role === 'user' ? 'message-user' : 'message-assistant'}`}>
                    {m.content}
                  </div>

                  {/* Structured Action Data Cards */}
                  {m.actionData && (
                    <div className="ai-action-card">
                      {/* MOVIE LIST ACTION */}
                      {m.actionData.type === 'MOVIE_LIST' && m.actionData.movies?.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {m.actionData.movies.map((movie) => {
                            const movieTarget = movie.slug || movie._id || movie.id;
                            const genreDisplay = Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres;
                            return (
                              <div
                                key={movieTarget}
                                onClick={() => {
                                  navigate(`/movie/${movieTarget}`);
                                  setIsOpen(false);
                                }}
                                className="ai-movie-chip-card"
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                  {movie.poster && (
                                    <img
                                      src={movie.poster}
                                      alt={movie.title}
                                      className="ai-movie-thumb"
                                    />
                                  )}
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div
                                      style={{
                                        fontSize: '0.85rem',
                                        fontWeight: 800,
                                        color: '#FFFFFF',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {movie.title}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.72rem', color: '#94A3B8' }}>
                                      {movie.rating && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#F59E0B', fontWeight: 700 }}>
                                          <Star size={11} fill="#F59E0B" /> {movie.rating}
                                        </span>
                                      )}
                                      {movie.duration && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                          <Clock size={11} /> {movie.duration}m
                                        </span>
                                      )}
                                    </div>
                                    {genreDisplay && (
                                      <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {genreDisplay}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  style={{
                                    background: 'var(--cine-accent, #F1B24A)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px 10px',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.04em',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                  }}
                                >
                                  BOOK
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* SHOW LIST ACTION */}
                      {m.actionData.type === 'SHOW_LIST' && m.actionData.shows?.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {m.actionData.shows.map((show) => (
                            <div
                              key={show.id}
                              onClick={() => {
                                navigate(`/booking/${show.id}`);
                                setIsOpen(false);
                              }}
                              className="ai-movie-chip-card"
                            >
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>
                                  {show.movie}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                                  {show.theatre} • {show.startTime}
                                </div>
                              </div>
                              <button
                                type="button"
                                style={{
                                  background: '#E11D48',
                                  color: '#FFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '5px 12px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                SELECT
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* COUPON LIST ACTION */}
                      {m.actionData.type === 'COUPON_LIST' && m.actionData.coupons?.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {m.actionData.coupons.map((c) => (
                            <div
                              key={c.code}
                              style={{
                                background: 'rgba(241, 178, 74, 0.08)',
                                border: '1px dashed #F1B24A',
                                padding: '10px 8px',
                                borderRadius: '10px',
                                textAlign: 'center',
                              }}
                            >
                              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#F1B24A', letterSpacing: '0.05em' }}>
                                {c.code}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#FFFFFF', marginTop: '2px', fontWeight: 600 }}>
                                {c.discount}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SEAT GUIDANCE ACTION */}
                      {m.actionData.type === 'SEAT_GUIDANCE' && (
                        <div
                          style={{
                            background: 'rgba(6, 182, 212, 0.08)',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            padding: '12px 14px',
                            borderRadius: '12px',
                          }}
                        >
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#06B6D4', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Optimal Acoustics Zone
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                            {m.actionData.tip}
                          </div>
                        </div>
                      )}

                      {/* CONFIRM CANCELLATION */}
                      {m.actionData.type === 'CONFIRM_CANCELLATION' && (
                        <div
                          style={{
                            background: 'rgba(225, 29, 72, 0.1)',
                            border: '1px solid #E11D48',
                            padding: '14px',
                            borderRadius: '14px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E11D48', fontWeight: 800, fontSize: '0.82rem', marginBottom: '8px' }}>
                            <AlertTriangle size={16} /> Confirmation Required
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#E2E8F0', marginBottom: '12px' }}>
                            Cancel booking for <strong>{m.actionData.movieTitle}</strong> (₹{m.actionData.amount})?
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleCancelBookingConfirm(m.actionData.bookingId)}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                background: '#E11D48',
                                color: '#FFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Yes, Cancel & Refund
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMessages((prev) => [
                                  ...prev,
                                  { role: 'assistant', content: 'Your booking remains fully active and confirmed.' },
                                ]);
                              }}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: '#FFF',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Keep It
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      flexShrink: 0,
                      marginTop: '2px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User size={13} />}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="message-row assistant">
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #E11D48, #06B6D4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    flexShrink: 0,
                  }}
                >
                  <Bot size={14} />
                </div>
                <div className="assistant-typing">
                  <div className="assistant-typing-dot" />
                  <div className="assistant-typing-dot" />
                  <div className="assistant-typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions Bar */}
          {messages[messages.length - 1]?.suggestions?.length > 0 && !loading && (
            <div className="ai-suggestion-chips">
              {messages[messages.length - 1].suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(s)}
                  className="ai-chip"
                >
                  <Sparkles size={11} style={{ color: '#06B6D4' }} />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="assistant-input-area"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask for movies, IMAX, tickets, seats..."
              className="assistant-input"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="assistant-send-btn"
              title="Send message"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default CineAIAssistant;
