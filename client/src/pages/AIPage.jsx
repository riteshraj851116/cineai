import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Send,
  Film,
  Star,
  Clock,
  Compass,
  Zap,
  Sliders,
  Calendar,
  MapPin,
  ChevronRight,
  RefreshCw,
  Ticket,
  Bot,
  User,
  ShieldCheck,
  Flame,
  Volume2,
} from 'lucide-react';
import { CineCard } from '../components/ui/CineCard';
import { CineButton } from '../components/ui/CineButton';
import { CineBadge } from '../components/ui/CineBadge';
import { CineLoader } from '../components/ui/CineLoader';
import { CineMovieCard } from '../components/ui/CineMovieCard';
import { CineTabs } from '../components/ui/CineTabs';
import { CineEmptyState } from '../components/ui/CineEmptyState';
import { aiService } from '../services/aiService';
import { movieService } from '../services/movieService';
import { showService } from '../services/showService';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';

export const AIPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedCity } = useCity();
  const initialMode = searchParams.get('mode') || 'chat';

  const [activeTab, setActiveTab] = useState(initialMode === 'terminal' ? 'chat' : initialMode);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Conversational state
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: user
        ? `Greetings ${user.name.split(' ')[0]}! I am CineAI Concierge, your neural cinema companion. Ask me for screenings in ${selectedCity || 'Mumbai'}, sound sweet-spot seats, or tailor-made movie recommendations.`
        : `Greetings! I am CineAI Concierge. What type of cinematic experience are you searching for today? Try asking about IMAX screenings, 2-hour thrillers, or movies with high-octane scores.`,
      suggestions: ['Sci-Fi in IMAX tonight', 'Action movies with 8+ rating', 'Best acoustic seats in Audi 1', 'Current discount offers'],
    },
  ]);
  const chatBottomRef = useRef(null);

  // Matchmaker form state
  const [matchMood, setMatchMood] = useState('Thrill');
  const [matchGenre, setMatchGenre] = useState('Sci-Fi');
  const [matchDuration, setMatchDuration] = useState('Under 2.5h');
  const [matchLanguage, setMatchLanguage] = useState('All');
  const [matchIntensity, setMatchIntensity] = useState('High Voltage');
  const [matchAudience, setMatchAudience] = useState('Solo Cinema Buff');
  const [matchResults, setMatchResults] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);

  // Mood discovery
  const [selectedMood, setSelectedMood] = useState('Thrill');
  const [moodMovies, setMoodMovies] = useState([]);
  const [moodLoading, setMoodLoading] = useState(false);

  // Tonight mode
  const [tonightShows, setTonightShows] = useState([]);
  const [tonightLoading, setTonightLoading] = useState(false);

  const curatedPrompts = [
    'Find a sci-fi thriller for tonight',
    'Recommend movies similar to Dune or Interstellar',
    'Movies under 2 hours with 8+ rating',
    'Best IMAX 3D screenings in Mumbai',
    'Which seats provide optimal Dolby Atmos acoustics?',
    'Action films suitable for date night',
  ];

  const moodList = [
    { id: 'Relax', label: 'Relax & Unwind', genre: 'Animation', desc: 'Serene pacing, wholesome charm and zero friction.', icon: '🍃' },
    { id: 'Laugh', label: 'Pure Comedy', genre: 'Comedy', desc: 'Razor-sharp dialogue, high-energy wit, and instant joy.', icon: '😂' },
    { id: 'Think', label: 'Mind-Benders', genre: 'Mystery', desc: 'Intricate plots, intellectual riddles and unpredictable twists.', icon: '🧠' },
    { id: 'Thrill', label: 'Adrenaline Thrill', genre: 'Thriller', desc: 'Heart-pounding tension, claustrophobic suspense and edge-of-seat pacing.', icon: '⚡' },
    { id: 'Adventure', label: 'Epic Adventure', genre: 'Action', desc: 'Spectacular scale, sprawling vistas and kinetic choreography.', icon: '🌋' },
    { id: 'Emotional', label: 'Deep Drama', genre: 'Drama', desc: 'Profound resonance, empathetic characters and cathartic storytelling.', icon: '🎭' },
    { id: 'Family', label: 'Family Magic', genre: 'Adventure', desc: 'Cross-generational delight crafted for collective cinema joy.', icon: '🍿' },
    { id: 'Mystery', label: 'Noir & Crime', genre: 'Crime', desc: 'Noir atmospheric puzzles where every detail is a calculated clue.', icon: '🔍' },
  ];

  const scrollChatToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollChatToBottom();
    }
  }, [messages, loading, activeTab]);

  // Conversational AI execution
  const handleSendChat = async (inputPrompt) => {
    const text = (inputPrompt || query || '').trim();
    if (!text || loading) return;

    setQuery('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const sessionId = localStorage.getItem('cineai_session_id') || `sess_${Date.now()}`;
      localStorage.setItem('cineai_session_id', sessionId);

      const { data } = await aiService.askAIConcierge(text, sessionId, selectedCity);

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply || data.message,
            intent: data.intent,
            movies: data.movies || data.actionData?.movies || [],
            shows: data.shows || data.actionData?.shows || [],
            suggestions: data.suggestions || ['Book Now', 'Show All Movies', 'Explore IMAX'],
          },
        ]);
      } else {
        // Fallback search
        const searchRes = await aiService.searchMoviesNeural(text);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `I identified these matching titles from today's schedule for "${text}":`,
            movies: searchRes.data?.movies || [],
            suggestions: ['Book Tickets', 'Change Filters'],
          },
        ]);
      }
    } catch (err) {
      console.warn('AI Concierge fallback:', err.message);
      try {
        const fallback = await movieService.getMovies({ limit: 3 });
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Here are today's highest-rated selections while neural calibration finishes for "${text}":`,
            movies: fallback.data?.movies || [],
            suggestions: ['Explore All Movies', 'IMAX Screenings'],
          },
        ]);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: "I'm having a brief connection flutter. Please try again or browse our full catalogue.",
            suggestions: ['View All Movies'],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Movie matchmaker generator
  const handleGenerateMatch = async () => {
    setMatchLoading(true);
    try {
      const { data } = await movieService.getMovies({ genre: matchGenre !== 'All' ? matchGenre : undefined });
      const available = data.movies || [];
      setMatchResults(available.slice(0, 3));
    } catch (err) {
      console.error('Matchmaker error:', err);
    } finally {
      setMatchLoading(false);
    }
  };

  // Mood discovery selector
  const handleSelectMood = async (mood) => {
    setSelectedMood(mood.id);
    setMoodLoading(true);
    try {
      const { data } = await movieService.getMovies({ genre: mood.genre });
      setMoodMovies(data.movies || []);
    } catch (err) {
      console.error('Mood discovery error:', err);
    } finally {
      setMoodLoading(false);
    }
  };

  // Tonight mode loader
  const loadTonightPicks = async () => {
    setTonightLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const { data } = await showService.getShows({ date: todayStr });
      setTonightShows(data.shows || []);
    } catch (err) {
      console.error('Tonight shows error:', err);
    } finally {
      setTonightLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mood' && moodMovies.length === 0) {
      handleSelectMood(moodList[3]); // Thrill by default
    } else if (activeTab === 'tonight' && tonightShows.length === 0) {
      loadTonightPicks();
    }
  }, [activeTab]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cine-bg)', color: 'var(--cine-text)', paddingTop: '90px', paddingBottom: '100px' }}>
      <div className="cine-page-container">
        {/* Header Hero */}
        <div style={{ maxWidth: '840px', margin: '0 auto 36px auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
              border: '1px solid rgba(225, 29, 72, 0.3)',
              color: '#F43F5E',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '18px',
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span>NEURAL CINEMA CONCIERGE • ACTIVE</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0, color: '#FFFFFF' }}>
            CINEAI INTELLIGENCE
          </h1>

          <p style={{ fontSize: '1.08rem', color: 'var(--cine-muted)', marginTop: '14px', lineHeight: 1.6 }}>
            Ask natural cinema questions, explore acoustic sweet spots, discover mood frequencies, or find live tonight screenings.
          </p>

          {/* Mode Switcher */}
          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center' }}>
            <CineTabs
              tabs={[
                { id: 'chat', label: 'AI Concierge (Chat)' },
                { id: 'matchmaker', label: 'AI Matchmaker' },
                { id: 'mood', label: 'Mood Frequency' },
                { id: 'tonight', label: 'Tonight Radar' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </div>

        {/* ===================================================================
            TAB 1: AI CONCIERGE CHAT INTERFACE
            =================================================================== */}
        {activeTab === 'chat' && (
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div
              style={{
                background: 'rgba(15, 17, 23, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 24px 60px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(225, 29, 72, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                height: '680px',
              }}
            >
              {/* Chat Header */}
              <div
                style={{
                  padding: '16px 24px',
                  background: 'linear-gradient(180deg, rgba(28, 31, 41, 0.95) 0%, rgba(18, 20, 28, 0.9) 100%)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #E11D48, #06B6D4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      boxShadow: '0 4px 14px rgba(225, 29, 72, 0.4)',
                    }}
                  >
                    <Bot size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FFF', letterSpacing: '-0.01em' }}>
                      CineAI Neural Concierge
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                      Online • Real-Time Cinema Engine ({selectedCity || 'Mumbai'})
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMessages([
                      {
                        role: 'assistant',
                        content: `Conversation restarted. How can I guide your cinema experience in ${selectedCity || 'Mumbai'}?`,
                        suggestions: ['Trending Movies', 'IMAX Screenings', 'Hindi Thrillers', 'Offers & Deals'],
                      },
                    ])
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94A3B8',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFF';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94A3B8';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Restart</span>
                </button>
              </div>

              {/* Chat Stream */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {msg.role === 'assistant' && (
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #E11D48, #06B6D4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFF',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <Bot size={16} />
                      </div>
                    )}

                    <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div
                        style={{
                          padding: '14px 18px',
                          borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background:
                            msg.role === 'user'
                              ? 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)'
                              : 'rgba(28, 31, 41, 0.95)',
                          color: '#FFFFFF',
                          fontSize: '0.94rem',
                          lineHeight: 1.55,
                          border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        {msg.content}
                      </div>

                      {/* Embedded Interactive Movie Recommendations */}
                      {msg.movies && msg.movies.length > 0 && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '12px',
                            marginTop: '4px',
                          }}
                        >
                          {msg.movies.map((movie) => {
                            const movieTarget = movie.slug || movie._id || movie.id;
                            return (
                              <div
                                key={movieTarget}
                                onClick={() => navigate(`/movie/${movieTarget}`)}
                                style={{
                                  background: 'rgba(22, 25, 34, 0.95)',
                                  border: '1px solid rgba(255, 255, 255, 0.12)',
                                  borderRadius: '14px',
                                  padding: '12px',
                                  display: 'flex',
                                  gap: '12px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = 'rgba(225, 29, 72, 0.6)';
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(225, 29, 72, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                                  e.currentTarget.style.transform = 'none';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                {movie.poster && (
                                  <img
                                    src={movie.poster}
                                    alt={movie.title}
                                    style={{ width: '48px', height: '68px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                                  />
                                )}
                                <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {movie.title}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.74rem', color: '#94A3B8' }}>
                                    {movie.rating && (
                                      <span style={{ color: '#F59E0B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <Star size={11} fill="#F59E0B" /> {movie.rating}
                                      </span>
                                    )}
                                    {movie.duration && <span>{movie.duration}m</span>}
                                  </div>
                                  <div style={{ marginTop: '6px' }}>
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        fontWeight: 800,
                                        color: '#06B6D4',
                                        letterSpacing: '0.04em',
                                      }}
                                    >
                                      VIEW SHOWS →
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFF',
                          flexShrink: 0,
                          marginTop: '2px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}
                      >
                        {user?.name ? user.name.charAt(0).toUpperCase() : <User size={15} />}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading typing indicator */}
                {loading && (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #E11D48, #06B6D4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                      }}
                    >
                      <Bot size={16} />
                    </div>
                    <div
                      style={{
                        padding: '12px 20px',
                        borderRadius: '18px 18px 18px 4px',
                        background: 'rgba(28, 31, 41, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#94A3B8',
                        fontSize: '0.84rem',
                      }}
                    >
                      <div className="assistant-typing" style={{ padding: 0, background: 'none', border: 'none' }}>
                        <div className="assistant-typing-dot" />
                        <div className="assistant-typing-dot" />
                        <div className="assistant-typing-dot" />
                      </div>
                      <span>CineAI is scanning screenings & acoustic algorithms...</span>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Suggestions Pills */}
              {messages[messages.length - 1]?.suggestions?.length > 0 && !loading && (
                <div
                  style={{
                    padding: '10px 24px',
                    background: 'rgba(18, 20, 28, 0.7)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>
                    SUGGESTIONS:
                  </span>
                  {messages[messages.length - 1].suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendChat(s)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#E2E8F0',
                        padding: '6px 14px',
                        borderRadius: '16px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(225, 29, 72, 0.2)';
                        e.currentTarget.style.borderColor = '#E11D48';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                        e.currentTarget.style.color = '#E2E8F0';
                      }}
                    >
                      <Sparkles size={12} color="#06B6D4" />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                style={{
                  padding: '16px 24px',
                  background: 'rgba(15, 17, 23, 0.98)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                }}
              >
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search
                    size={18}
                    color="#64748B"
                    style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask CineAI Concierge (e.g. 'Find an IMAX screening with Dolby Atmos tonight')..."
                    style={{
                      width: '100%',
                      height: '50px',
                      background: 'rgba(28, 31, 41, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: '25px',
                      paddingLeft: '48px',
                      paddingRight: '16px',
                      color: '#FFFFFF',
                      fontSize: '0.94rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  style={{
                    height: '50px',
                    padding: '0 24px',
                    borderRadius: '25px',
                    background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    letterSpacing: '0.04em',
                    cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                    opacity: loading || !query.trim() ? 0.45 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(225, 29, 72, 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Send size={16} />
                  <span>ASK AI</span>
                </button>
              </form>
            </div>

            {/* Curated Prompt Bubbles */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                POPULAR PROMPTS:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                {curatedPrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setQuery(p);
                      handleSendChat(p);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      color: '#94A3B8',
                      padding: '7px 16px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(225, 29, 72, 0.5)';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                      e.currentTarget.style.color = '#94A3B8';
                    }}
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: AI MOVIE MATCHMAKER
            =================================================================== */}
        {activeTab === 'matchmaker' && (
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <CineCard style={{ padding: '36px', marginBottom: '32px' }}>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--cine-accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  PARAMETRIC CURATION MATRIX
                </span>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 900, margin: '6px 0 0 0', color: '#FFF' }}>
                  Fine-Tune Your Viewing Profile
                </h2>
                <p style={{ color: 'var(--cine-muted)', fontSize: '0.92rem', margin: '6px 0 0 0' }}>
                  Select your exact emotional and sensory criteria to generate tailor-made screening picks.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px', color: 'var(--cine-muted)' }}>PRIMARY MOOD</label>
                  <select
                    value={matchMood}
                    onChange={(e) => setMatchMood(e.target.value)}
                    style={{ width: '100%', height: '46px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: '#FFF', padding: '0 12px' }}
                  >
                    <option value="Thrill">Thrill & Adrenaline</option>
                    <option value="Laugh">Lighthearted Comedy</option>
                    <option value="Think">Deep Philosophical</option>
                    <option value="Emotional">Cathartic Drama</option>
                    <option value="Relax">Zero Stress Chill</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px', color: 'var(--cine-muted)' }}>GENRE ANCHOR</label>
                  <select
                    value={matchGenre}
                    onChange={(e) => setMatchGenre(e.target.value)}
                    style={{ width: '100%', height: '46px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: '#FFF', padding: '0 12px' }}
                  >
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Action">Action</option>
                    <option value="Drama">Drama</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Comedy">Comedy</option>
                    <option value="All">Any Genre</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px', color: 'var(--cine-muted)' }}>MAX RUNTIME</label>
                  <select
                    value={matchDuration}
                    onChange={(e) => setMatchDuration(e.target.value)}
                    style={{ width: '100%', height: '46px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: '#FFF', padding: '0 12px' }}
                  >
                    <option value="Under 2h">Under 2 Hours</option>
                    <option value="Under 2.5h">Under 2.5 Hours</option>
                    <option value="Epic (2.5h+)">Epic (2.5+ Hours)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px', color: 'var(--cine-muted)' }}>ENERGY INTENSITY</label>
                  <select
                    value={matchIntensity}
                    onChange={(e) => setMatchIntensity(e.target.value)}
                    style={{ width: '100%', height: '46px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: '#FFF', padding: '0 12px' }}
                  >
                    <option value="High Voltage">High Voltage & Explosive</option>
                    <option value="Slow Burn">Slow Burn & Atmospheric</option>
                    <option value="Medium">Balanced & Engaging</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px', color: 'var(--cine-muted)' }}>AUDIENCE TYPE</label>
                  <select
                    value={matchAudience}
                    onChange={(e) => setMatchAudience(e.target.value)}
                    style={{ width: '100%', height: '46px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: '#FFF', padding: '0 12px' }}
                  >
                    <option value="Solo Cinema Buff">Solo Film Aficionado</option>
                    <option value="Date Night">Date Night / Duo</option>
                    <option value="Group of Friends">Group of Friends</option>
                    <option value="Family">Family Screening</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px', color: 'var(--cine-muted)' }}>LANGUAGE</label>
                  <select
                    value={matchLanguage}
                    onChange={(e) => setMatchLanguage(e.target.value)}
                    style={{ width: '100%', height: '46px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: '#FFF', padding: '0 12px' }}
                  >
                    <option value="All">All Languages</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </div>
              </div>

              <CineButton
                variant="primary"
                onClick={handleGenerateMatch}
                disabled={matchLoading}
                style={{ width: '100%', height: '52px', fontSize: '0.95rem', fontWeight: 800 }}
              >
                <Zap size={18} />
                <span>{matchLoading ? 'CALCULATING NEURAL MATRIX...' : 'GENERATE MATCH RECOMMENDATIONS'}</span>
              </CineButton>
            </CineCard>

            {matchResults.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '18px', color: '#FFF' }}>
                  Best Matches for Your Profile ({matchResults.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '22px' }}>
                  {matchResults.map((m) => (
                    <CineMovieCard key={m._id} movie={m} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 3: MOOD FREQUENCY
            =================================================================== */}
        {activeTab === 'mood' && (
          <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: '#FFF' }}>
                WHAT ARE YOU IN THE MOOD FOR?
              </h2>
              <p style={{ color: 'var(--cine-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
                Select an emotional frequency below to filter verified theatrical screenings.
              </p>
            </div>

            {/* Mood Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '16px', marginBottom: '40px' }}>
              {moodList.map((m) => {
                const isSelected = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMood(m)}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, rgba(225, 29, 72, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)' : 'var(--cine-surface)',
                      color: isSelected ? '#FFFFFF' : 'var(--cine-text)',
                      border: `1px solid ${isSelected ? '#E11D48' : 'var(--cine-border)'}`,
                      borderRadius: '16px',
                      padding: '20px 18px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 8px 24px rgba(225, 29, 72, 0.25)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.85, textTransform: 'uppercase', fontWeight: 800, color: 'var(--cine-accent)' }}>
                        {m.genre}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFF', marginBottom: '4px' }}>
                      {m.label}
                    </div>
                    <p style={{ fontSize: '0.8rem', margin: 0, opacity: 0.75, lineHeight: 1.45 }}>
                      {m.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Mood Movies Grid */}
            {moodLoading ? (
              <CineLoader text="Calibrating cinema mood index..." />
            ) : moodMovies.length > 0 ? (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px', color: '#FFF' }}>
                  Films Matching "{selectedMood}" ({moodMovies.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '22px' }}>
                  {moodMovies.map((m) => (
                    <CineMovieCard key={m._id} movie={m} />
                  ))}
                </div>
              </div>
            ) : (
              <CineEmptyState
                icon={Film}
                title="No Screenings Under This Mood"
                description="Try exploring another emotional frequency or ask CineAI in natural language."
              />
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 4: TONIGHT RADAR
            =================================================================== */}
        {activeTab === 'tonight' && (
          <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--cine-accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  IMMEDIATE DISCOVERY
                </span>
                <h2 style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '6px 0 0 0', color: '#FFF' }}>
                  AVAILABLE TONIGHT IN {selectedCity?.toUpperCase() || 'MUMBAI'}
                </h2>
                <p style={{ color: 'var(--cine-muted)', fontSize: '0.94rem', margin: '4px 0 0 0' }}>
                  Live screenings with real-time seat availability for the remainder of today.
                </p>
              </div>

              <CineButton variant="outline" size="sm" onClick={loadTonightPicks}>
                <RefreshCw size={14} />
                <span>REFRESH SCHEDULES</span>
              </CineButton>
            </div>

            {tonightLoading ? (
              <CineLoader text="Locating tonight's active auditoriums..." />
            ) : tonightShows.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {tonightShows.map((show) => (
                  <CineCard
                    key={show._id}
                    style={{
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flex: 1, minWidth: '260px' }}>
                      {show.movie?.poster && (
                        <img
                          src={show.movie.poster}
                          alt={show.movie.title}
                          style={{ width: '48px', height: '68px', objectFit: 'cover', borderRadius: 'var(--cine-radius-sm)' }}
                        />
                      )}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>
                            {show.movie?.title || 'Screening'}
                          </span>
                          <CineBadge variant="outline">{show.format || '2D'}</CineBadge>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem', color: 'var(--cine-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} color="var(--cine-accent)" /> {show.theatre?.name || 'Multiplex'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} /> {show.startTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF', fontFamily: 'var(--cine-font-mono)' }}>
                          ₹{show.pricing?.STANDARD || 250}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 800 }}>
                          SEATS AVAILABLE
                        </div>
                      </div>
                      <CineButton
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/booking/${show._id}`)}
                      >
                        <Ticket size={14} />
                        <span>BOOK SEATS</span>
                      </CineButton>
                    </div>
                  </CineCard>
                ))}
              </div>
            ) : (
              <CineEmptyState
                icon={Calendar}
                title="No Shows Remaining Tonight"
                description="All showings for tonight have concluded or are sold out. Check upcoming shows for tomorrow."
                actionLabel="Explore Movies"
                onAction={() => navigate('/movies')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPage;
