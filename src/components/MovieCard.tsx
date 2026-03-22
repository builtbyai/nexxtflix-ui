
import React from 'react';
import './MovieCard.css';
import { Movie } from '../types';

interface Props {
  movie: Movie;
  onClick: (m: Movie) => void;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export default function MovieCard({ movie, onClick, size = 'md', showProgress = false }: Props) {
  return (
    <div className={`movie-card movie-card--${size}`} onClick={() => onClick(movie)}>
      <div className="movie-card__poster" style={{ background: movie.gradient }}>
        <div className="movie-card__overlay" />
        <div className="movie-card__title-overlay">
          <span className="movie-card__title-text">{movie.title}</span>
        </div>
        {movie.isSeries && <div className="movie-card__badge">SERIES</div>}
        <div className="movie-card__rating">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>{movie.rating}</span>
        </div>
        <div className="movie-card__shimmer" />
        {/* Gradient accent elements */}
        <div className="movie-card__orb" style={{ background: movie.accentColor }} />
        <div className="movie-card__figure" />
      </div>
      {showProgress && movie.progress && movie.progress > 0 && (
        <div className="movie-card__progress-bar">
          <div className="movie-card__progress-fill" style={{
            width: `${movie.progress}%`,
            background: movie.accentColor,
          }} />
        </div>
      )}
    </div>
  );
}
