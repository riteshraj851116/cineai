import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cinemaService } from '../services/cinemaService';
import { showService } from '../services/showService';
import { useCity } from '../context/CityContext';
import {
  CineCinemaCard,
  CinePageHeader,
  CineInput,
  CineButton,
  CineBadge,
  CineLoader,
  CineEmptyState,
  CineModal,
} from '../components/ui';
import { Search, MapPin, Building2, Film, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export const Cinemas = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [activeTheatreModal, setActiveTheatreModal] = useState(null);
  const [theatreShows, setTheatreShows] = useState([]);
  const [loadingShows, setLoadingShows] = useState(false);

  const { selectedCity } = useCity();
  const navigate = useNavigate();

  const formats = ['ALL', 'IMAX', 'DOLBY ATMOS', '4DX', 'RECLINERS'];

  useEffect(() => {
    const fetchTheatres = async () => {
      setLoading(true);
      try {
        const { data } = await cinemaService.getCinemas({ city: selectedCity });
        if (data.success) {
          setTheatres(data.theatres || data.cinemas || []);
        }
      } catch (err) {
        console.error('Failed to load theatres:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheatres();
  }, [selectedCity]);

  const handleOpenTheatre = async (theatre) => {
    setActiveTheatreModal(theatre);
    setLoadingShows(true);
    try {
      const { data } = await showService.getShows({
        theatreId: theatre._id,
        city: selectedCity,
      });
      if (data.success) {
        setTheatreShows(data.shows || []);
      }
    } catch (err) {
      console.error('Failed to load shows for theatre:', err);
    } finally {
      setLoadingShows(false);
    }
  };

  const filteredTheatres = theatres.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.address.toLowerCase().includes(search.toLowerCase());
    const matchesFormat =
      selectedFormat === 'ALL' ||
      (t.facilities || []).some((f) => f.toUpperCase().includes(selectedFormat));
    return matchesSearch && matchesFormat;
  });

  return (
    <div style={{ paddingBottom: '96px' }}>
      <div className="cine-page-container">
        {/* Page Header */}
        <CinePageHeader
          eyebrow={`EXHIBITION VENUES • ${selectedCity.toUpperCase()}`}
          title="FIND YOUR CINEMA."
          subtitle="Discover certified auditoriums with 70mm dual laser projection, immersive Dolby Atmos acoustic arrays, and VIP recliner dining."
        />

        {/* Search & Format Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '36px',
            padding: '16px 20px',
            backgroundColor: 'var(--cine-surface)',
            border: '1px solid var(--cine-border)',
            borderRadius: 'var(--cine-radius-lg)',
          }}
        >
          {/* Search Box */}
          <div style={{ width: '340px', maxWidth: '100%' }}>
            <CineInput
              placeholder="Search cinema or locality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>

          {/* Format Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {formats.map((fmt) => {
              const isSelected = selectedFormat === fmt;
              return (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setSelectedFormat(fmt)}
                  className={`cine-btn cine-btn-sm ${isSelected ? 'cine-btn-primary' : 'cine-btn-secondary'}`}
                >
                  {fmt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading / Empty / Results Grid */}
        {loading ? (
          <CineLoader text="SYNCHRONIZING EXHIBITION DIRECTORY..." />
        ) : filteredTheatres.length === 0 ? (
          <CineEmptyState
            icon={Building2}
            title="NO CINEMAS FOUND"
            message={`No multiplexes matched your query in ${selectedCity}. Try clearing the search filter.`}
            actionLabel="CLEAR FILTERS"
            onAction={() => {
              setSearch('');
              setSelectedFormat('ALL');
            }}
          />
        ) : (
          <div className="cine-grid-cinemas">
            {filteredTheatres.map((theatre) => (
              <CineCinemaCard
                key={theatre._id}
                theatre={theatre}
                onSelect={() => handleOpenTheatre(theatre)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cinema Details & Shows Modal */}
      {activeTheatreModal && (
        <CineModal
          isOpen={!!activeTheatreModal}
          onClose={() => setActiveTheatreModal(null)}
          title={activeTheatreModal.name}
          maxWidth="680px"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--cine-muted)', marginBottom: '16px' }}>
              <MapPin size={14} color="var(--cine-accent)" />
              <span>{activeTheatreModal.address}</span>
            </div>

            {/* Facilities Bar */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {activeTheatreModal.facilities?.map((f) => (
                <CineBadge key={f} variant="accent" size="sm">{f}</CineBadge>
              ))}
            </div>

            {/* Current Shows */}
            <h4 style={{ fontFamily: 'var(--cine-font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
              CURRENT SCREENINGS AT THIS VENUE
            </h4>

            {loadingShows ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--cine-muted)' }}>
                Retrieving active schedule...
              </div>
            ) : theatreShows.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--cine-muted)', backgroundColor: 'var(--cine-surface-2)', borderRadius: 'var(--cine-radius-md)' }}>
                No active showtimes currently scheduled for online booking. Check back shortly.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {theatreShows.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => navigate(`/booking/${s._id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--cine-radius-md)',
                      backgroundColor: 'var(--cine-surface-2)',
                      border: '1px solid var(--cine-border)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--cine-accent)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--cine-border)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFFFFF' }}>
                        {s.movie?.title || 'Feature Presentation'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--cine-muted)' }}>
                        {s.format || 'IMAX'} • Screen {s.screen?.name || '01'} • {s.date} at {s.startTime}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--cine-accent)' }}>
                        ₹{s.price || 350}
                      </span>
                      <ArrowRight size={15} color="var(--cine-muted)" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CineModal>
      )}
    </div>
  );
};

export default Cinemas;
