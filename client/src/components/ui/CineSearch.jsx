import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export const CineSearch = ({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search movies, cinemas, genres, moods...',
  loading = false,
  autoFocus = false,
  style = {},
  className = '',
  size = 'md',
}) => {
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) onChange(val);
  };

  const handleClear = () => {
    setQuery('');
    if (onChange) onChange('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(query);
    }
  };

  const height = size === 'lg' ? '54px' : size === 'sm' ? '38px' : '46px';
  const fontSize = size === 'lg' ? '1rem' : size === 'sm' ? '0.82rem' : '0.92rem';

  return (
    <div
      className={`cine-search-wrap ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        ...style,
      }}
    >
      <Search
        size={size === 'lg' ? 20 : 16}
        style={{
          position: 'absolute',
          left: '16px',
          color: 'var(--cine-text-dim)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          height,
          fontSize,
          background: 'var(--cine-surface-2)',
          border: '1px solid var(--cine-border)',
          borderRadius: 'var(--cine-radius-md)',
          paddingLeft: '46px',
          paddingRight: query ? '44px' : '16px',
          color: 'var(--cine-text)',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'all 0.15s ease',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--cine-border-hover)';
          e.target.style.background = 'var(--cine-surface-1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--cine-border)';
          e.target.style.background = 'var(--cine-surface-2)';
        }}
      />
      {loading ? (
        <Loader2
          size={16}
          className="cine-spin"
          style={{
            position: 'absolute',
            right: '16px',
            color: 'var(--cine-accent)',
          }}
        />
      ) : query ? (
        <button
          type="button"
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '14px',
            background: 'none',
            border: 'none',
            color: 'var(--cine-text-dim)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Clear search"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
};

export default CineSearch;
