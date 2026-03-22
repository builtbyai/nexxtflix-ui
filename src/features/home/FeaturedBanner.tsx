
import React from 'react';
import './FeaturedBanner.css';
import { Movie } from '../../types';

interface Props {
  movie: Movie;
  onPlay: () => void;
  onClick: () => void;
}

export default function FeaturedBanner({ movie, onPlay, onClick }: Props) {
  return (
    <div className="featured-banner" onClick={onClick}>
      <div className="featured-banner__bg" style={{ background: movie.gradient }} />
      <div className="featured-banner__content">
        <div className="featured-banner__meta">
          <span className="featured-badge">FEATURED</span>
          <span className="featured-meta-text">{movie.genre} • {movie.year}</span>
        </div>
        <h1 className="featured-banner__title">{movie.title}</h1>
        <p className="featured-banner__desc">{movie.description}</p>
        <button className="featured-play-btn" onClick={e => { e.stopPropagation(); onPlay(); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Play Now
        </button>
      </div>
    </div>
  );
}
