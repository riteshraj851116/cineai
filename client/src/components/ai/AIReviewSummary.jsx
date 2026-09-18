import React, { useEffect, useState } from 'react';
import { Sparkles, ThumbsUp, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { aiService } from '../../services/aiService';

export const AIReviewSummary = ({ movieId }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await aiService.getReviewSummary(movieId);
        if (data.success) {
          setSummaryData(data.summary);
        }
      } catch (err) {
        console.error('Failed to fetch AI review summary:', err);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) fetchSummary();
  }, [movieId]);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', background: '#F4F0E6', border: '2px solid #111111', borderRadius: 'var(--radius-sm)', color: '#666666' }}>
        <Sparkles size={20} className="animate-spin" style={{ color: '#111111', marginBottom: '8px' }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>CineAI is aggregating reviews and analyzing audience sentiment...</div>
      </div>
    );
  }

  if (!summaryData) return null;

  const aspectLabels = [
    { key: 'story', label: 'Story & Narrative' },
    { key: 'acting', label: 'Cast Performance' },
    { key: 'direction', label: 'Direction & Vision' },
    { key: 'music', label: 'Score & Sound' },
    { key: 'visuals', label: 'IMAX Visuals / VFX' },
    { key: 'pacing', label: 'Pacing & Flow' },
  ];

  return (
    <div style={{ background: '#FFFFFF', padding: '30px', marginTop: '30px', border: '2px solid #111111', borderRadius: 'var(--radius-sm)', boxShadow: '4px 4px 0px #111111' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '2px', background: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBF9F4' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: '#111111', letterSpacing: '0.02em', margin: 0 }}>
              CineAI Review Intelligence
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#666666', fontFamily: 'var(--font-mono)' }}>Multi-dimensional editorial sentiment analysis</div>
          </div>
        </div>

        <span style={{ background: '#111111', color: '#FBF9F4', fontSize: '0.8rem', fontWeight: 800, padding: '4px 12px', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-mono)' }}>
          {summaryData.overallSentiment.toUpperCase()}
        </span>
      </div>

      {/* Summary Narrative */}
      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#111111', marginBottom: '24px', background: '#F4F0E6', padding: '16px 20px', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #111111', fontStyle: 'italic' }}>
        "{summaryData.summary}"
      </p>

      {/* Multi-Dimensional Aspect Breakdown */}
      <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666666', marginBottom: '16px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
        Aspect Breakdown
      </h5>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {aspectLabels.map(({ key, label }) => {
          const score = summaryData.aspects?.[key] || 4.5;
          const percentage = (score / 5) * 100;
          return (
            <div key={key} style={{ background: '#FBF9F4', border: '1px solid #111111', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
                <span style={{ color: '#666666' }}>{label}</span>
                <span style={{ color: '#111111', fontFamily: 'var(--font-mono)' }}>{score} / 5</span>
              </div>
              <div style={{ height: '6px', background: '#ECE8DF', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: '#111111',
                    borderRadius: 'var(--radius-full)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Highlights & Common Critiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#FBF9F4', border: '1.5px solid #111111', padding: '18px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111111', fontWeight: 800, fontSize: '0.85rem', marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>
            <CheckCircle size={16} /> KEY PRAISES
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#333333', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {summaryData.positiveThemes?.map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ color: '#111111' }}>•</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ background: '#FBF9F4', border: '1.5px solid #111111', padding: '18px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666666', fontWeight: 800, fontSize: '0.85rem', marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>
            <AlertCircle size={16} /> AUDIENCE CRITIQUES
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#333333', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {summaryData.mixedThemes?.map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ color: '#666666' }}>•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
