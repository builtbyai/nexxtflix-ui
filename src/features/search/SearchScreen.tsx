
import React, { useState, useMemo } from 'react';
import './SearchScreen.css';
import { Movie } from '../../types';
import { MOVIES } from '../../data/movies';
import MovieCard from '../../components/MovieCard';

interface Props {
  onMovieClick: (m: Movie) => void;
}

const GENRES = ['All', 'Sci-Fi', 'Action', 'Thriller', 'Drama', 'Crime', 'Fantasy', 'Horror'];

export default function SearchScreen({ onMovieClick }: Props) {
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [focused, setFocused] = useState(false);

  const filtered = useMemo(() => {
    return MOVIES.filter(m => {
      const matchQ = query === '' || m.title.toLowerCase().includes(query.toLowerCase()) || m.genre.toLowerCase().includes(query.toLowerCase());
      const matchG = activeGenre === 'All' || m.genre.toLowerCase().includes(activeGenre.toLowerCase());
      return matchQ && matchG;
    });
  }, [query, activeGenre]);

  return (
    <div className="search-screen">
      <div className="search-header">
        <h1 className="search-header__title">Discover</h1>
        <p className="search-header__sub">Find your next obsession</p>
      </div>

      {/* Search Bar */}
      <div className={`search-bar ${focused ? 'search-bar--focused' : ''}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="search-input"
          type="text"
          placeholder="Search titles, genres..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Genre Filter */}
      <div className="genre-scroll">
        {GENRES.map(g => (
          <button
            key={g}
            className={`genre-chip ${activeGenre === g ? 'genre-chip--active' : ''}`}
            onClick={() => setActiveGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="search-results-header">
        <span className="search-results-count">{filtered.length} titles</span>
      </div>

      {filtered.length === 0 ? (
        <div className="search-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>No results for "{query}"</p>
          <span>Try a different search term</span>
        </div>
      ) : (
        <div className="search-grid">
          {filtered.map(m => (
            <div key={m.id} className="search-grid-item">
              <MovieCard movie={m} onClick={onMovieClick} size="lg" showProgress />
              <div className="search-grid-info">
                <span className="search-grid-title">{m.title}</span>
                <span className="search-grid-meta">{m.genre} • {m.year}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
