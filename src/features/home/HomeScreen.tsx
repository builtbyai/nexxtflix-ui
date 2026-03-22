
import React, { useState, useEffect } from 'react';
import './HomeScreen.css';
import { Movie } from '../../types';
import { MOVIES, FEATURED_MOVIE, RECOMMENDED, CONTINUE_WATCHING, TRENDING, NEW_RELEASES } from '../../data/movies';
import MovieCard from '../../components/MovieCard';
import SectionHeader from '../../components/SectionHeader';
import FeaturedBanner from './FeaturedBanner';
import HeroPlayer from './HeroPlayer';

interface Props {
  onMovieClick: (m: Movie) => void;
  onPlayClick: (m: Movie) => void;
}

export default function HomeScreen({ onMovieClick, onPlayClick }: Props) {
  const [showPlayer, setShowPlayer] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (d: Date) => {
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
    const h12 = d.getHours() % 12 || 12;
    return `${h12.toString().padStart(2,'0')}:${m} ${ampm}`;
  };

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

      {/* Hero Player */}
      <HeroPlayer
        movie={FEATURED_MOVIE}
        onMovieClick={onMovieClick}
        onPlayClick={onPlayClick}
      />

      {/* Sections */}
      <div className="home-sections">
        <div className="home-section">
          <SectionHeader title="Recommended for you" onSeeAll={() => {}} />
          <div className="home-scroll-row">
            {RECOMMENDED.map(m => (
              <MovieCard key={m.id} movie={m} onClick={onMovieClick} size="md" />
            ))}
          </div>
        </div>

        <div className="home-section">
          <SectionHeader title="Continue Watching" onSeeAll={() => {}} />
          <div className="home-scroll-row">
            {CONTINUE_WATCHING.map(m => (
              <MovieCard key={m.id} movie={m} onClick={onMovieClick} size="md" showProgress />
            ))}
          </div>
        </div>

        <div className="home-section">
          <SectionHeader title="Trending Now" onSeeAll={() => {}} />
          <div className="home-scroll-row">
            {TRENDING.map((m, i) => (
              <div key={m.id} className="trending-item">
                <span className="trending-num">{i + 1}</span>
                <MovieCard movie={m} onClick={onMovieClick} size="md" />
              </div>
            ))}
          </div>
        </div>

        <div className="home-section">
          <SectionHeader title="New Releases" onSeeAll={() => {}} />
          <div className="home-scroll-row">
            {NEW_RELEASES.map(m => (
              <MovieCard key={m.id} movie={m} onClick={onMovieClick} size="lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
