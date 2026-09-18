import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewService } from '../services/reviewService';
import { movieService } from '../services/movieService';
import { useAuth } from '../context/AuthContext';
import { CineCard } from '../components/ui/CineCard';
import { CineButton } from '../components/ui/CineButton';
import { CineBadge } from '../components/ui/CineBadge';
import { CineLoader } from '../components/ui/CineLoader';
import { CineEmptyState } from '../components/ui/CineEmptyState';
import {
  MessageSquare,
  Heart,
  Star,
  Film,
  Sparkles,
  Send,
  User,
  ShieldCheck,
  TrendingUp,
  Share2,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const Community = () => {
  const [reviews, setReviews] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCommunityData = async () => {
    setLoading(true);
    try {
      const [reviewsRes, moviesRes] = await Promise.all([
        reviewService.getCommunityFeed(),
        movieService.getMovies(),
      ]);

      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.reviews || []);
      }
      if (moviesRes.data.success) {
        setMovies(moviesRes.data.movies || []);
        if (moviesRes.data.movies?.[0]) {
          setSelectedMovie(moviesRes.data.movies[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load community feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to publish a discussion.');
      return;
    }
    if (!comment.trim()) return;

    setPosting(true);
    setPostSuccess('');

    try {
      const { data } = await reviewService.submitReview({
        movieId: selectedMovie,
        rating: Number(rating),
        comment,
      });

      if (data.success) {
        setPostSuccess('Discussion published! Earned +25 CinePoints.');
        setComment('');
        await fetchCommunityData();
        setTimeout(() => setPostSuccess(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit discussion');
    } finally {
      setPosting(false);
    }
  };

  const handleLikeDiscussion = async (reviewId) => {
    if (!user) {
      alert('Please log in to applaud this discussion.');
      return;
    }

    try {
      const { data } = await reviewService.likeReview(reviewId);
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId ? { ...r, likes: new Array(data.likesCount || (r.likes?.length || 0) + 1).fill('user') } : r
          )
        );
      }
    } catch (err) {
      console.error('Like action failed:', err);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'TOP') return (r.rating || 0) >= 4;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cine-bg)', color: 'var(--cine-text)', paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="cine-container">
        {/* Masthead */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--cine-accent)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
            <MessageSquare size={14} />
            <span>PATRON FORUM & DISCUSSIONS</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            CINEMA COMMUNITY
          </h1>
          <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.98rem', marginTop: '8px', maxWidth: '640px' }}>
            Unfiltered critiques, screenplay breakdowns, and acoustic appraisals from verified audience members.
          </p>
        </div>

        {/* Main Grid: Publisher & Trending (Left) / Feed (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
          {/* LEFT COLUMN: Post Discussion & Trending Stats */}
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Publisher Card */}
            <CineCard style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sparkles size={18} color="var(--cine-accent)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Publish a Discussion</h3>
              </div>

              <form onSubmit={handlePostDiscussion}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: 'var(--cine-text-muted)' }}>
                    SELECT FILM
                  </label>
                  <select
                    value={selectedMovie}
                    onChange={(e) => setSelectedMovie(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      background: 'var(--cine-surface-2)',
                      border: '1px solid var(--cine-border)',
                      borderRadius: 'var(--cine-radius-sm)',
                      color: 'var(--cine-text)',
                      padding: '0 12px',
                    }}
                  >
                    {movies.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title} ({m.releaseDate ? new Date(m.releaseDate).getFullYear() : 'Now Showing'})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: 'var(--cine-text-muted)' }}>
                    RATING: {rating} / 5 STARS
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: starVal <= rating ? '#FFD700' : 'var(--cine-border)',
                        }}
                      >
                        <Star size={22} fill={starVal <= rating ? '#FFD700' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: 'var(--cine-text-muted)' }}>
                    YOUR CRITIQUE / THOUGHTS
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts on pacing, soundtrack, cinematography, or screening quality..."
                    style={{
                      width: '100%',
                      background: 'var(--cine-surface-2)',
                      border: '1px solid var(--cine-border)',
                      borderRadius: 'var(--cine-radius-sm)',
                      padding: '12px',
                      color: 'var(--cine-text)',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {postSuccess && (
                  <div style={{ marginBottom: '14px', fontSize: '0.85rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} />
                    <span>{postSuccess}</span>
                  </div>
                )}

                <CineButton
                  variant="primary"
                  type="submit"
                  disabled={posting}
                  style={{ width: '100%', height: '46px', fontWeight: 800 }}
                >
                  <Send size={16} />
                  <span>{posting ? 'TRANSMITTING...' : 'POST DISCUSSION'}</span>
                </CineButton>
              </form>
            </CineCard>

            {/* Trending discussions card */}
            <CineCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <TrendingUp size={18} color="var(--cine-accent)" />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Community Highlights</h4>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--cine-text-muted)' }}>Total Critiques Indexed</span>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--cine-font-mono)' }}>{reviews.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--cine-text-muted)' }}>Average Audience Sentiment</span>
                  <span style={{ fontWeight: 800, color: '#10B981', fontFamily: 'var(--cine-font-mono)' }}>88% Positive</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--cine-text-muted)' }}>Verification Protocol</span>
                  <span style={{ fontWeight: 700, color: 'var(--cine-accent)' }}>100% Ticket-Bound</span>
                </div>
              </div>
            </CineCard>
          </div>

          {/* RIGHT COLUMN: Feed Stream */}
          <div style={{ flex: 1 }}>
            {/* Filter bar */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <CineButton
                variant={activeFilter === 'ALL' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('ALL')}
              >
                ALL DISCUSSIONS ({reviews.length})
              </CineButton>
              <CineButton
                variant={activeFilter === 'TOP' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('TOP')}
              >
                ACCLAIMED (4+ STARS)
              </CineButton>
            </div>

            {loading ? (
              <CineLoader text="Streaming live cinema critiques..." />
            ) : filteredReviews.length > 0 ? (
              <div style={{ display: 'grid', gap: '20px' }}>
                {filteredReviews.map((rev) => (
                  <CineCard key={rev._id} style={{ padding: '24px' }}>
                    {/* Header: User & Movie */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--cine-radius-full)',
                            background: 'var(--cine-surface-2)',
                            border: '1px solid var(--cine-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            color: 'var(--cine-accent)',
                            fontSize: '0.9rem',
                          }}
                        >
                          {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{rev.user?.name || 'Verified Patron'}</span>
                            <ShieldCheck size={14} color="#10B981" />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--cine-text-dim)' }}>
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      </div>

                      {/* Movie pill */}
                      {rev.movie && (
                        <div
                          onClick={() => navigate(`/movies/${rev.movie._id}`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: 'var(--cine-radius-full)',
                            background: 'var(--cine-surface-2)',
                            border: '1px solid var(--cine-border)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <Film size={12} color="var(--cine-accent)" />
                          <span>{rev.movie.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Rating Stars */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          color={i < rev.rating ? '#FFD700' : 'var(--cine-border)'}
                          fill={i < rev.rating ? '#FFD700' : 'none'}
                        />
                      ))}
                    </div>

                    {/* Comment text */}
                    <p style={{ color: 'var(--cine-text)', fontSize: '0.94rem', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                      {rev.comment}
                    </p>

                    {/* Footer: Applaud / Like */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--cine-border)' }}>
                      <button
                        onClick={() => handleLikeDiscussion(rev._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'none',
                          border: 'none',
                          color: rev.likes?.length > 0 ? '#EF4444' : 'var(--cine-text-muted)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Heart size={15} fill={rev.likes?.length > 0 ? '#EF4444' : 'none'} />
                        <span>{rev.likes?.length || 0} APPLAUDS</span>
                      </button>

                      <span style={{ fontSize: '0.72rem', color: 'var(--cine-text-dim)', letterSpacing: '0.04em' }}>
                        VERIFIED AUDIENCE STUB
                      </span>
                    </div>
                  </CineCard>
                ))}
              </div>
            ) : (
              <CineEmptyState
                icon={MessageSquare}
                title="No Community Discussions Found"
                description="Be the first to share an in-depth critique of a theatrical release."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
