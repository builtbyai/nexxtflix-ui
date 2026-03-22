
export type NavTab = 'home' | 'search' | 'downloads' | 'account' | 'admin';

export type Screen = 'home' | 'player' | 'detail' | 'search' | 'downloads' | 'account' | 'admin' | 'login' | 'register' | 'pending' | 'browse';

export interface BrowseConfig {
  title: string;
  type: 'movie' | 'tv' | 'all';
  genreId?: number;
  category?: 'trending' | 'popular' | 'top_rated' | 'now_playing' | 'upcoming' | 'genre';
}

export interface Movie {
  id: string;
  imdbId?: string;
  title: string;
  genre: string;
  year: number;
  rating: string;
  duration: string;
  description: string;
  gradient: string;
  accentColor: string;
  poster?: string;
  background?: string;
  episodes?: number;
  seasons?: number;
  isSeries?: boolean;
  progress?: number;
  type?: 'movie' | 'series';
  cast?: CastMember[];
  streams?: Stream[];
  _embyServer?: import('./utils/api').EmbyServer;
  _embyId?: string;
  _tmdbId?: number;
}

export interface CastMember {
  name: string;
  role: string;
  photo?: string;
  color: string;
}

export interface Stream {
  name: string;
  title: string;
  url?: string;
  infoHash?: string;
  magnetUrl?: string;
  _addon?: string;
  _seeds?: number;
  _size?: string;
  _streamType?: string;
  quality?: string;
}

export interface TorrentResult {
  name: string;
  size: string;
  seeds: number;
  leeches: number;
  magnetUrl?: string;
  infoHash?: string;
  detailUrl?: string;
  fullUrl?: string;
}

export interface Download {
  id: string;
  movie: Movie;
  progress: number;
  size: string;
  quality: string;
  status: 'downloading' | 'complete' | 'paused' | 'caching';
  rdId?: string;
  streamUrl?: string;
}
