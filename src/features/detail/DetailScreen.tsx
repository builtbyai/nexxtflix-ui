
import React, { useState } from 'react';
import './DetailScreen.css';
import { Movie } from '../../types';
import { MOVIES } from '../../data/movies';
import MovieCard from '../../components/MovieCard';
import SectionHeader from '../../components/SectionHeader';

interface Props {
  movie: Movie;
  onBack: () => void;
  onPlay: () => void;
  onMovieClick: (m: Movie) => void;
}

export default function DetailScreen({ movie, onBack, onPlay, onMovieClick }: Props) {
  const [isInList, setIsInList] = useState(false);
  const [liked, setLiked] = useState(false);

  const similar = MOVIES.filter(m => m.id !== movie.id).slice(0, 6);

  const CAST = [
    { name: 'Alex Varon', role: 'Lead', color: '#6366f1' },
    { name: 'Maria Chen', role: 'Co-Lead', color: '#8b5cf6' },
    { name: 'Duke Evans', role: 'Villain', color: '#ec4899' },
    { name: 'Senna Rios', role: 'Support', color: '#f59e0b' },
  ];

  return (
    <div className="detail-screen">
      {/* Hero */}
      <div className="detail-hero" style={{ background: movie.gradient }}>
        <div className="detail-hero__overlay" />
        <div className="detail-hero__glow" style={{ background: movie.accentColor }} />
        <div className="detail-hero__figure" />

        <div className="detail-hero__top">
          <button className="detail-back-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="detail-hero__actions">
            <button className={`detail-action-btn ${liked ? 'detail-action-btn--active' : ''}`} onClick={() => setLiked(l => !l)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : 'white'} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <button className="detail-action-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Play button overlay */}
        <div className="detail-hero__center">
          <button className="detail-play-fab" onClick={onPlay} style={{ borderColor: movie.accentColor }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
        </div>

        {/* Meta bottom */}
        <div className="detail-hero__bottom">
          <div className="detail-meta-row">
            <span className="detail-badge" style={{ background: movie.accentColor }}>HD</span>
            {movie.isSeries && <span className="detail-badge detail-badge--series">SERIES</span>}
            <span className="detail-year">{movie.year}</span>
            <span className="detail-rating-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {movie.rating}
            </span>
            <span className="detail-duration">{movie.duration}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="detail-content">
        <h1 className="detail-title">{movie.title}</h1>
        <p className="detail-genre">{movie.genre}</p>

        {movie.isSeries && (
          <div className="detail-series-info">
            <div className="detail-stat">
              <span className="detail-stat__num">{movie.seasons}</span>
              <span className="detail-stat__label">Seasons</span>
            </div>
            <div className="detail-stat-divider" />
            <div className="detail-stat">
              <span className="detail-stat__num">{movie.episodes}</span>
              <span className="detail-stat__label">Episodes</span>
            </div>
            <div className="detail-stat-divider" />
            <div className="detail-stat">
              <span className="detail-stat__num">{movie.rating}</span>
              <span className="detail-stat__label">Rating</span>
            </div>
          </div>
        )}

        <p className="detail-desc">{movie.description}</p>

        {/* Action Buttons */}
        <div className="detail-buttons">
          <button className="detail-play-btn" onClick={onPlay} style={{ background: movie.accentColor }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            {movie.progress && movie.progress > 0 ? 'Continue Watching' : 'Play Now'}
          </button>
          <button className={`detail-list-btn ${isInList ? 'detail-list-btn--added' : ''}`} onClick={() => setIsInList(l => !l)}
            style={{ borderColor: isInList ? movie.accentColor : 'rgba(255,255,255,0.2)', color: isInList ? movie.accentColor : 'white' }}>
            {isInList ? (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill={movie.accentColor}><polyline points="20 6 9 17 4 12"/></svg> Added</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> My List</>
            )}
          </button>
          <button className="detail-download-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>

        {/* Progress if watching */}
        {movie.progress && movie.progress > 0 ? (
          <div className="detail-progress-section">
            <div className="detail-progress-bar">
              <div className="detail-progress-fill" style={{ width: `${movie.progress}%`, background: movie.accentColor }} />
            </div>
            <span className="detail-progress-label">{movie.progress}% watched</span>
          </div>
        ) : null}

        {/* Cast */}
        <div className="detail-section">
          <h3 className="detail-section-title">Cast</h3>
          <div className="detail-cast">
            {CAST.map((c, i) => (
              <div key={i} className="cast-item">
                <div className="cast-avatar" style={{ background: `linear-gradient(135deg, ${c.color}33, ${c.color}66)`, borderColor: `${c.color}44` }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span className="cast-name">{c.name}</span>
                <span className="cast-role">{c.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Similar */}
        <div className="detail-section" style={{ marginBottom: 8 }}>
          <SectionHeader title="More Like This" />
          <div className="detail-movies-row">
            {similar.map(m => (
              <MovieCard key={m.id} movie={m} onClick={onMovieClick} size="md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
