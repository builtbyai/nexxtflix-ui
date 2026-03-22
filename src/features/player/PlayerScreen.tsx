
import React, { useState, useEffect, useRef } from 'react';
import './PlayerScreen.css';
import { Movie } from '../../types';
import { MOVIES } from '../../data/movies';
import MovieCard from '../../components/MovieCard';
import SectionHeader from '../../components/SectionHeader';

interface Props {
  movie: Movie;
  onBack: () => void;
  onMovieClick: (m: Movie) => void;
}

const EPISODES = [
  { title: 'Season 2 Episode 4', label: 'S2 E4', active: true },
  { title: 'CF Mote 3', label: 'CF3', active: false },
  { title: 'The Temporal Rifts', label: 'TRifts', active: false },
  { title: 'The Temporal Rift', label: 'TRift', active: false },
  { title: 'Trailers', label: 'Trailers', active: false },
];

export default function PlayerScreen({ movie, onBack, onMovieClick }: Props) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(8.7);
  const [volume, setVolume] = useState(0.8);
  const [showControls, setShowControls] = useState(true);
  const [activeEp, setActiveEp] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<any>(null);

  const totalSecs = 947;
  const currentSecs = Math.floor((progress / 100) * totalSecs);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  useEffect(() => {
    if (isPlaying && !isDragging) {
      const t = setInterval(() => setProgress(p => Math.min(p + 0.02, 100)), 200);
      return () => clearInterval(t);
    }
  }, [isPlaying, isDragging]);

  const resetHideTimer = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setProgress(pct);
    resetHideTimer();
  };

  const moreLike = MOVIES.filter(m => m.id !== movie.id).slice(0, 6);

  return (
    <div className="player-screen">
      {/* Header */}
      <div className="player-header">
        <button className="player-back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 className="player-title">{movie.title}</h1>
        <div className="player-header-actions">
          <button className="player-icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
          </button>
          <button className="player-icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Video Area */}
      <div
        className="player-video"
        style={{ background: movie.gradient }}
        onClick={() => { setIsPlaying(p => !p); resetHideTimer(); }}
      >
        <div className="player-video__cinematic" />

        {/* Settings icon */}
        <button className="player-settings-btn" onClick={e => e.stopPropagation()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93A10 10 0 1 0 4.93 19.07 10 10 0 0 0 19.07 4.93z" opacity="0"/>
            <path d="M12 2v2m0 18v-2m8-8h-2M4 12H2m13.66-5.66-1.41 1.41M7.76 16.24l-1.41 1.41M18.36 16.24l-1.41-1.41M7.76 7.76 6.34 6.34"/>
          </svg>
        </button>

        {/* Center play button */}
        <div className={`player-center-controls ${showControls ? 'visible' : ''}`}>
          <button className="player-main-play">
            {isPlaying ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            )}
          </button>
        </div>

        {/* Player overlay gradient */}
        <div className="player-video__gradient-figure" style={{ background: movie.accentColor }} />
      </div>

      {/* Progress & Controls */}
      <div className="player-controls-bar">
        <div className="player-time-display">
          <span>{formatTime(currentSecs)}</span>
          <span style={{ color: '#6b7280' }}>/ {formatTime(totalSecs)}</span>
        </div>

        <div
          className="player-progress-track"
          ref={progressRef}
          onClick={handleProgressClick}
        >
          <div className="player-progress-buffer" style={{ width: `${Math.min(progress + 15, 100)}%` }} />
          <div
            className="player-progress-fill"
            style={{ width: `${progress}%`, background: movie.accentColor }}
          />
          <div
            className="player-progress-thumb"
            style={{ left: `${progress}%`, background: movie.accentColor }}
          />
        </div>

        <div className="player-buttons-row">
          <button className="player-ctrl-btn" onClick={() => setIsPlaying(p => !p)}>
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            )}
          </button>
          <button className="player-ctrl-btn" onClick={() => setProgress(p => Math.max(0, p - 5))}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/>
            </svg>
          </button>
          <button className="player-ctrl-btn" onClick={() => setProgress(p => Math.max(0, p - 10))}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="19 20 9 12 19 4"/><line x1="5" y1="19" x2="5" y2="5"/>
            </svg>
          </button>
          <button className="player-ctrl-btn player-ctrl-btn--main" onClick={() => setIsPlaying(p => !p)}>
            {isPlaying ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            )}
          </button>
          <button className="player-ctrl-btn" onClick={() => setProgress(p => Math.min(100, p + 10))}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="5 4 15 12 5 20"/><line x1="19" y1="5" x2="19" y2="19"/>
            </svg>
          </button>
          <button className="player-ctrl-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v2m0 18v-2m8-8h-2M4 12H2"/>
            </svg>
          </button>
          <button className="player-ctrl-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Next Episode */}
      <div className="player-section">
        <SectionHeader title="Next Episode" />
        <div className="episodes-scroll">
          {EPISODES.map((ep, i) => (
            <div
              key={i}
              className={`episode-item ${activeEp === i ? 'episode-item--active' : ''}`}
              onClick={() => setActiveEp(i)}
            >
              <div
                className="episode-thumb"
                style={{
                  background: `linear-gradient(135deg, ${['#1a1a2e','#2d1b69','#0f3460','#1e3c72','#3d2314'][i % 5]}, ${['#16213e','#11052c','#533483','#2a5298','#7c3626'][i % 5]})`,
                  borderColor: activeEp === i ? movie.accentColor : 'transparent',
                }}
              >
                <div className="episode-thumb__figure" />
                {activeEp === i && <div className="episode-playing-dot" style={{ background: movie.accentColor }} />}
              </div>
              <span className="episode-label">{ep.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* More Like This */}
      <div className="player-section">
        <SectionHeader title="More Like This" />
        <div className="player-movies-row">
          {moreLike.map(m => (
            <MovieCard key={m.id} movie={m} onClick={onMovieClick} size="lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
