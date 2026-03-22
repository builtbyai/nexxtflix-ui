
import React, { useState, useEffect, useRef } from 'react';
import './PlayerScreen.css';
import { Movie, Stream } from '../../types';
import {
  embyStreamUrl, getTorrentStreamUrl,
  search1337xWithMagnets,
  rdAddMagnet, rdSelectFiles, rdGetLinks, rdUnrestrict,
} from '../../utils/api';
import SectionHeader from '../../components/SectionHeader';

interface Props {
  movie: Movie;
  onBack: () => void;
  onMovieClick: (m: Movie) => void;
}

export default function PlayerScreen({ movie, onBack, onMovieClick }: Props) {
  const [streams, setStreams] = useState<Stream[]>(movie.streams || []);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStreamPicker, setShowStreamPicker] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState('');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<any>(null);

  useEffect(() => {
    if (streams.length === 0) {
      // Build streams from Emby + torrent search
      setLoadingStreams(true);
      const buildStreams = async () => {
        const found: Stream[] = [];

        // Emby direct stream
        if (movie._embyServer && movie._embyId) {
          const url = embyStreamUrl(movie._embyServer, movie._embyId);
          found.push({
            name: 'Emby Direct',
            title: `${movie.title} - Direct Stream`,
            url,
            quality: 'Original',
          });
        }

        // Search torrents
        try {
          const torrents = await search1337xWithMagnets(movie.title, 8);
          for (const t of torrents) {
            if (t.magnetUrl || t.infoHash) {
              found.push({
                name: '1337x',
                title: t.name,
                url: t.magnetUrl ? getTorrentStreamUrl(t.magnetUrl) : undefined,
                infoHash: t.infoHash,
                _seeds: t.seeds,
                _size: t.size,
              });
            }
          }
        } catch {}

        setStreams(found);
        setLoadingStreams(false);
        if (found.length > 0) {
          selectStream(found[0]);
        }
      };
      buildStreams();
    } else if (streams.length > 0 && !selectedStream) {
      selectStream(streams[0]);
    }
  }, []);

  const [rdStatus, setRdStatus] = useState('');

  const playUrl = (url: string) => {
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const resolveViaRD = async (magnetUrl: string) => {
    try {
      setRdStatus('Sending to Real-Debrid...');
      const { id } = await rdAddMagnet(magnetUrl);
      if (!id) throw new Error('Failed to add magnet');

      setRdStatus('Selecting files...');
      await rdSelectFiles(id);

      setRdStatus('Waiting for cache...');
      let attempts = 0;
      let links: string[] = [];
      while (attempts < 20) {
        await new Promise(r => setTimeout(r, 2000));
        const info = await rdGetLinks(id);
        if (info?.links?.length > 0) {
          links = info.links;
          break;
        }
        if (info?.status === 'downloaded' && info?.links?.length > 0) {
          links = info.links;
          break;
        }
        attempts++;
        setRdStatus(`Caching... (${attempts * 2}s)`);
      }

      if (links.length === 0) throw new Error('Torrent not cached after timeout');

      setRdStatus('Getting download link...');
      const result = await rdUnrestrict(links[0]);
      if (!result?.download) throw new Error('Failed to unrestrict link');

      setRdStatus('');
      setLoadingStreams(false);
      playUrl(result.download);
    } catch (err: any) {
      setRdStatus('');
      setLoadingStreams(false);
      setVideoError(err?.message || 'Real-Debrid caching failed');
    }
  };

  const selectStream = (stream: Stream) => {
    setSelectedStream(stream);
    setVideoError('');
    setRdStatus('');
    setShowStreamPicker(false);

    // Emby or direct HTTP streams — play directly
    if (stream.url && !stream.url.includes('/api/stream/torrent')) {
      playUrl(stream.url);
      return;
    }

    // Torrent streams — resolve via Real-Debrid
    let magnet: string | null = null;

    // 1. Check stream.magnetUrl directly
    if (stream.magnetUrl) {
      magnet = stream.magnetUrl;
    }
    // 2. Extract magnet from encoded torrent stream URL
    else if (stream.url?.includes('/api/stream/torrent') && stream.url.includes('magnet=')) {
      magnet = decodeURIComponent(stream.url.split('magnet=')[1] || '');
    }
    // 3. Construct from infoHash
    else if (stream.infoHash) {
      magnet = `magnet:?xt=urn:btih:${stream.infoHash}`;
    }

    if (magnet) {
      setLoadingStreams(true);
      resolveViaRD(magnet);
    } else {
      setVideoError('No playable source found');
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seek = (delta: number) => {
    if (!videoRef.current || !isFinite(videoRef.current.duration)) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + delta));
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setProgress(videoRef.current.currentTime);
    setDuration(videoRef.current.duration || 0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !isFinite(videoRef.current.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  const resetHideTimer = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '00:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
  };

  const toggleFullscreen = () => {
    const el = document.querySelector('.player-screen');
    if (el) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        el.requestFullscreen();
      }
    }
  };

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="player-screen" onMouseMove={resetHideTimer} onClick={resetHideTimer}>
      {/* Header */}
      <div className={`player-header ${showControls ? 'visible' : ''}`}>
        <button className="player-back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 className="player-title">{movie.title}</h1>
        <div className="player-header-actions">
          <button className="player-icon-btn" onClick={() => setShowStreamPicker(s => !s)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
            </svg>
          </button>
          <button className="player-icon-btn" onClick={toggleFullscreen}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Video Area */}
      <div className="player-video" onClick={togglePlay}>
        <video
          ref={videoRef}
          className="player-video-element"
          onTimeUpdate={handleTimeUpdate}
          onError={() => { if (!loadingStreams) setVideoError('Failed to load stream. Try another source.'); }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
        />

        {/* Fallback gradient background when no video loaded */}
        {!selectedStream && (
          <div className="player-video__fallback" style={{ background: movie.gradient }}>
            <div className="player-video__cinematic" />
            {movie.poster && <img src={movie.poster} alt="" className="player-poster-bg" />}
          </div>
        )}

        {/* Center play button */}
        <div className={`player-center-controls ${showControls ? 'visible' : ''}`}>
          {loadingStreams ? (
            <div className="player-loading">
              <div className="search-spinner" />
              <span>{rdStatus || 'Finding streams...'}</span>
            </div>
          ) : videoError ? (
            <div className="player-error">
              <p>{videoError}</p>
              <button onClick={(e) => { e.stopPropagation(); setShowStreamPicker(true); }}>Try another stream</button>
            </div>
          ) : (
            <button className="player-main-play" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
              {isPlaying ? (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress & Controls */}
      <div className={`player-controls-bar ${showControls ? 'visible' : ''}`}>
        <div className="player-time-display">
          <span>{formatTime(progress)}</span>
          <span style={{ color: '#6b7280' }}>/ {formatTime(duration)}</span>
        </div>

        <div className="player-progress-track" onClick={handleProgressClick}>
          <div className="player-progress-fill" style={{ width: `${progressPct}%`, background: movie.accentColor }} />
          <div className="player-progress-thumb" style={{ left: `${progressPct}%`, background: movie.accentColor }} />
        </div>

        <div className="player-buttons-row">
          <button className="player-ctrl-btn" onClick={togglePlay}>
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            )}
          </button>
          <button className="player-ctrl-btn" onClick={() => seek(-10)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/>
            </svg>
          </button>
          <button className="player-ctrl-btn player-ctrl-btn--main" onClick={togglePlay}>
            {isPlaying ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            )}
          </button>
          <button className="player-ctrl-btn" onClick={() => seek(10)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 1 0 21 12"/>
            </svg>
          </button>
          <button className="player-ctrl-btn" onClick={toggleFullscreen}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Stream Picker */}
      {showStreamPicker && (
        <div className="stream-picker">
          <div className="stream-picker-header">
            <h3>Select Stream</h3>
            <button onClick={() => setShowStreamPicker(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          {loadingStreams && <div className="stream-picker-loading"><div className="search-spinner" /> Loading...</div>}
          {streams.length === 0 && !loadingStreams && <p style={{ color: '#94a3b8', padding: 16 }}>No streams available</p>}
          <div className="stream-picker-list">
            {streams.map((s, i) => (
              <div
                key={i}
                className={`stream-picker-item ${selectedStream === s ? 'stream-picker-item--active' : ''}`}
                onClick={() => selectStream(s)}
              >
                <div className="stream-picker-info">
                  <span className="stream-picker-name">{s.name}</span>
                  <span className="stream-picker-title">{s.title}</span>
                </div>
                <div className="stream-picker-badges">
                  {s.quality && <span className="stream-quality">{s.quality}</span>}
                  {s._seeds && <span className="stream-seeds">{s._seeds}s</span>}
                  {s._size && <span className="stream-size">{s._size}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
