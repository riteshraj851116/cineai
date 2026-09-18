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
  Ticket,
  Film,
  Tag,
  AlertTriangle,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export const CineAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm CineAI, your personal cinema concierge. I can find IMAX shows, recommend movies tailored to your taste, find best seats, or check your booking status. What would you like to explore?",
      suggestions: ['Trending Movies', 'Hindi Action Movies', 'Show My Bookings', 'Today Offers'],
    },
  ]);

  const { user } = useAuth();
  const { selectedCity } = useCity();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

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
            content: data.reply,
            intent: data.intent,
            actionData: data.actionData,
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
          suggestions: ['Top Rated Movies', 'IMAX Specials'],
        },
      ]);
    } finally {
      setLoading(false);
    }
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
          title="Open CineAI Assistant"
        >
          <Sparkles size={28} />
        </button>
      )}

      {/* Assistant Window */}
      {isOpen && (
        <div className="assistant-window">
          {/* Header */}
          <div className="assistant-header">
            <div className="assistant-title-group">
              <div className="assistant-status-dot" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bot size={18} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>CineAI Concierge</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="assistant-messages">
            {messages.map((m, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className={`message-bubble ${m.role === 'user' ? 'message-user' : 'message-assistant'}`}>
                  {m.content}
                </div>

                {/* Structured Action Data Cards */}
                {m.actionData && (
                  <div className="ai-action-card">
                    {/* MOVIE LIST ACTION */}
                    {m.actionData.type === 'MOVIE_LIST' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {m.actionData.movies?.map((movie) => (
                          <div
                            key={movie.id}
                            onClick={() => {
                              navigate(`/movies/${movie.id}`);
                              setIsOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'var(--bg-surface-elevated)',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={movie.poster} alt={movie.title} style={{ width: '32px', height: '44px', objectFit: 'cover', borderRadius: '4px' }} />
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{movie.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⭐ {movie.rating} • {movie.genres}</div>
                              </div>
                            </div>
                            <ChevronRight size={16} style={{ color: 'var(--accent-cyan)' }} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SHOW LIST ACTION */}
                    {m.actionData.type === 'SHOW_LIST' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {m.actionData.shows?.map((show) => (
                          <div
                            key={show.id}
                            onClick={() => {
                              navigate(`/booking/${show.id}`);
                              setIsOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'var(--bg-surface-elevated)',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{show.movie}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{show.theatre} • {show.startTime} ({show.format})</div>
                            </div>
                            <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                              Book
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* COUPON LIST ACTION */}
                    {m.actionData.type === 'COUPON_LIST' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {m.actionData.coupons?.map((c) => (
                          <div
                            key={c.code}
                            style={{
                              background: 'var(--bg-surface-elevated)',
                              border: '1px dashed var(--accent-gold)',
                              padding: '8px',
                              borderRadius: 'var(--radius-sm)',
                              textAlign: 'center',
                            }}
                          >
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{c.code}</div>
                            <div style={{ fontSize: '0.75rem', color: '#fff' }}>{c.discount}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CONFIRM CANCELLATION SENSITIVE OPERATION */}
                    {m.actionData.type === 'CONFIRM_CANCELLATION' && (
                      <div style={{ background: 'rgba(255, 42, 95, 0.1)', border: '1px solid var(--accent-crimson)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-crimson)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                          <AlertTriangle size={16} /> Confirmation Required
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '12px' }}>
                          Cancel booking for <strong>{m.actionData.movieTitle}</strong> (₹{m.actionData.amount})?
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleCancelBookingConfirm(m.actionData.bookingId)}
                            className="btn btn-danger"
                            style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Yes, Cancel & Refund
                          </button>
                          <button
                            onClick={() => {
                              setMessages((prev) => [
                                ...prev,
                                { role: 'assistant', content: 'Great choice! Your booking remains active and confirmed.' },
                              ]);
                            }}
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Keep It
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions Bar */}
          {messages[messages.length - 1]?.suggestions?.length > 0 && (
            <div className="ai-suggestion-chips">
              {messages[messages.length - 1].suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="ai-chip"
                >
                  {s}
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
              placeholder="Ask for movies, IMAX shows, seats..."
              className="assistant-input"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="assistant-send-btn"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
