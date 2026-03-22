
import React, { useState, useEffect, useCallback } from 'react';
import './HomeScreen.css';
import { Movie, BrowseConfig, TorrentResult } from '../../types';
import {
  getEmbyServers, embyFetchLibrary, embyItemToMovie,
  getTPBTop, getTorrentStreamUrl,
  tmdbTrending, tmdbPopular, tmdbNowPlaying, tmdbTopRated,
  tmdbGetGenres, tmdbDiscover, tmdbItemToMovie, TmdbGenre,
} from '../../utils/api';
import { PLACEHOLDER_MOVIES } from '../../data/movies';
import MovieCard from '../../components/MovieCard';
import SectionHeader from '../../components/SectionHeader';
import HeroPlayer from './HeroPlayer';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onMovieClick: (m: Movie) => void;
  onPlayClick: (m: Movie) => void;
  onBrowse?: (config: BrowseConfig) => void;
  onSearch?: () => void;
}

const GENRE_ICONS: Record<number, string> = {
  28: '💥', 35: '😂', 27: '👻', 10749: '❤️', 878: '🚀',
  16: '🎨', 53: '🔪', 80: '🕵️', 18: '🎭', 12: '🗺️',
  14: '🧙', 36: '📜', 10402: '🎵', 9648: '🔮', 10751: '👨‍👩‍👧',
  10752: '⚔️', 37: '🤠', 99: '📹', 10770: '📺',
};

export default function HomeScreen({ onMovieClick, onPlayClick, onBrowse, onSearch }: Props) {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [embyMovies, setEmbyMovies] = useState<Movie[]>([]);
  const [embySeries, setEmbySeries] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [genreRows, setGenreRows] = useState<{ genre: TmdbGenre; movies: Movie[] }[]>([]);
  const [genres, setGenres] = useState<TmdbGenre[]>([]);
  const [tpbTorrents, setTpbTorrents] = useState<TorrentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [genreMap, setGenreMap] = useState<Map<number, string>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);

      // Load TMDB genres first
      const [movieGenres, tvGenres] = await Promise.all([
        tmdbGetGenres('movie'),
        tmdbGetGenres('tv'),
      ]);
      const gMap = new Map<number, string>();
      movieGenres.forEach(g => gMap.set(g.id, g.name));
      tvGenres.forEach(g => gMap.set(g.id, g.name));
      if (cancelled) return;
      setGenreMap(gMap);
      setGenres(movieGenres);

      // Load everything in parallel
      const [
        trending, popular, npData, trData,
        embyResult, tpbResult,
      ] = await Promise.all([
        tmdbTrending('all', 'week'),
        tmdbPopular('movie', 1).then(d => d.results),
        tmdbNowPlaying(1),
        tmdbTopRated('movie', 1),
        loadEmby(),
        getTPBTop('movies').catch(() => [] as TorrentResult[]),
      ]);

      if (cancelled) return;
      setTrendingMovies(trending.map(i => tmdbItemToMovie(i, gMap)));
      setPopularMovies(popular.map(i => tmdbItemToMovie(i, gMap)));
      setNowPlaying(npData.map(i => tmdbItemToMovie(i, gMap)));
      setTopRated(trData.map(i => tmdbItemToMovie(i, gMap)));
      setEmbyMovies(embyResult.movies);
      setEmbySeries(embyResult.series);
      setTpbTorrents(tpbResult);

      // Load 3 genre rows
      const genrePicks = movieGenres.filter(g => [28, 35, 27, 878, 10749, 16].includes(g.id)).slice(0, 3);
      const genreResults = await Promise.all(
        genrePicks.map(async g => {
          const data = await tmdbDiscover('movie', g.id, 1);
          return { genre: g, movies: data.results.slice(0, 15).map(i => tmdbItemToMovie(i, gMap)) };
        })
      );
      if (!cancelled) setGenreRows(genreResults);

      setLoading(false);
    }

    async function loadEmby() {
      const servers = getEmbyServers(user?.email);
      const server = servers[0];
      if (!server) return { movies: PLACEHOLDER_MOVIES, series: [] as Movie[] };
      try {
        const [movieItems, seriesItems] = await Promise.all([
          embyFetchLibrary(server, 'Movie', 50),
          embyFetchLibrary(server, 'Series', 30),
        ]);
        return {
          movies: movieItems.length > 0 ? movieItems.map(i => embyItemToMovie(i, server)) : PLACEHOLDER_MOVIES,
          series: seriesItems.map(i => embyItemToMovie(i, server)),
        };
      } catch {
        return { movies: PLACEHOLDER_MOVIES, series: [] as Movie[] };
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const formatTime = (d: Date) => {
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
    const h12 = d.getHours() % 12 || 12;
    return `${h12.toString().padStart(2,'0')}:${m} ${ampm}`;
  };

  const featured = trendingMovies[0] || embyMovies[0];

  const handleSeeAll = (title: string, category: BrowseConfig['category'], type: 'movie' | 'tv' | 'all' = 'movie', genreId?: number) => {
    if (onBrowse) {
      onBrowse({ title, category: category || 'popular', type, genreId });
    }
  };

  const handleTorrentPlay = (t: TorrentResult) => {
    const magnetOrHash = t.magnetUrl || t.infoHash || '';
    if (!magnetOrHash) return;
    const streamUrl = getTorrentStreamUrl(magnetOrHash);
    onPlayClick({
      id: `tpb-${t.infoHash || Date.now()}`,
      title: t.name,
      genre: 'Torrent',
      year: new Date().getFullYear(),
      rating: `${t.seeds} seeds`,
      duration: t.size,
      description: `${t.name} — ${t.size}, ${t.seeds} seeders`,
      gradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      accentColor: '#8b5cf6',
      streams: [{ name: 'Torrent Stream', title: t.name, url: streamUrl, _seeds: t.seeds, _size: t.size }],
    });
  };

  const truncateName = (name: string, maxLen: number = 40) =>
    name.length > maxLen ? name.substring(0, maxLen) + '...' : name;

  const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'movies', label: 'Movies' },
    { id: 'tv', label: 'TV Shows' },
    { id: 'mylib', label: 'My Library' },
  ];

  return (
    <div className="home-screen">
      {/* Top Bar */}
      <div className="home-topbar">
        <div className="home-topbar__left">
          <div className="home-logo">
            <span className="home-logo__n">N</span>
            <span className="home-logo__text">EXXTFLIX</span>
          </div>
        </div>
        <div className="home-topbar__right">
          <div className="home-time">{formatTime(currentTime)}</div>
          <div className="home-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="home-search-bar" onClick={() => onSearch?.()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span className="home-search-placeholder">Search movies, shows, people...</span>
      </div>

      {/* Category Chips */}
      <div className="home-categories">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            className={`home-category-chip ${activeCategory === c.id ? 'home-category-chip--active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Hero Player */}
      {featured && (
        <HeroPlayer
          movie={featured}
          onMovieClick={onMovieClick}
          onPlayClick={onPlayClick}
        />
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="home-loading">
          <div className="home-loading-pulse" />
          <div className="home-loading-pulse" style={{ width: '60%' }} />
        </div>
      )}

      {/* Sections */}
      <div className="home-sections">

        {/* Genre Chips */}
        {genres.length > 0 && (
          <div className="home-section">
            <SectionHeader title="Browse by Genre" />
            <div className="home-genre-chips">
              {genres.slice(0, 12).map(g => (
                <button
                  key={g.id}
                  className="genre-chip"
                  onClick={() => handleSeeAll(g.name, 'genre', 'movie', g.id)}
                >
                  <span className="genre-chip__icon">{GENRE_ICONS[g.id] || '🎬'}</span>
                  <span className="genre-chip__label">{g.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        {(activeCategory === 'all' || activeCategory === 'movies' || activeCategory === 'tv') && trendingMovies.length > 0 && (
          <div className="home-section">
            <SectionHeader title="Trending This Week" onSeeAll={() => handleSeeAll('Trending This Week', 'trending', 'all')} />
            <div className="home-scroll-row">
              {trendingMovies.slice(0, 10).map((m, i) => (
                <div key={m.id} className="trending-item">
                  <span className="trending-num">{i + 1}</span>
                  <MovieCard movie={m} onClick={onMovieClick} size="md" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Now Playing */}
        {(activeCategory === 'all' || activeCategory === 'movies') && nowPlaying.length > 0 && (
          <div className="home-section">
            <SectionHeader title="Now Playing in Theaters" onSeeAll={() => handleSeeAll('Now Playing', 'now_playing', 'movie')} />
            <div className="home-scroll-row">
              {nowPlaying.slice(0, 12).map(m => (
                <MovieCard key={m.id} movie={m} onClick={onMovieClick} size="lg" />
              ))}
            </div>
          </div>
        )}

        {/* Popular Movies */}
        {(activeCategory === 'all' || activeCategory === 'movies') && popularMovies.length > 0 && (
          <div className="home-section">
            <SectionHeader title="Popular Movies" onSeeAll={() => handleSeeAll('Popular Movies', 'popular', 'movie')} />
            <div className="home-scroll-row">
              {popularMovies.slice(0, 12).map(m => (
                <MovieCard key={m.id} movie={m} onClick={onMovieClick} size="md" />
              ))}
            </div>
          </div>
        )}

        {/* Top Rated */}
        {(activeCategory === 'all' || activeCategory === 'movies') && topRated.length > 0 && (
          <div className="home-section">
            <SectionHeader title="Top Rated" onSeeAll={() => handleSeeAll('Top Rated', 'top_rated', 'movie')} />
            <div className="home-scroll-row">
              {topRated.slice(0, 12).map(m => (
                <MovieCard key={m.id} movie={m} onClick={onMovieClick} size="md" />
              ))}
            </div>
          </div>
        )}

        {/* Genre Rows */}
        {(activeCategory === 'all' || activeCategory === 'movies') && genreRows.map(({ genre, movies }) => (
          movies.length > 0 && (
            <div key={genre.id} className="home-section">
              <SectionHeader
                title={`${GENRE_ICONS[genre.id] || '🎬'} ${genre.name}`}
                onSeeAll={() => handleSeeAll(genre.name, 'genre', 'movie', genre.id)}
              />
              <div className="home-scroll-row">
                {movies.map(m => (
                  <MovieCard key={m.id} movie={m} onClick={onMovieClick} size="md" />
                ))}
              </div>
            </div>
          )
        ))}

        {/* My Library — Emby Movies */}
        {(activeCategory === 'all' || activeCategory === 'mylib') && embyMovies.length > 0 && (
          <div className="home-section">
            <SectionHeader title="My Library" onSeeAll={() => {}} />
            <div className="home-scroll-row">
              {embyMovies.slice(0, 12).map(m => (
                <MovieCard key={m.id} movie={m} onClick={onMovieClick} size="md" />
              ))}
            </div>
          </div>
        )}

        {/* My Library — Series */}
        {(activeCategory === 'all' || activeCategory === 'mylib' || activeCategory === 'tv') && embySeries.length > 0 && (
          <div className="home-section">
            <SectionHeader title="TV Series" onSeeAll={() => {}} />
            <div className="home-scroll-row">
              {embySeries.slice(0, 10).map(m => (
                <MovieCard key={m.id} movie={m} onClick={onMovieClick} size="lg" />
              ))}
            </div>
          </div>
        )}

        {/* Trending Torrents */}
        {(activeCategory === 'all') && tpbTorrents.length > 0 && (
          <div className="home-section">
            <SectionHeader title="Trending Torrents" />
            <div className="home-scroll-row">
              {tpbTorrents.map((t, i) => (
                <div key={`tpb-${i}`} className="torrent-card" onClick={() => handleTorrentPlay(t)}>
                  <div className="torrent-card__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                  <div className="torrent-card__info">
                    <span className="torrent-card__name">{truncateName(t.name)}</span>
                    <div className="torrent-card__meta">
                      <span className="torrent-card__size">{t.size}</span>
                      <span className="torrent-card__seeds">
                        <span className="torrent-card__seed-dot" />
                        {t.seeds}
                      </span>
                    </div>
                  </div>
                  <button className="torrent-card__play" onClick={(e) => { e.stopPropagation(); handleTorrentPlay(t); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
