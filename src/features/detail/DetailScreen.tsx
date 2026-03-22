
import React, { useState, useEffect } from 'react';
import './DetailScreen.css';
import { Movie, Stream } from '../../types';
import {
  embyStreamUrl, embyFetchLibrary, embyItemToMovie,
  embyFetchSeasons, embyFetchEpisodes, embyImageUrl,
  search1337xWithMagnets, getTorrentStreamUrl,
} from '../../utils/api';
import type { EmbyItem } from '../../utils/api';
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
  const [streams, setStreams] = useState<Stream[]>(movie.streams || []);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [showStreams, setShowStreams] = useState(false);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [seasons, setSeasons] = useState<EmbyItem[]>([]);
  const [activeSeason, setActiveSeason] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<EmbyItem[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    // Load similar content from Emby
    if (movie._embyServer) {
      const type = movie.type === 'series' ? 'Series' : 'Movie';
      embyFetchLibrary(movie._embyServer, type, 20).then(items => {
        setSimilar(
          items
            .filter(item => item.Id !== movie._embyId)
            .slice(0, 6)
            .map(item => embyItemToMovie(item, movie._embyServer!))
        );
      });
    }
  }, [movie.id]);

  // Fetch seasons for series
  useEffect(() => {
    if (movie.isSeries && movie._embyServer && movie._embyId) {
      setLoadingSeasons(true);
      setSeasons([]);
      setEpisodes([]);
      setActiveSeason(null);
      embyFetchSeasons(movie._embyServer, movie._embyId).then(s => {
        setSeasons(s);
        setLoadingSeasons(false);
        if (s.length > 0) {
          const first = s[0];
          setActiveSeason(first.Id);
        }
      });
    }
  }, [movie.id]);

  // Fetch episodes when season changes
  useEffect(() => {
    if (activeSeason && movie._embyServer && movie._embyId) {
      setLoadingEpisodes(true);
      embyFetchEpisodes(movie._embyServer, movie._embyId, activeSeason).then(eps => {
        setEpisodes(eps);
        setLoadingEpisodes(false);
      });
    }
  }, [activeSeason]);

  const handleEpisodePlay = (episode: EmbyItem) => {
    if (movie._embyServer) {
      // Set the stream URL for this specific episode
      const url = embyStreamUrl(movie._embyServer, episode.Id);
      // Update movie streams with this episode's stream so onPlay picks it up
      const episodeStream = {
        name: 'Emby Direct',
        title: `${episode.SeriesName || movie.title} - S${episode.ParentIndexNumber || ''}E${episode.IndexNumber || ''} ${episode.Name}`,
        url,
        quality: 'Original',
      };
      movie.streams = [episodeStream];
      onPlay();
    }
  };

  const handleFetchStreams = async () => {
    if (streams.length > 0) {
      setShowStreams(!showStreams);
      return;
    }
    setLoadingStreams(true);
    setShowStreams(true);

    const foundStreams: Stream[] = [];

    // If it's an Emby item, add the direct stream
    if (movie._embyServer && movie._embyId) {
      const url = embyStreamUrl(movie._embyServer, movie._embyId);
      foundStreams.push({
        name: 'Emby Direct',
        title: `${movie.title} - Direct Stream`,
        url,
        quality: 'Original',
      });
    }

    // Also search torrents by title
    try {
      const torrents = await search1337xWithMagnets(movie.title, 10);
      for (const t of torrents) {
        if (t.magnetUrl || t.infoHash) {
          foundStreams.push({
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

    setStreams(foundStreams);
    setLoadingStreams(false);
  };

  return (
    <div className="detail-screen">
      {/* Hero */}
      <div className="detail-hero" style={{
        background: movie.poster
          ? `url(${movie.background || movie.poster}) center/cover no-repeat`
          : movie.gradient
      }}>
        <div className="detail-hero__overlay" />
        {!movie.poster && <div className="detail-hero__glow" style={{ background: movie.accentColor }} />}
        {!movie.poster && <div className="detail-hero__figure" />}

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

        <div className="detail-hero__center">
          <button className="detail-play-fab" onClick={onPlay} style={{ borderColor: movie.accentColor }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
        </div>

        <div className="detail-hero__bottom">
          <div className="detail-meta-row">
            <span className="detail-badge" style={{ background: movie.accentColor }}>HD</span>
            {movie.isSeries && <span className="detail-badge detail-badge--series">SERIES</span>}
            <span className="detail-year">{movie.year > 0 ? movie.year : ''}</span>
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
              <span className="detail-stat__num">{movie.seasons || '\u2014'}</span>
              <span className="detail-stat__label">Seasons</span>
            </div>
            <div className="detail-stat-divider" />
            <div className="detail-stat">
              <span className="detail-stat__num">{movie.episodes || '\u2014'}</span>
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

        {/* Episode Browser */}
        {movie.isSeries && movie._embyServer && movie._embyId && (
          <div className="episode-browser">
            <h3 className="detail-section-title">Episodes</h3>

            {/* Season Tabs */}
            {loadingSeasons ? (
              <div className="episode-browser__loading">Loading seasons...</div>
            ) : (
              <div className="season-tabs">
                {seasons.map(s => (
                  <button
                    key={s.Id}
                    className={`season-tab ${activeSeason === s.Id ? 'season-tab--active' : ''}`}
                    onClick={() => setActiveSeason(s.Id)}
                  >
                    {s.Name || `Season ${s.IndexNumber}`}
                  </button>
                ))}
              </div>
            )}

            {/* Episode List */}
            {loadingEpisodes ? (
              <div className="episode-browser__loading">Loading episodes...</div>
            ) : (
              <div className="episode-list">
                {episodes.map(ep => {
                  const ticks = ep.RunTimeTicks || 0;
                  const mins = Math.round(ticks / 600000000);
                  return (
                    <div key={ep.Id} className="episode-item" onClick={() => handleEpisodePlay(ep)}>
                      <div className="episode-thumb">
                        {ep.ImageTags?.Primary ? (
                          <img
                            src={embyImageUrl(movie._embyServer!, ep.Id, 'Primary', 300)}
                            alt={ep.Name}
                            className="episode-thumb__img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="episode-thumb__placeholder">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#4b5563"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          </div>
                        )}
                        <div className="episode-thumb__play">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                      </div>
                      <div className="episode-info">
                        <span className="episode-number">E{ep.IndexNumber || '?'}</span>
                        <span className="episode-title">{ep.Name}</span>
                        {ep.Overview && (
                          <p className="episode-overview">{ep.Overview}</p>
                        )}
                        <div className="episode-meta">
                          {mins > 0 && <span className="episode-duration">{mins}m</span>}
                          {ep.CommunityRating && (
                            <span className="episode-rating">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                              {ep.CommunityRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="detail-buttons">
          <button className="detail-play-btn" onClick={onPlay} style={{ background: movie.accentColor }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Play Now
          </button>
          <button className={`detail-list-btn ${isInList ? 'detail-list-btn--added' : ''}`} onClick={() => setIsInList(l => !l)}
            style={{ borderColor: isInList ? movie.accentColor : 'rgba(255,255,255,0.2)', color: isInList ? movie.accentColor : 'white' }}>
            {isInList ? (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill={movie.accentColor}><polyline points="20 6 9 17 4 12"/></svg> Added</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> My List</>
            )}
          </button>
          <button className="detail-download-btn" onClick={handleFetchStreams}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>

        {/* Streams Panel */}
        {showStreams && (
          <div className="detail-streams">
            <h3 className="detail-section-title">
              Available Streams {loadingStreams && <span className="detail-streams-loading">loading...</span>}
            </h3>
            {streams.length === 0 && !loadingStreams && (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No streams found. Try playing directly.</p>
            )}
            <div className="streams-list">
              {streams.slice(0, 15).map((s, i) => (
                <div key={i} className="stream-item" onClick={onPlay}>
                  <div className="stream-info">
                    <span className="stream-name">{s.name}</span>
                    <span className="stream-title">{s.title}</span>
                  </div>
                  <div className="stream-badges">
                    {s.quality && <span className="stream-quality">{s.quality}</span>}
                    {s._seeds && <span className="stream-seeds">{s._seeds} seeds</span>}
                    {s._size && <span className="stream-size">{s._size}</span>}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={movie.accentColor}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <div className="detail-section" style={{ marginBottom: 8 }}>
            <SectionHeader title="More Like This" />
            <div className="detail-movies-row">
              {similar.map(m => (
                <MovieCard key={m.id} movie={m} onClick={onMovieClick} size="md" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
