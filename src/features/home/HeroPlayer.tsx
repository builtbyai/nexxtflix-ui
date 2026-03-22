
import React, { useState, useEffect, useRef } from 'react';
import './HeroPlayer.css';
import { Movie } from '../../types';

interface Props {
  movie: Movie;
  onMovieClick: (m: Movie) => void;
  onPlayClick: (m: Movie) => void;
}

export default function HeroPlayer({ movie, onMovieClick, onPlayClick }: Props) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(movie.progress || 46);
  const [showSkipIntro, setShowSkipIntro] = useState(true);
  const [skippedIntro, setSkippedIntro] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(p => Math.min(p + 0.05, 100));
      }, 300);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  const totalSecs = 9010;
  const currentSecs = Math.floor((progress / 100) * totalSecs);
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  return (
    <div className="hero-player" onClick={() => onMovieClick(movie)}>
      <div className="hero-player__screen" style={{ background: movie.gradient }}>
        {/* Cinematic elements */}
        <div className="hero-player__stars">
          {Array.from({length: 20}).map((_, i) => (
            <div key={i} className="hero-star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
            }} />
          ))}
        </div>
        <div className="hero-player__planet" />
        <div className="hero-player__glow" style={{ background: movie.accentColor }} />

        {/* Title */}
        <div className="hero-player__title">{movie.title}</div>

        {/* Center controls */}
        <div className="hero-player__center" onClick={e => e.stopPropagation()}>
          {showSkipIntro && !skippedIntro && (
            <button className="skip-intro-btn" onClick={(e) => { e.stopPropagation(); setSkippedIntro(true); setShowSkipIntro(false); setProgress(p => Math.min(p + 15, 100)); }}>
              Skip Intro
            </button>
          )}
          <button
            className="hero-play-btn"
            onClick={(e) => { e.stopPropagation(); setIsPlaying(p => !p); }}
          >
            {isPlaying ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            )}
          </button>
        </div>

        {/* Bottom controls */}
        <div className="hero-player__controls" onClick={e => e.stopPropagation()}>
          <div className="hero-progress">
            <div
              className="hero-progress__fill"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, #ef4444, ${movie.accentColor})` }}
            />
            <div className="hero-progress__thumb" style={{ left: `${progress}%`, background: movie.accentColor }} />
          </div>
          <div className="hero-time-row">
            <div className="hero-time-left">
              <button className="hero-mini-btn" onClick={() => setIsPlaying(p => !p)}>
                {isPlaying ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                )}
              </button>
              <span className="hero-time-text">{formatTime(currentSecs)} AM</span>
            </div>
            <div className="hero-time-right">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              <span className="hero-time-text">{movie.duration}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
