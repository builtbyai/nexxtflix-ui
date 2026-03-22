
import React, { useState } from 'react';
import './DownloadsScreen.css';
import { Movie } from '../../types';
import { MOVIES } from '../../data/movies';

interface Props {
  onMovieClick: (m: Movie) => void;
}

interface Download {
  movie: Movie;
  progress: number;
  size: string;
  quality: string;
  status: 'downloading' | 'complete' | 'paused';
}

const DOWNLOADS: Download[] = [
  { movie: MOVIES[0], progress: 100, size: '2.4 GB', quality: '4K HDR', status: 'complete' },
  { movie: MOVIES[4], progress: 100, size: '1.8 GB', quality: '1080p', status: 'complete' },
  { movie: MOVIES[5], progress: 67, size: '890 MB', quality: '720p', status: 'downloading' },
  { movie: MOVIES[1], progress: 34, size: '3.1 GB', quality: '4K', status: 'paused' },
];

export default function DownloadsScreen({ onMovieClick }: Props) {
  const [downloads, setDownloads] = useState<Download[]>(DOWNLOADS);

  const totalSize = '5.09 GB';
  const complete = downloads.filter(d => d.status === 'complete').length;

  const togglePause = (i: number) => {
    setDownloads(prev => prev.map((d, idx) => {
      if (idx !== i) return d;
      if (d.status === 'paused') return { ...d, status: 'downloading' };
      if (d.status === 'downloading') return { ...d, status: 'paused' };
      return d;
    }));
  };

  const removeDownload = (i: number) => {
    setDownloads(prev => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="downloads-screen">
      <div className="downloads-header">
        <h1 className="downloads-title">Downloads</h1>
        <div className="downloads-stats">
          <div className="dl-stat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>{downloads.length} titles</span>
          </div>
          <div className="dl-stat-dot" />
          <div className="dl-stat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <span>{totalSize} used</span>
          </div>
        </div>

        {/* Storage bar */}
        <div className="storage-bar-section">
          <div className="storage-bar">
            <div className="storage-bar__fill" style={{ width: '32%' }} />
          </div>
          <div className="storage-bar-label">
            <span>5.09 GB of 16 GB used</span>
            <span>{complete} completed</span>
          </div>
        </div>
      </div>

      {/* Download list */}
      <div className="downloads-list">
        {downloads.length === 0 ? (
          <div className="downloads-empty">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <p>No downloads yet</p>
            <span>Download titles to watch offline</span>
          </div>
        ) : (
          downloads.map((d, i) => (
            <div key={d.movie.id} className="download-item" onClick={() => onMovieClick(d.movie)}>
              <div className="download-thumb" style={{ background: d.movie.gradient }}>
                <div className="download-thumb__glow" style={{ background: d.movie.accentColor }} />
                <div className="download-thumb__fig" />
                {d.status === 'complete' && (
                  <div className="download-thumb__check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="download-info">
                <div className="download-info__top">
                  <span className="download-movie-title">{d.movie.title}</span>
                  <div className="download-badges">
                    <span className="download-quality" style={{ borderColor: `${d.movie.accentColor}44`, color: d.movie.accentColor }}>
                      {d.quality}
                    </span>
                    <span className={`download-status download-status--${d.status}`}>
                      {d.status === 'complete' ? 'Ready' : d.status === 'downloading' ? 'Downloading' : 'Paused'}
                    </span>
                  </div>
                </div>
                <span className="download-meta">{d.movie.genre} • {d.size}</span>
                {d.status !== 'complete' && (
                  <div className="download-progress-bar">
                    <div
                      className="download-progress-fill"
                      style={{ width: `${d.progress}%`, background: d.movie.accentColor }}
                    />
                  </div>
                )}
                {d.status !== 'complete' && (
                  <span className="download-pct">{d.progress}%</span>
                )}
              </div>
              <div className="download-actions" onClick={e => e.stopPropagation()}>
                {d.status !== 'complete' && (
                  <button className="dl-action-btn" onClick={() => togglePause(i)}>
                    {d.status === 'downloading' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                        <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    )}
                  </button>
                )}
                <button className="dl-action-btn dl-action-btn--remove" onClick={() => removeDownload(i)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Smart Download section */}
      <div className="smart-download">
        <div className="smart-download__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <div className="smart-download__text">
          <span className="smart-download__title">Smart Downloads</span>
          <span className="smart-download__sub">Automatically download your next episode</span>
        </div>
        <div className="toggle-switch toggle-switch--on">
          <div className="toggle-thumb" />
        </div>
      </div>
    </div>
  );
}
