
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './DownloadsScreen.css';
import { Movie } from '../../types';
import { fetchRDUser, rdGetTorrents, rdAddMagnet, rdSelectFiles, rdUnrestrict, rdGetLinks } from '../../utils/api';

interface RDTorrent {
  id: string;
  filename: string;
  bytes: number;
  status: string;
  progress: number;
  links: string[];
  host?: string;
  added?: string;
  speed?: number;
  seeders?: number;
}

interface Props {
  onMovieClick: (m: Movie) => void;
  onPlayClick: (m: Movie) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    downloaded: 'Ready',
    downloading: 'Downloading',
    magnet_conversion: 'Converting...',
    waiting_files_selection: 'Select Files',
    queued: 'Queued',
    uploading: 'Uploading',
    compressing: 'Compressing',
    magnet_error: 'Error',
    error: 'Error',
    dead: 'Dead',
    virus: 'Virus Detected',
  };
  return map[status] || status;
}

function statusClass(status: string): string {
  if (status === 'downloaded') return 'complete';
  if (status === 'downloading') return 'downloading';
  if (status === 'queued') return 'paused';
  if (status === 'magnet_conversion' || status === 'waiting_files_selection') return 'caching';
  if (status === 'error' || status === 'magnet_error' || status === 'dead' || status === 'virus') return 'error';
  return 'caching';
}

export default function DownloadsScreen({ onMovieClick, onPlayClick }: Props) {
  const [torrents, setTorrents] = useState<RDTorrent[]>([]);
  const [rdUser, setRdUser] = useState<any>(null);
  const [smartDownloads, setSmartDownloads] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showMagnetInput, setShowMagnetInput] = useState(false);
  const [magnetLink, setMagnetLink] = useState('');
  const [caching, setCaching] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadTorrents = useCallback(async () => {
    try {
      const data = await rdGetTorrents();
      if (Array.isArray(data)) {
        setTorrents(data);
      }
    } catch (e) {
      console.error('Failed to load RD torrents:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRDUser().then(data => {
      if (data?.user) setRdUser(data.user);
    });
    loadTorrents();

    intervalRef.current = setInterval(loadTorrents, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadTorrents]);

  const handleAddMagnet = async () => {
    if (!magnetLink.trim()) return;
    setCaching(true);
    try {
      const result = await rdAddMagnet(magnetLink.trim());
      if (result?.id) {
        await rdSelectFiles(result.id);
      }
      setMagnetLink('');
      setShowMagnetInput(false);
      await loadTorrents();
    } catch (e) {
      console.error('Failed to add magnet:', e);
    } finally {
      setCaching(false);
    }
  };

  const handlePlay = async (torrent: RDTorrent) => {
    if (torrent.status !== 'downloaded' || !torrent.links?.length) return;
    setPlayingId(torrent.id);
    try {
      const unrestricted = await rdUnrestrict(torrent.links[0]);
      if (unrestricted?.download) {
        const movie: Movie = {
          id: `rd-${torrent.id}`,
          title: torrent.filename,
          genre: 'Download',
          year: new Date().getFullYear(),
          rating: 'RD',
          duration: formatBytes(torrent.bytes),
          description: `Real-Debrid cached torrent: ${torrent.filename}`,
          gradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
          accentColor: '#10b981',
          streams: [{ name: 'RD Stream', title: torrent.filename, url: unrestricted.download }],
        };
        onPlayClick(movie);
      }
    } catch (e) {
      console.error('Failed to unrestrict link:', e);
    } finally {
      setPlayingId(null);
    }
  };

  const handleSelectFiles = async (torrent: RDTorrent) => {
    try {
      await rdSelectFiles(torrent.id);
      await loadTorrents();
    } catch (e) {
      console.error('Failed to select files:', e);
    }
  };

  const totalSize = torrents.reduce((acc, t) => acc + (t.bytes || 0), 0);
  const completedCount = torrents.filter(t => t.status === 'downloaded').length;

  return (
    <div className="downloads-screen">
      <div className="downloads-header">
        <div>
          <h1 className="downloads-title">Downloads</h1>
          <p className="downloads-subtitle">
            {torrents.length} items {completedCount > 0 && `\u2022 ${completedCount} ready`} {'\u2022'} {formatBytes(totalSize)}
          </p>
        </div>
        {rdUser && (
          <div className="rd-status">
            <span className="rd-badge">RD Premium</span>
            <span className="rd-expires">Exp: {rdUser.expiration?.split('T')[0] || 'Active'}</span>
          </div>
        )}
      </div>

      <div className="downloads-storage">
        <div className="storage-bar">
          <div className="storage-fill" style={{ width: `${Math.min(100, (totalSize / (500 * 1024 * 1024 * 1024)) * 100)}%` }} />
        </div>
        <div className="storage-labels">
          <span>{formatBytes(totalSize)} cached</span>
          <span>{rdUser?.username || 'Not connected'}</span>
        </div>
      </div>

      {/* Cache Torrent Button */}
      <div className="downloads-actions">
        <button
          className="cache-torrent-btn"
          onClick={() => setShowMagnetInput(!showMagnetInput)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Cache Torrent
        </button>
      </div>

      {showMagnetInput && (
        <div className="magnet-input-container">
          <input
            type="text"
            className="magnet-input"
            placeholder="Paste magnet link here..."
            value={magnetLink}
            onChange={e => setMagnetLink(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddMagnet()}
            autoFocus
          />
          <button
            className="magnet-submit"
            onClick={handleAddMagnet}
            disabled={caching || !magnetLink.trim()}
          >
            {caching ? (
              <div className="magnet-spinner" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Torrent List */}
      {loading ? (
        <div className="downloads-empty">
          <div className="dl-loading-pulse" />
          <p>Loading Real-Debrid torrents...</p>
        </div>
      ) : torrents.length === 0 ? (
        <div className="downloads-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <h3>No Downloads Yet</h3>
          <p>Paste a magnet link above to cache torrents via Real-Debrid</p>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
            {rdUser ? `Real-Debrid: ${rdUser.username} (Premium)` : 'Real-Debrid not connected'}
          </p>
        </div>
      ) : (
        <div className="downloads-list">
          {torrents.map(torrent => (
            <div key={torrent.id} className="download-item">
              <div className="dl-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={torrent.status === 'downloaded' ? '#10b981' : '#8b5cf6'} strokeWidth="2">
                  {torrent.status === 'downloaded' ? (
                    <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                  ) : (
                    <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>
                  )}
                </svg>
              </div>
              <div className="download-info">
                <span className="download-name">{torrent.filename}</span>
                <div className="download-meta">
                  <span className="download-size">{formatBytes(torrent.bytes)}</span>
                  <span className={`download-status download-status--${statusClass(torrent.status)}`}>
                    {statusLabel(torrent.status)}
                  </span>
                  {torrent.seeders !== undefined && torrent.seeders > 0 && (
                    <span className="download-seeders">{torrent.seeders} seeds</span>
                  )}
                </div>
                {torrent.status === 'downloading' && (
                  <div className="download-progress">
                    <div className="download-progress-fill" style={{ width: `${torrent.progress}%` }} />
                  </div>
                )}
                {torrent.status === 'downloading' && (
                  <span className="download-percent">{torrent.progress}%{torrent.speed ? ` \u2022 ${formatBytes(torrent.speed)}/s` : ''}</span>
                )}
              </div>
              <div className="download-actions">
                {torrent.status === 'downloaded' && torrent.links?.length > 0 && (
                  <button
                    className="dl-play-btn"
                    onClick={() => handlePlay(torrent)}
                    disabled={playingId === torrent.id}
                  >
                    {playingId === torrent.id ? (
                      <div className="magnet-spinner" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    )}
                  </button>
                )}
                {torrent.status === 'waiting_files_selection' && (
                  <button className="dl-select-btn" onClick={() => handleSelectFiles(torrent)}>
                    Select
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="downloads-smart">
        <div className="smart-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div className="smart-info">
          <span className="smart-title">Smart Downloads</span>
          <span className="smart-desc">Auto-cache next episodes via Real-Debrid</span>
        </div>
        <button className={`smart-toggle ${smartDownloads ? 'smart-toggle--on' : ''}`} onClick={() => setSmartDownloads(s => !s)}>
          <div className="smart-toggle-thumb" />
        </button>
      </div>
    </div>
  );
}
