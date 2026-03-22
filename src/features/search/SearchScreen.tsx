
import React, { useState, useCallback, useRef, useEffect } from 'react';
import './SearchScreen.css';
import { Movie, TorrentResult } from '../../types';
import {
  search1337x, search1337xWithMagnets, searchTPB,
  getEmbyServers, embySearch, embyItemToMovie,
  getTorrentStreamUrl, tmdbSearch, tmdbItemToMovie,
  tmdbGetGenres, tmdbDiscover, TmdbGenre,
} from '../../utils/api';
import MovieCard from '../../components/MovieCard';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onMovieClick: (m: Movie) => void;
  onPlay?: (m: Movie) => void;
}

type SearchMode = 'tmdb' | 'emby' | '1337x' | 'tpb';

export default function SearchScreen({ onMovieClick, onPlay }: Props) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('tmdb');
  const [tmdbResults, setTmdbResults] = useState<Movie[]>([]);
  const [embyResults, setEmbyResults] = useState<Movie[]>([]);
  const [torrentResults, setTorrentResults] = useState<TorrentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [searched, setSearched] = useState(false);
  const [genres, setGenres] = useState<TmdbGenre[]>([]);
  const [genreMap, setGenreMap] = useState<Map<number, string>>(new Map());
  const [discoverMovies, setDiscoverMovies] = useState<Movie[]>([]);
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const debounceRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    tmdbGetGenres('movie').then(g => {
      setGenres(g);
      const map = new Map<number, string>();
      g.forEach(genre => map.set(genre.id, genre.name));
      setGenreMap(map);
    });
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q: string, m: SearchMode) => {
    if (!q.trim()) {
      setTmdbResults([]);
      setEmbyResults([]);
      setTorrentResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      if (m === 'tmdb') {
        const data = await tmdbSearch(q, 'multi', 1);
        setTmdbResults(data.results.filter(r => r.poster_path).map(i => tmdbItemToMovie(i, genreMap)));
        setEmbyResults([]);
        setTorrentResults([]);
      } else if (m === 'emby') {
        const servers = getEmbyServers(user?.email);
        const server = servers[0];
        if (server) {
          const items = await embySearch(server, q, 50);
          setEmbyResults(items.map(item => embyItemToMovie(item, server)));
        }
        setTmdbResults([]);
        setTorrentResults([]);
      } else if (m === '1337x') {
        const res = await search1337xWithMagnets(q, 25);
        setTorrentResults(res);
        setTmdbResults([]);
        setEmbyResults([]);
      } else {
        const res = await searchTPB(q, 'movies');
        setTorrentResults(res);
        setTmdbResults([]);
        setEmbyResults([]);
      }
    } catch (e) {
      console.error('Search error:', e);
    }
    setLoading(false);
  }, [genreMap, user?.email]);

  const handleInput = (val: string) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(() => doSearch(val, mode), 400);
    } else {
      setTmdbResults([]);
      setEmbyResults([]);
      setTorrentResults([]);
      setSearched(false);
    }
  };

  const handleModeChange = (m: SearchMode) => {
    setMode(m);
    if (query.trim().length >= 2) {
      doSearch(query, m);
    }
  };

  const handleGenreClick = async (genreId: number) => {
    setActiveGenre(genreId);
    setLoading(true);
    const data = await tmdbDiscover('movie', genreId, 1);
    setDiscoverMovies(data.results.filter(r => r.poster_path).map(i => tmdbItemToMovie(i, genreMap)));
    setLoading(false);
  };

  const allResults = [...tmdbResults, ...embyResults];
  const hasResults = allResults.length > 0 || torrentResults.length > 0;
  const showDiscover = !searched && !query && discoverMovies.length > 0;

  return (
    <div className="search-screen">
      <div className="search-header">
        <h1 className="search-header__title">Discover</h1>
        <p className="search-header__sub">Search movies, shows & torrents</p>
      </div>

      {/* Search Bar */}
      <div className={`search-bar ${focused ? 'search-bar--focused' : ''}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder={
            mode === 'tmdb' ? 'Search movies & TV shows...' :
            mode === 'emby' ? 'Search your media library...' :
            'Search torrents...'
          }
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => { if (e.key === 'Enter') doSearch(query, mode); }}
        />
        {query && (
          <button className="search-clear" onClick={() => {
            setQuery('');
            setTmdbResults([]);
            setEmbyResults([]);
            setTorrentResults([]);
            setSearched(false);
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="search-modes">
        {(['tmdb', 'emby', '1337x', 'tpb'] as SearchMode[]).map(m => (
          <button
            key={m}
            className={`search-mode-btn ${mode === m ? 'search-mode-btn--active' : ''}`}
            onClick={() => handleModeChange(m)}
          >
            {m === 'tmdb' ? 'TMDB' : m === 'emby' ? 'My Library' : m === '1337x' ? '1337x' : 'TPB'}
          </button>
        ))}
      </div>

      {/* Genre chips (when no search) */}
      {!searched && !query && genres.length > 0 && (
        <div className="search-genres">
          {genres.slice(0, 10).map(g => (
            <button
              key={g.id}
              className={`search-genre-chip ${activeGenre === g.id ? 'search-genre-chip--active' : ''}`}
              onClick={() => handleGenreClick(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* Discover by genre */}
      {showDiscover && (
        <>
          <div className="search-results-header">
            <span className="search-results-count">{discoverMovies.length} movies</span>
          </div>
          <div className="search-grid">
            {discoverMovies.map(m => (
              <div key={m.id} className="search-grid-item" onClick={() => onMovieClick(m)}>
                {m.poster ? (
                  <div className="search-poster-wrap">
                    <img src={m.poster} alt={m.title} className="search-poster-img" loading="lazy" />
                    <div className="search-poster-overlay" />
                  </div>
                ) : (
                  <MovieCard movie={m} onClick={onMovieClick} size="lg" />
                )}
                <div className="search-grid-info">
                  <span className="search-grid-title">{m.title}</span>
                  <span className="search-grid-meta">{m.genre} {m.year ? `• ${m.year}` : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Loading */}
      {loading && (
        <div className="search-loading">
          <div className="search-spinner" />
          <span>Searching...</span>
        </div>
      )}

      {/* TMDB + Emby Results */}
      {!loading && allResults.length > 0 && (
        <>
          <div className="search-results-header">
            <span className="search-results-count">{allResults.length} results</span>
          </div>
          <div className="search-grid">
            {allResults.map(m => (
              <div key={m.id} className="search-grid-item" onClick={() => onMovieClick(m)}>
                {m.poster ? (
                  <div className="search-poster-wrap">
                    <img src={m.poster} alt={m.title} className="search-poster-img" loading="lazy" />
                    <div className="search-poster-overlay" />
                  </div>
                ) : (
                  <MovieCard movie={m} onClick={onMovieClick} size="lg" />
                )}
                <div className="search-grid-info">
                  <span className="search-grid-title">{m.title}</span>
                  <span className="search-grid-meta">{m.genre} {m.year ? `• ${m.year}` : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Torrent Results */}
      {!loading && (mode === '1337x' || mode === 'tpb') && torrentResults.length > 0 && (
        <>
          <div className="search-results-header">
            <span className="search-results-count">{torrentResults.length} torrents</span>
          </div>
          <div className="torrent-list">
            {torrentResults.map((t, i) => (
              <div key={i} className="torrent-item">
                <div className="torrent-info">
                  <span className="torrent-name">{t.name}</span>
                  <div className="torrent-meta">
                    <span className="torrent-size">{t.size}</span>
                    <span className="torrent-seeds">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#10b981"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {t.seeds}
                    </span>
                    <span className="torrent-leeches">{t.leeches} leeches</span>
                  </div>
                </div>
                <button className="torrent-play-btn" onClick={() => {
                  if ((t.magnetUrl || t.infoHash) && onPlay) {
                    onPlay({
                      id: t.infoHash || `torrent-${i}`,
                      title: t.name,
                      genre: 'Torrent',
                      year: new Date().getFullYear(),
                      rating: `${t.seeds}`,
                      duration: t.size,
                      description: '',
                      gradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
                      accentColor: '#8b5cf6',
                      streams: [{
                        name: mode === '1337x' ? '1337x' : 'TPB',
                        title: t.name,
                        infoHash: t.infoHash,
                        magnetUrl: t.magnetUrl,
                        url: t.magnetUrl ? getTorrentStreamUrl(t.magnetUrl) : undefined,
                        _seeds: t.seeds,
                        _size: t.size,
                      }],
                    });
                  }
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && searched && !hasResults && (
        <div className="search-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>No results for "{query}"</p>
          <span>Try a different search term or source</span>
        </div>
      )}

      {/* Pre-search state */}
      {!loading && !searched && !showDiscover && (
        <div className="search-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>Search for anything</p>
          <span>Browse TMDB, your library, or find torrents</span>
        </div>
      )}
    </div>
  );
}
