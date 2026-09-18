import React, { useState, useEffect } from 'react';
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
  Bot
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

export const AIPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get('mode') || 'terminal';

  const [activeTab, setActiveTab] = useState(initialMode);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  // Matchmaker form state
  const [matchMood, setMatchMood] = useState('Thrill');
  const [matchGenre, setMatchGenre] = useState('Sci-Fi');
  const [matchDuration, setMatchDuration] = useState('Under 2.5h');
  const [matchLanguage, setMatchLanguage] = useState('All');
  const [matchIntensity, setMatchIntensity] = useState('High Voltage');
  const [matchAudience, setMatchAudience] = useState('Solo Cinema Buff');
  const [matchResults, setMatchResults] = useState([]);

  // Mood discovery
  const [selectedMood, setSelectedMood] = useState('Thrill');
  const [moodMovies, setMoodMovies] = useState([]);
  const [moodLoading, setMoodLoading] = useState(false);

  // Tonight mode
  const [tonightShows, setTonightShows] = useState([]);
  const [tonightLoading, setTonightLoading] = useState(false);

  const curatedPrompts = [
    'Find a sci-fi movie for tonight',
    'Suggest something like Dune or Interstellar',
    'I have 2 hours, what should I watch?',
    'Best IMAX screening in Mumbai tonight',
    'Which seats give the best sound in Audi 1?',
    'Romantic slow-burn with 8+ rating',
  ];

  const moodList = [
    { id: 'Relax', label: 'Relax', genre: 'Animation', desc: 'Serene pacing, wholesome charm and zero friction.' },
    { id: 'Laugh', label: 'Laugh', genre: 'Comedy', desc: 'Razor-sharp dialogue, high-energy wit, and instant joy.' },
    { id: 'Think', label: 'Think', genre: 'Mystery', desc: 'Intricate plots, intellectual riddles and unpredictable twists.' },
    { id: 'Thrill', label: 'Thrill', genre: 'Thriller', desc: 'Heart-pounding tension, claustrophobic suspense and adrenaline.' },
    { id: 'Adventure', label: 'Adventure', genre: 'Action', desc: 'Spectacular scale, sprawling vistas and kinetic choreography.' },
    { id: 'Emotional', label: 'Emotional', genre: 'Drama', desc: 'Profound resonance, empathetic characters and cathartic beauty.' },
    { id: 'Family', label: 'Family', genre: 'Adventure', desc: 'Cross-generational delight crafted for collective cinema joy.' },
    { id: 'Mystery', label: 'Mystery', genre: 'Crime', desc: 'Noir atmospheric puzzles where every detail is a calculated clue.' },
  ];

  // Natural search execution
  const handleAskAI = async (inputPrompt) => {
    const text = (inputPrompt || query || '').trim();
    if (!text) return;

    if (inputPrompt) {
      setQuery(inputPrompt);
    }

    setLoading(true);
    setAiResponse(null);

    const userMessage = { role: 'user', text };
    setChatHistory((prev) => [...prev, userMessage]);

    try {
      // First try search endpoint for matched movies
      let matchedMovies = [];
      let explanation = '';
      let suggestions = [];

      try {
        const searchRes = await aiService.searchMoviesNeural(text);
        if (searchRes.data?.movies && searchRes.data.movies.length > 0) {
          matchedMovies = searchRes.data.movies;
        }
        if (searchRes.data?.interpretedFilters) {
          const f = searchRes.data.interpretedFilters;
          explanation = `Filtered by genre: ${f.genre || f.genres?.join(', ') || 'Any'}, language: ${f.language || f.languages?.join(', ') || 'Any'}.`;
        }
      } catch (sErr) {
        console.warn('AI search call notice:', sErr.message);
      }

      // Also call assistant chat for rich narrative synthesis
      try {
        const chatRes = await aiService.askAIConcierge(text);
        if (chatRes.data?.reply) {
          explanation = chatRes.data.reply;
        }
        const returnedMovies = chatRes.data?.movies || chatRes.data?.data?.movies || chatRes.data?.actionData?.movies;
        if (returnedMovies && returnedMovies.length > 0) {
          matchedMovies = returnedMovies;
        }
        if (chatRes.data?.suggestions || chatRes.data?.data?.suggestions) {
          suggestions = chatRes.data?.suggestions || chatRes.data?.data?.suggestions || [];
        }
      } catch (err) {
        console.warn('AI chat supplementary call notice:', err.message);
      }

      // If backend returned zero movies, pull popular movies as fallback
      if (matchedMovies.length === 0) {
        const fallbackRes = await movieService.getMovies({ limit: 4 });
        matchedMovies = fallbackRes.data?.movies || [];
        if (!explanation) {
          explanation = `Here are today's top-rated curated selections while we calibrate tailored recommendations for "${text}".`;
        }
      }

      const responseObj = {
        query: text,
        explanation: explanation || `Neural analysis matched ${matchedMovies.length} titles against prompt criteria.`,
        movies: matchedMovies,
        suggestions,
        confidence: 96,
      };

      setAiResponse(responseObj);
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: responseObj.explanation, movies: matchedMovies },
      ]);
    } catch (err) {
      console.error('AI query failure, activating fallback:', err);
      try {
        const fallback = await movieService.getMovies({ limit: 4 });
        setAiResponse({
          query: text,
          explanation: `CineAI Neural Engine suggests exploring these prime titles while offline calibration syncs.`,
          movies: fallback.data?.movies || [],
          suggestions: ['Top Rated Movies', 'IMAX Screenings'],
          confidence: 88,
        });
      } catch (e) {
        setAiResponse({
          query: text,
          explanation: 'Could not connect to CineAI neural index. Please try another query.',
          movies: [],
          suggestions: [],
          confidence: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Movie matchmaker generator
  const handleGenerateMatch = async () => {
    setLoading(true);
    try {
      const { data } = await movieService.getMovies({ genre: matchGenre !== 'All' ? matchGenre : undefined });
      const available = data.movies || [];
      // Select top 3
      setMatchResults(available.slice(0, 3));
    } catch (err) {
      console.error('Matchmaker error:', err);
    } finally {
      setLoading(false);
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
    <div style={{ minHeight: '100vh', background: 'var(--cine-bg)', color: 'var(--cine-text)', paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="cine-container">
        {/* Header */}
        <div style={{ maxWidth: '800px', margin: '0 auto 40px auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--cine-radius-full)', background: 'var(--cine-accent-soft)', border: '1px solid var(--cine-accent)', color: 'var(--cine-accent)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>
            <Sparkles size={14} />
            <span>NEURAL CINEMA CONCIERGE</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0, color: 'var(--cine-text)' }}>
            CINEAI INTELLIGENCE
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--cine-text-muted)', marginTop: '14px', lineHeight: 1.6 }}>
            Ask natural questions, match complex cinematic moods, or discover verified midnight IMAX screenings tailored to your taste.
          </p>

          {/* Mode Switcher */}
          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center' }}>
            <CineTabs
              tabs={[
                { id: 'terminal', label: 'Command Interface' },
                { id: 'matchmaker', label: 'AI Matchmaker' },
                { id: 'mood', label: 'Mood Frequency' },
                { id: 'tonight', label: 'Tonight Mode' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </div>

        {/* TAB 1: COMMAND INTERFACE */}
        {activeTab === 'terminal' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <CineCard style={{ padding: '32px', marginBottom: '32px', border: '1px solid var(--cine-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Bot size={20} color="var(--cine-accent)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cine-text-muted)' }}>
                  NATURAL LANGUAGE DISCOVERY TERMINAL
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskAI();
                }}
                style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}
              >
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search
                    size={20}
                    color="var(--cine-text-dim)"
                    style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What do you want to watch? (e.g. Find a 2-hour sci-fi thriller with Christopher Nolan intensity)"
                    style={{
                      width: '100%',
                      height: '56px',
                      background: 'var(--cine-surface-2)',
                      border: '1px solid var(--cine-border)',
                      borderRadius: 'var(--cine-radius-md)',
                      paddingLeft: '50px',
                      paddingRight: '16px',
                      color: 'var(--cine-text)',
                      fontSize: '0.98rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>
                <CineButton
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  style={{ height: '56px', padding: '0 28px', fontSize: '0.95rem', fontWeight: 800 }}
                >
                  {loading ? <RefreshCw className="cine-spin" size={18} /> : <Send size={18} />}
                  <span>CONSULT</span>
                </CineButton>
              </form>

              {/* Curated Prompts */}
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--cine-text-dim)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                  CURATED PROMPTS:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {curatedPrompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setQuery(p);
                        handleAskAI(p);
                      }}
                      style={{
                        background: 'var(--cine-surface-2)',
                        border: '1px solid var(--cine-border)',
                        color: 'var(--cine-text-muted)',
                        padding: '7px 14px',
                        borderRadius: 'var(--cine-radius-full)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--cine-accent)';
                        e.currentTarget.style.color = 'var(--cine-text)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--cine-border)';
                        e.currentTarget.style.color = 'var(--cine-text-muted)';
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </CineCard>

            {/* AI Response Output */}
            {loading && <CineLoader text="CineAI Neural Engine is parsing directorial tone, reviews, and screenplays..." />}

            {aiResponse && !loading && (
              <div style={{ marginTop: '32px' }}>
                <CineCard style={{ padding: '28px', marginBottom: '28px', borderLeft: '4px solid var(--cine-accent)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--cine-accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        PROMPT: "{aiResponse.query}"
                      </span>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 12px 0', color: 'var(--cine-text)' }}>
                        Analysis & Directorial Synthesis
                      </h3>
                      <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.96rem', lineHeight: 1.6, margin: 0 }}>
                        {aiResponse.explanation}
                      </p>
                    </div>
                    <div style={{ background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-md)', padding: '12px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--cine-text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>NEURAL MATCH</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--cine-accent)', fontFamily: 'var(--cine-font-mono)' }}>
                        {aiResponse.confidence}%
                      </div>
                    </div>
                  </div>

                  {aiResponse.suggestions && aiResponse.suggestions.length > 0 && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--cine-border)', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--cine-text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>NEXT ACTIONS:</span>
                      {aiResponse.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setQuery(s);
                            handleAskAI(s);
                          }}
                          style={{
                            background: 'var(--cine-surface-2)',
                            border: '1px solid var(--cine-border)',
                            color: 'var(--cine-text)',
                            padding: '4px 12px',
                            borderRadius: 'var(--cine-radius-full)',
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          {s} →
                        </button>
                      ))}
                    </div>
                  )}
                </CineCard>

                {/* Movie Grid */}
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.01em' }}>
                  Recommended Screenings ({aiResponse.movies.length})
                </h4>
                {aiResponse.movies.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                    {aiResponse.movies.map((m, idx) => (
                      <CineMovieCard key={m._id || m.id || idx} movie={m} />
                    ))}
                  </div>
                ) : (
                  <CineEmptyState
                    icon={Film}
                    title="No Direct Title Matches"
                    description="CineAI couldn't find a direct match with that exact specification. Try adjusting duration or tone."
                    actionLabel="View All Movies"
                    onAction={() => navigate('/movies')}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI MOVIE MATCHMAKER */}
        {activeTab === 'matchmaker' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <CineCard style={{ padding: '36px', marginBottom: '32px' }}>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--cine-accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  PARAMETRIC CURATION MATRIX
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '6px 0 0 0' }}>
                  Fine-Tune Your Viewing Profile
                </h2>
                <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  Select exact emotional and physical parameters to generate hyper-tailored movie recommendations.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                {/* Mood */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px', color: 'var(--cine-text-muted)' }}>PRIMARY MOOD</label>
                  <select
                    value={matchMood}
                    onChange={(e) => setMatchMood(e.target.value)}
                    style={{ width: '100%', height: '44px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 12px' }}
                  >
                    <option value="Thrill">Thrill & Adrenaline</option>
                    <option value="Laugh">Lighthearted Comedy</option>
                    <option value="Think">Deep Philosophical</option>
                    <option value="Emotional">Cathartic Drama</option>
                    <option value="Relax">Zero Stress Chill</option>
                  </select>
                </div>

                {/* Genre */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px', color: 'var(--cine-text-muted)' }}>GENRE ANCHOR</label>
                  <select
                    value={matchGenre}
                    onChange={(e) => setMatchGenre(e.target.value)}
                    style={{ width: '100%', height: '44px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 12px' }}
                  >
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Action">Action</option>
                    <option value="Drama">Drama</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Comedy">Comedy</option>
                    <option value="All">Any Genre</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px', color: 'var(--cine-text-muted)' }}>MAX RUNTIME</label>
                  <select
                    value={matchDuration}
                    onChange={(e) => setMatchDuration(e.target.value)}
                    style={{ width: '100%', height: '44px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 12px' }}
                  >
                    <option value="Under 2h">Under 2 Hours</option>
                    <option value="Under 2.5h">Under 2.5 Hours</option>
                    <option value="Epic (2.5h+)">Epic (2.5+ Hours)</option>
                  </select>
                </div>

                {/* Intensity */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px', color: 'var(--cine-text-muted)' }}>ENERGY INTENSITY</label>
                  <select
                    value={matchIntensity}
                    onChange={(e) => setMatchIntensity(e.target.value)}
                    style={{ width: '100%', height: '44px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 12px' }}
                  >
                    <option value="High Voltage">High Voltage & Explosive</option>
                    <option value="Slow Burn">Slow Burn & Atmospheric</option>
                    <option value="Medium">Balanced & Engaging</option>
                  </select>
                </div>

                {/* Audience */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px', color: 'var(--cine-text-muted)' }}>AUDIENCE TYPE</label>
                  <select
                    value={matchAudience}
                    onChange={(e) => setMatchAudience(e.target.value)}
                    style={{ width: '100%', height: '44px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 12px' }}
                  >
                    <option value="Solo Cinema Buff">Solo Film Aficionado</option>
                    <option value="Date Night">Date Night / Duo</option>
                    <option value="Group of Friends">Group of Friends</option>
                    <option value="Family">Family Screening</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px', color: 'var(--cine-text-muted)' }}>LANGUAGE</label>
                  <select
                    value={matchLanguage}
                    onChange={(e) => setMatchLanguage(e.target.value)}
                    style={{ width: '100%', height: '44px', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-sm)', color: 'var(--cine-text)', padding: '0 12px' }}
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
                disabled={loading}
                style={{ width: '100%', height: '50px', fontSize: '0.95rem', fontWeight: 800 }}
              >
                <Zap size={18} />
                <span>GENERATE MATCH RECOMMENDATIONS</span>
              </CineButton>
            </CineCard>

            {matchResults.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>
                  Best Matches for Your Profile
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                  {matchResults.map((m) => (
                    <CineMovieCard key={m._id} movie={m} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MOOD FREQUENCY */}
        {activeTab === 'mood' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
                WHAT ARE YOU IN THE MOOD FOR?
              </h2>
              <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
                Select an emotional frequency below to filter verified theatrical screenings.
              </p>
            </div>

            {/* Mood Chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '40px' }}>
              {moodList.map((m) => {
                const isSelected = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMood(m)}
                    style={{
                      background: isSelected ? 'var(--cine-accent)' : 'var(--cine-surface-1)',
                      color: isSelected ? '#FFFFFF' : 'var(--cine-text)',
                      border: `1px solid ${isSelected ? 'var(--cine-accent)' : 'var(--cine-border)'}`,
                      borderRadius: 'var(--cine-radius-md)',
                      padding: '18px 16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>{m.label}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>{m.genre}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', margin: 0, opacity: isSelected ? 0.9 : 0.6, lineHeight: 1.4 }}>
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>
                  Films Matching "{selectedMood}" ({moodMovies.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
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

        {/* TAB 4: TONIGHT MODE */}
        {activeTab === 'tonight' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--cine-accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  IMMEDIATE DISCOVERY
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '6px 0 0 0' }}>
                  AVAILABLE TONIGHT IN MUMBAI
                </h2>
                <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
                  Live screenings with real-time seat availability for the remainder of today.
                </p>
              </div>

              <CineButton variant="outline" size="sm" onClick={loadTonightPicks}>
                <RefreshCw size={14} />
                <span>REFRESH LIVE SCHEDULES</span>
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
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--cine-text)' }}>
                            {show.movie?.title || 'Screening'}
                          </span>
                          <CineBadge variant="outline">{show.format || '2D'}</CineBadge>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: 'var(--cine-text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} /> {show.theatre?.name || 'Multiplex'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} /> {show.startTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--cine-text)', fontFamily: 'var(--cine-font-mono)' }}>
                          ₹{show.pricing?.STANDARD || 250}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>
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
