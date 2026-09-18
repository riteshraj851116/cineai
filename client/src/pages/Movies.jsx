import React, { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import { useCity } from '../context/CityContext';
import {
  CineMovieCard,
  CineButton,
  CineInput,
  CineSelect,
  CineBadge,
  CinePageHeader,
  CineEmptyState,
  CineErrorState,
  CineMovieCardSkeleton,
  CineDrawer,
} from '../components/ui';
import { Search, Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const Movies = () => {
  const { selectedCity } = useCity();

  // Filter States
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('now_showing');
  const [sortBy, setSortBy] = useState('rating');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const genresList = ['Action', 'Sci-Fi', 'Adventure', 'Drama', 'Thriller', 'Animation', 'Fantasy', 'History'];
  const languagesList = ['English', 'Hindi', 'Tamil', 'Telugu'];
  const formatsList = ['IMAX', '4DX', '3D', '2D'];

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        city: selectedCity,
        sort: sortBy,
        status: selectedStatus,
      };

      if (search) queryParams.search = search;
      if (selectedGenre) queryParams.genre = selectedGenre;
      if (selectedLanguage) queryParams.language = selectedLanguage;
      if (selectedFormat) queryParams.format = selectedFormat;

      const { data } = await movieService.getMovies(queryParams);
      if (data.success) {
        setMovies(data.movies || []);
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
      setError('Unable to retrieve cinema catalogue. Please check network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [selectedCity, selectedGenre, selectedLanguage, selectedFormat, selectedStatus, sortBy]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedGenre('');
    setSelectedLanguage('');
    setSelectedFormat('');
    setSelectedStatus('now_showing');
    setSortBy('rating');
  };

  const hasActiveFilters = search || selectedGenre || selectedLanguage || selectedFormat || selectedStatus !== 'now_showing';

  return (
    <div style={{ paddingBottom: '96px' }}>
      <div className="cine-page-container">
        {/* Page Header */}
        <CinePageHeader
          eyebrow={`REPERTOIRE CATALOG • ${selectedCity.toUpperCase()}`}
          title="EXPLORE CINEMA."
          subtitle="Explore blockbusters, indie gems, and high-format 70mm IMAX and Dolby screenings currently scheduled."
        />

        {/* Top Control Bar (Search + Sort + Mobile Filter Trigger) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px',
            padding: '16px 20px',
            backgroundColor: 'var(--cine-surface)',
            border: '1px solid var(--cine-border)',
            borderRadius: 'var(--cine-radius-lg)',
          }}
        >
          {/* Search Box */}
          <div style={{ width: '320px', maxWidth: '100%' }}>
            <CineInput
              placeholder="Search by title or director..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>

          {/* Right Tools (Status toggle, Sort, Mobile Filter Button) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Desktop Status Tabs */}
            <div className="desktop-only" style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setSelectedStatus('now_showing')}
                className={`cine-btn cine-btn-sm ${selectedStatus === 'now_showing' ? 'cine-btn-primary' : 'cine-btn-secondary'}`}
              >
                Now Showing
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('coming_soon')}
                className={`cine-btn cine-btn-sm ${selectedStatus === 'coming_soon' ? 'cine-btn-primary' : 'cine-btn-secondary'}`}
              >
                Coming Soon
              </button>
            </div>

            {/* Sort Dropdown */}
            <div style={{ width: '170px' }}>
              <CineSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'rating', label: 'Top Rated' },
                  { value: 'popularity', label: 'Most Popular' },
                  { value: 'newest', label: 'Release Date' },
                  { value: 'duration', label: 'Runtime' },
                ]}
              />
            </div>

            {/* Mobile Filter Button */}
            <CineButton
              variant="secondary"
              className="mobile-only"
              onClick={() => setIsFilterDrawerOpen(true)}
              icon={Filter}
            >
              Filters
            </CineButton>

            {hasActiveFilters && (
              <CineButton
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                icon={X}
              >
                Reset
              </CineButton>
            )}
          </div>
        </div>

        {/* Main Layout: Desktop Sidebar + Movie Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', alignItems: 'start' }} className="movies-discovery-grid">
          {/* Desktop Filter Sidebar */}
          <aside
            className="desktop-only"
            style={{
              backgroundColor: 'var(--cine-surface)',
              border: '1px solid var(--cine-border)',
              borderRadius: 'var(--cine-radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              position: 'sticky',
              top: '96px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.875rem' }}>
                <Filter size={16} color="var(--cine-accent)" />
                <span>FILTERS</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  style={{ fontSize: '0.75rem', color: 'var(--cine-muted)', textDecoration: 'underline' }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Genre Filter */}
            <div>
              <label className="cine-label" style={{ display: 'block', marginBottom: '8px' }}>
                GENRE
              </label>
              <CineSelect
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                options={[{ value: '', label: 'All Genres' }, ...genresList.map((g) => ({ value: g, label: g }))]}
              />
            </div>

            {/* Language Filter */}
            <div>
              <label className="cine-label" style={{ display: 'block', marginBottom: '8px' }}>
                LANGUAGE
              </label>
              <CineSelect
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                options={[{ value: '', label: 'All Languages' }, ...languagesList.map((l) => ({ value: l, label: l }))]}
              />
            </div>

            {/* Format Filter */}
            <div>
              <label className="cine-label" style={{ display: 'block', marginBottom: '8px' }}>
                TECHNICAL FORMAT
              </label>
              <CineSelect
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                options={[{ value: '', label: 'All Formats' }, ...formatsList.map((f) => ({ value: f, label: f }))]}
              />
            </div>
          </aside>

          {/* Right Area: Results Grid */}
          <main>
            {loading ? (
              <div className="cine-grid-movies">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <CineMovieCardSkeleton key={idx} />
                ))}
              </div>
            ) : error ? (
              <CineErrorState message={error} onRetry={fetchMovies} />
            ) : movies.length === 0 ? (
              <CineEmptyState
                title="NO CINEMA RELEASES FOUND"
                message={`No exhibitions matched your active filters in ${selectedCity}. Try resetting your criteria or exploring other formats.`}
                actionLabel="RESET ALL FILTERS"
                onAction={handleClearFilters}
              />
            ) : (
              <div className="cine-grid-movies">
                {movies.map((movie) => (
                  <CineMovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <CineDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="FILTER REPERTOIRE"
        position="right"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="cine-label" style={{ display: 'block', marginBottom: '8px' }}>
              EXHIBITION STATUS
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <CineButton
                variant={selectedStatus === 'now_showing' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedStatus('now_showing')}
                style={{ flex: 1 }}
              >
                Now Showing
              </CineButton>
              <CineButton
                variant={selectedStatus === 'coming_soon' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedStatus('coming_soon')}
                style={{ flex: 1 }}
              >
                Coming Soon
              </CineButton>
            </div>
          </div>

          <div>
            <label className="cine-label" style={{ display: 'block', marginBottom: '8px' }}>
              GENRE
            </label>
            <CineSelect
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              options={[{ value: '', label: 'All Genres' }, ...genresList.map((g) => ({ value: g, label: g }))]}
            />
          </div>

          <div>
            <label className="cine-label" style={{ display: 'block', marginBottom: '8px' }}>
              LANGUAGE
            </label>
            <CineSelect
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              options={[{ value: '', label: 'All Languages' }, ...languagesList.map((l) => ({ value: l, label: l }))]}
            />
          </div>

          <div>
            <label className="cine-label" style={{ display: 'block', marginBottom: '8px' }}>
              TECHNICAL FORMAT
            </label>
            <CineSelect
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              options={[{ value: '', label: 'All Formats' }, ...formatsList.map((f) => ({ value: f, label: f }))]}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <CineButton
              variant="primary"
              onClick={() => setIsFilterDrawerOpen(false)}
              style={{ flex: 1 }}
            >
              APPLY FILTERS
            </CineButton>
            <CineButton
              variant="outline"
              onClick={handleClearFilters}
            >
              RESET
            </CineButton>
          </div>
        </div>
      </CineDrawer>

      <style>{`
        @media (max-width: 900px) {
          .movies-discovery-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Movies;
