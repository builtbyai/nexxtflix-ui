
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './BrowseScreen.css';
import { Movie, BrowseConfig } from '../../types';
import {
  tmdbTrending, tmdbPopular, tmdbDiscover, tmdbTopRated,
  tmdbNowPlaying, tmdbUpcoming, tmdbItemToMovie, tmdbGetGenres, TmdbGenre,
} from '../../utils/api';
import MovieCard from '../../components/MovieCard';

interface Props {
  config: BrowseConfig;
  onMovieClick: (m: Movie) => void;
  onBack: () => void;
}

export default function BrowseScreen({ config, onMovieClick, onBack }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [genreMap, setGenreMap] = useState<Map<number, string>>(new Map());
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tmdbGetGenres('movie').then(g => {
      const map = new Map<number, string>();
      g.forEach(genre => map.set(genre.id, genre.name));
      tmdbGetGenres('tv').then(tvg => {
        tvg.forEach(genre => map.set(genre.id, genre.name));
        setGenreMap(map);
      });
    });
  }, []);

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    let items: any[] = [];
    let totalPages = 1;
    const cat = config.category || 'popular';
    const type = config.type === 'all' ? 'movie' : config.type;

    if (cat === 'trending') {
      items = await tmdbTrending(config.type, 'week');
      totalPages = 1;
    } else if (cat === 'popular') {
      const data = await tmdbPopular(type, p);
      items = data.results;
      totalPages = data.total_pages;
    } else if (cat === 'top_rated') {
      items = await tmdbTopRated(type, p);
    } else if (cat === 'now_playing') {
      items = await tmdbNowPlaying(p);
    } else if (cat === 'upcoming') {
      items = await tmdbUpcoming();
      totalPages = 1;
    } else if (cat === 'genre') {
      const data = await tmdbDiscover(type, config.genreId, p);
      items = data.results;
      totalPages = data.total_pages;
    }

    const converted = items.map(i => tmdbItemToMovie(i, genreMap));
    if (p === 1) {
      setMovies(converted);
    } else {
      setMovies(prev => [...prev, ...converted]);
    }
    setHasMore(p < Math.min(totalPages, 20));
    setLoading(false);
  }, [config, genreMap]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    loadPage(1);
  }, [config.category, config.genreId, config.type]);

  // Infinite scroll
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPage(nextPage);
      }
    }, { threshold: 0.5 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading, page, loadPage]);

  return (
    <div className="browse-screen">
      <div className="browse-header">
        <button className="browse-back" onClick={onBack}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f1f5f9" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="browse-title">{config.title}</h1>
      </div>

      <div className="browse-grid">
        {movies.map(m => (
          <div key={m.id} className="browse-grid-item" onClick={() => onMovieClick(m)}>
            {m.poster ? (
              <div className="browse-poster-wrap">
                <img src={m.poster} alt={m.title} className="browse-poster-img" loading="lazy" />
                <div className="browse-poster-overlay" />
                <div className="browse-poster-rating">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {m.rating}
                </div>
              </div>
            ) : (
              <MovieCard movie={m} onClick={onMovieClick} size="lg" />
            )}
            <span className="browse-item-title">{m.title}</span>
            <span className="browse-item-meta">{m.genre} {m.year ? `• ${m.year}` : ''}</span>
          </div>
        ))}
      </div>

      {loading && (
        <div className="browse-loading">
          <div className="browse-spinner" />
        </div>
      )}

      {hasMore && <div ref={loaderRef} className="browse-sentinel" />}
    </div>
  );
}
