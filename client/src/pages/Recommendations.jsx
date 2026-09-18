import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { CineMovieCard } from '../components/ui/CineMovieCard';
import { CineCard } from '../components/ui/CineCard';
import { CineButton } from '../components/ui/CineButton';
import { CineBadge } from '../components/ui/CineBadge';
import { CineLoader } from '../components/ui/CineLoader';
import { CineEmptyState } from '../components/ui/CineEmptyState';
import { Sparkles, Flame, Star, Film, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Recommendations = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await apiClient.get('/recommendations');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CineLoader text="CineAI neural embeddings are calculating affinity vectors..." />
      </div>
    );
  }

  const recList = data?.recommendedForYou || [];
  const trendingList = data?.trending || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cine-bg)', color: 'var(--cine-text)', paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="cine-container">
        {/* Masthead */}
        <div style={{ marginBottom: '48px', borderBottom: '1px solid var(--cine-border)', paddingBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--cine-accent)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
            <Sparkles size={14} />
            <span>NEURAL PREFERENCE SYNTHESIS</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>
            RECOMMENDED FOR YOU
          </h1>
          <p style={{ color: 'var(--cine-text-muted)', fontSize: '1rem', marginTop: '10px', maxWidth: '640px' }}>
            Curated titles matching your cinematic DNA, directorial affinities, and theatrical viewing frequency.
          </p>
        </div>

        {/* Section 1: Personalized Match */}
        {recList.length > 0 && (
          <div style={{ marginBottom: '56px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>High-Affinity Matches</h2>
                <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Ranked by latent taste vector alignment</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {recList.map((movie) => (
                <CineMovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Trending Across Theatres */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Trending in Auditoriums</h2>
              <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Highest weekend seat occupancy rates</p>
            </div>
          </div>

          {trendingList.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {trendingList.map((movie) => (
                <CineMovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          ) : (
            <CineEmptyState
              icon={Film}
              title="No Recommendations Currently Available"
              description="Explore now-showing titles to begin calibrating your taste profile."
              actionLabel="Browse Catalogue"
              onAction={() => navigate('/movies')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
