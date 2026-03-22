
import React from 'react';
import './HeroPlayer.css';
import { Movie } from '../../types';

interface Props {
  movie: Movie;
  onMovieClick: (m: Movie) => void;
  onPlayClick: (m: Movie) => void;
}

export default function HeroPlayer({ movie, onMovieClick, onPlayClick }: Props) {
  return (
    <div className="hero-player" onClick={() => onMovieClick(movie)}>
      <div className="hero-player__screen">
        {/* Background — poster/backdrop or gradient */}
        {(movie.background || movie.poster) ? (
          <img
            src={movie.background || movie.poster}
            alt={movie.title}
            className="hero-player__bg-img"
          />
        ) : (
          <div className="hero-player__bg-gradient" style={{ background: movie.gradient }} />
        )}
        <div className="hero-player__overlay" />

        {/* Content */}
        <div className="hero-player__content">
          <h2 className="hero-player__title">{movie.title}</h2>
          <p className="hero-player__meta">
            {movie.genre} {movie.year ? `• ${movie.year}` : ''} {movie.rating !== '—' ? `• ${movie.rating}` : ''}
          </p>
          {movie.description && (
            <p className="hero-player__desc">
              {movie.description.length > 120 ? movie.description.substring(0, 120) + '...' : movie.description}
            </p>
          )}
          <div className="hero-player__actions">
            <button className="hero-play-btn" onClick={(e) => { e.stopPropagation(); onPlayClick(movie); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Play
            </button>
            <button className="hero-info-btn" onClick={(e) => { e.stopPropagation(); onMovieClick(movie); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Info
            </button>
          </div>
        </div>

        {/* Continue watching progress bar */}
        {movie.progress && movie.progress > 0 && (
          <div className="hero-player__progress">
            <div className="hero-player__progress-fill" style={{ width: `${movie.progress}%`, background: movie.accentColor }} />
          </div>
        )}
      </div>
    </div>
  );
}
