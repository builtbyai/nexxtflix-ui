
const SIGNALING_API = 'https://dashboard-signaling.jalen1wa.workers.dev';
const _isLocal = false; // Always use production backend
const BACKEND_URL = SIGNALING_API;

// ─── Emby ──────────────────────────────────────────────────────

export interface EmbyServer {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  userId: string;
  color: string;
  direct?: boolean; // bypass proxy — connect directly (for local/LAN servers)
}

export interface EmbyItem {
  Id: string;
  Name: string;
  Type: string;
  ProductionYear?: number;
  CommunityRating?: number;
  RunTimeTicks?: number;
  Overview?: string;
  ImageTags?: { Primary?: string };
  BackdropImageTags?: string[];
  SeriesName?: string;
  SeasonName?: string;
  IndexNumber?: number;
  ParentIndexNumber?: number;
}

const EMBY_HEADERS = (key: string) => ({
  'X-Emby-Token': key,
  'X-Emby-Client': 'NexxtFlix',
  'X-Emby-Device-Name': 'Mobile',
  'X-Emby-Device-Id': 'nexxtflix-v2',
  'X-Emby-Client-Version': '2.0.0',
});

function embyUrl(serverUrl: string, path: string, direct?: boolean): string {
  if (_isLocal || direct) return `${serverUrl}${path}`;
  const encoded = btoa(serverUrl);
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${SIGNALING_API}/api/emby-proxy/${encoded}/${cleanPath}`;
}

// Per-user Emby server configs
const EMBY_SERVERS_BY_USER: Record<string, EmbyServer[]> = {
  // Jalen (admin) — AllStar + Home
  default: [
    {
      id: 'default',
      name: 'AllStar Media Pro',
      url: 'https://emby.allstarmediapro.com',
      apiKey: 'aba5613242b848078b72ceb0c39900bd',
      userId: '57ee4087fd1a4a1bb74fde964b7932b7',
      color: '#8b5cf6',
    },
    {
      id: 'home-local',
      name: 'Home Library',
      url: 'http://192.168.0.216:8096',
      apiKey: '92910e6aa7af495ea41b684e70eae1c3',
      userId: '57c56a9c58144b7b86fb11772d0cdc20',
      color: '#10b981',
      direct: true,
    },
  ],
  // Mildred — Home server only (JMAIN user)
  'milliemygirl@gmail.com': [
    {
      id: 'home',
      name: 'Home Library',
      url: 'https://emby-local.allstarmediapro.com',
      apiKey: '8cf23d5e47174b8bae3b58e5eb3e6718',
      userId: '350785c7ba4d48398ad5bb4403a20c33',
      color: '#10b981',
      direct: true,
    },
  ],
};

export function getEmbyServers(userEmail?: string): EmbyServer[] {
  // Check localStorage override first
  let servers: EmbyServer[];
  try {
    const saved = localStorage.getItem('emby-servers');
    servers = saved ? JSON.parse(saved) : null;
  } catch { servers = null as any; }

  if (!servers) {
    // Use per-user config or default
    const email = userEmail?.toLowerCase();
    servers = (email && EMBY_SERVERS_BY_USER[email]) || EMBY_SERVERS_BY_USER.default;
  }

  return servers;
}

export function saveEmbyServers(servers: EmbyServer[]) {
  localStorage.setItem('emby-servers', JSON.stringify(servers));
}

export async function embyCheckServer(server: EmbyServer): Promise<boolean> {
  try {
    const res = await fetch(embyUrl(server.url, '/System/Info/Public', server.direct), {
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch { return false; }
}

export async function embyGetUsers(server: EmbyServer): Promise<{ Id: string; Name: string }[]> {
  try {
    const res = await fetch(embyUrl(server.url, '/Users/Public', server.direct));
    if (res.ok) return res.json();
    const res2 = await fetch(embyUrl(server.url, '/Users', server.direct), {
      headers: EMBY_HEADERS(server.apiKey),
    });
    return res2.ok ? res2.json() : [];
  } catch { return []; }
}

export async function embyFetchLibrary(server: EmbyServer, type: string = 'Movie,Series', limit: number = 100): Promise<EmbyItem[]> {
  try {
    const params = new URLSearchParams({
      Recursive: 'true',
      IncludeItemTypes: type,
      Fields: 'PrimaryImageAspectRatio,Overview,CommunityRating',
      SortBy: 'DateCreated,SortName',
      SortOrder: 'Descending',
      Limit: String(limit),
    });
    const url = embyUrl(server.url, `/Users/${server.userId}/Items?${params}`, server.direct);
    const res = await fetch(url, { headers: EMBY_HEADERS(server.apiKey) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.Items || [];
  } catch { return []; }
}

export function embyImageUrl(server: EmbyServer, itemId: string, type: 'Primary' | 'Backdrop' = 'Primary', maxHeight: number = 400): string {
  const path = `/Items/${itemId}/Images/${type}?maxHeight=${maxHeight}`;
  return embyUrl(server.url, path, server.direct);
}

export function embyStreamUrl(server: EmbyServer, itemId: string): string {
  const path = `/Videos/${itemId}/stream?Static=true&DeviceId=nexxtflix-v2&PlaySessionId=${Date.now()}`;
  const url = embyUrl(server.url, path, server.direct);
  return url + `&api_key=${server.apiKey}`;
}

export async function embyFetchSeasons(server: EmbyServer, seriesId: string): Promise<EmbyItem[]> {
  try {
    const params = new URLSearchParams({ userId: server.userId });
    const url = embyUrl(server.url, `/Shows/${seriesId}/Seasons?${params}`, server.direct);
    const res = await fetch(url, { headers: EMBY_HEADERS(server.apiKey) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.Items || [];
  } catch { return []; }
}

export async function embyFetchEpisodes(server: EmbyServer, seriesId: string, seasonId: string): Promise<EmbyItem[]> {
  try {
    const params = new URLSearchParams({
      SeasonId: seasonId,
      userId: server.userId,
      Fields: 'Overview,PrimaryImageAspectRatio',
    });
    const url = embyUrl(server.url, `/Shows/${seriesId}/Episodes?${params}`, server.direct);
    const res = await fetch(url, { headers: EMBY_HEADERS(server.apiKey) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.Items || [];
  } catch { return []; }
}

export async function embySearch(server: EmbyServer, query: string, limit: number = 20): Promise<EmbyItem[]> {
  try {
    const params = new URLSearchParams({
      SearchTerm: query,
      Recursive: 'true',
      IncludeItemTypes: 'Movie,Series',
      Fields: 'PrimaryImageAspectRatio,Overview,CommunityRating',
      Limit: String(limit),
    });
    const url = embyUrl(server.url, `/Users/${server.userId}/Items?${params}`, server.direct);
    const res = await fetch(url, { headers: EMBY_HEADERS(server.apiKey) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.Items || [];
  } catch { return []; }
}

export function embyItemToMovie(item: EmbyItem, server: EmbyServer): import('../types').Movie {
  const ticks = item.RunTimeTicks || 0;
  const mins = Math.round(ticks / 600000000);
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  const duration = hours > 0 ? `${hours}h ${remMins}m` : `${remMins}m`;

  return {
    id: item.Id,
    title: item.SeriesName ? `${item.SeriesName} - ${item.Name}` : item.Name,
    genre: item.Type === 'Episode' ? `${item.SeasonName || ''} E${item.IndexNumber || ''}` : item.Type,
    year: item.ProductionYear || 0,
    rating: item.CommunityRating ? item.CommunityRating.toFixed(1) : '—',
    duration,
    description: item.Overview || '',
    gradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    accentColor: server.color || '#8b5cf6',
    poster: item.ImageTags?.Primary ? embyImageUrl(server, item.Id, 'Primary') : undefined,
    background: item.BackdropImageTags?.length ? embyImageUrl(server, item.Id, 'Backdrop', 1280) : undefined,
    type: item.Type === 'Series' ? 'series' : 'movie',
    isSeries: item.Type === 'Series' || item.Type === 'Episode',
    _embyServer: server,
    _embyId: item.Id,
  };
}

// ─── Torrent Search (1337x) ───────────────────────────────────

export interface TorrentResult {
  name: string;
  size: string;
  seeds: number;
  leeches: number;
  magnetUrl?: string;
  infoHash?: string;
  detailUrl?: string;
  fullUrl?: string;
  uploader?: string;
  date?: string;
}

async function apiFetch(path: string) {
  const res = await fetch(`${BACKEND_URL}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function search1337x(query: string, category: string = 'Movies'): Promise<TorrentResult[]> {
  try {
    const data = await apiFetch(`/api/1337x/search?q=${encodeURIComponent(query)}&category=${category}`);
    return data.results || [];
  } catch (e) {
    console.error('1337x search failed:', e);
    return [];
  }
}

export async function search1337xWithMagnets(query: string, limit: number = 20): Promise<TorrentResult[]> {
  try {
    const data = await apiFetch(`/api/1337x/search-with-magnets?q=${encodeURIComponent(query)}&limit=${limit}`);
    return data.results || [];
  } catch (e) {
    console.error('1337x magnet search failed:', e);
    return [];
  }
}

export async function get1337xMagnet(detailPath: string): Promise<{ magnetUrl: string; infoHash: string } | null> {
  try {
    const data = await apiFetch(`/api/1337x/magnet?path=${encodeURIComponent(detailPath)}`);
    return { magnetUrl: data.magnetUrl, infoHash: data.infoHash };
  } catch { return null; }
}

export async function get1337xCategories(): Promise<string[]> {
  try {
    const data = await apiFetch('/api/1337x/categories');
    return data.categories || [];
  } catch { return ['Movies', 'TV', 'Games', 'Music', 'Apps', 'Anime']; }
}

// ─── TPB (ThePirateBay) ───────────────────────────────────────

export async function searchTPB(query: string, category: string = 'movies'): Promise<TorrentResult[]> {
  try {
    const data = await apiFetch(`/api/tpb/search?q=${encodeURIComponent(query)}&category=${category}`);
    return (data.results || []).map((r: any) => ({
      name: r.name,
      size: r.size,
      seeds: r.seeders || r.seeds || 0,
      leeches: r.leechers || r.leeches || 0,
      magnetUrl: r.magnet || r.magnetUrl,
      infoHash: r.infoHash || r.info_hash,
    }));
  } catch (e) {
    console.error('TPB search failed:', e);
    return [];
  }
}

export async function getTPBTop(category: string = 'movies'): Promise<TorrentResult[]> {
  try {
    const data = await apiFetch(`/api/tpb/top?category=${category}`);
    return (data.results || []).map((r: any) => ({
      name: r.name,
      size: r.size,
      seeds: r.seeders || r.seeds || 0,
      leeches: r.leechers || r.leeches || 0,
      magnetUrl: r.magnet || r.magnetUrl,
      infoHash: r.infoHash || r.info_hash,
    }));
  } catch (e) {
    console.error('TPB top failed:', e);
    return [];
  }
}

// ─── Torrent Streaming ────────────────────────────────────────

export function getTorrentStreamUrl(magnetOrHash: string): string {
  const param = magnetOrHash.startsWith('magnet:')
    ? `magnet=${encodeURIComponent(magnetOrHash)}`
    : `hash=${magnetOrHash}`;
  return `${BACKEND_URL}/api/stream/torrent?${param}`;
}

export async function getTorrentInfo(magnetOrHash: string): Promise<any> {
  const param = magnetOrHash.startsWith('magnet:')
    ? `magnet=${encodeURIComponent(magnetOrHash)}`
    : `hash=${magnetOrHash}`;
  return apiFetch(`/api/stream/torrent/info?${param}`);
}

// ─── Real-Debrid ──────────────────────────────────────────────

export async function rdSearchAndStream(query: string, index: number = 0): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/api/realdebrid/searchAndStream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, index }),
  });
  return res.json();
}

export async function rdUnrestrict(link: string): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/api/realdebrid/unrestrict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ link }),
  });
  return res.json();
}

export async function fetchRDUser(): Promise<any> {
  try { return await apiFetch('/api/realdebrid/user'); } catch { return null; }
}

export async function rdAddMagnet(magnet: string): Promise<{ id: string; uri: string }> {
  const res = await fetch(`${BACKEND_URL}/api/realdebrid/addMagnet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ magnet }),
  });
  return res.json();
}

export async function rdGetTorrents(): Promise<any[]> {
  try {
    return await apiFetch('/api/rd/torrents');
  } catch { return []; }
}

export async function rdSelectFiles(id: string): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/api/realdebrid/selectFiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, files: 'all' }),
  });
  return res.json();
}

export async function rdGetLinks(id: string): Promise<any> {
  return apiFetch(`/api/rd/torrents/info/${id}`);
}

// ─── TMDB ────────────────────────────────────────────────────

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1ODUzZTVmZTMxMDg3MTU1M2U5ZmI3ZTMwNjI5OTEwYiIsIm5iZiI6MTc0ODc5Mzc0Mi44ODk5OTk5LCJzdWIiOiI2ODNjNzk4ZTA1MzYxOWE3YWRmZGIwYzIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.32f_fy1lskeHwnAvhQPEZaZ3mlRavXfZneA3Hrhm_E4';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';

const tmdbHeaders = {
  Authorization: `Bearer ${TMDB_TOKEN}`,
  'Content-Type': 'application/json',
};

async function tmdbFetch(path: string): Promise<any> {
  const res = await fetch(`${TMDB_BASE}${path}`, { headers: tmdbHeaders });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export interface TmdbGenre { id: number; name: string; }

export interface TmdbItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: string;
}

export function tmdbPosterUrl(path: string | null, size: 'w200' | 'w342' | 'w500' | 'w780' = 'w342'): string | undefined {
  return path ? `${TMDB_IMG}/${size}${path}` : undefined;
}

export function tmdbBackdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string | undefined {
  return path ? `${TMDB_IMG}/${size}${path}` : undefined;
}

export async function tmdbGetGenres(type: 'movie' | 'tv' = 'movie'): Promise<TmdbGenre[]> {
  try {
    const data = await tmdbFetch(`/genre/${type}/list?language=en-US`);
    return data.genres || [];
  } catch { return []; }
}

export async function tmdbTrending(type: 'movie' | 'tv' | 'all' = 'all', window: 'day' | 'week' = 'week'): Promise<TmdbItem[]> {
  try {
    const data = await tmdbFetch(`/trending/${type}/${window}?language=en-US`);
    return data.results || [];
  } catch { return []; }
}

export async function tmdbPopular(type: 'movie' | 'tv' = 'movie', page: number = 1): Promise<{ results: TmdbItem[]; total_pages: number }> {
  try {
    const data = await tmdbFetch(`/${type}/popular?language=en-US&page=${page}`);
    return { results: data.results || [], total_pages: data.total_pages || 1 };
  } catch { return { results: [], total_pages: 1 }; }
}

export async function tmdbDiscover(type: 'movie' | 'tv' = 'movie', genreId?: number, page: number = 1, sortBy: string = 'popularity.desc'): Promise<{ results: TmdbItem[]; total_pages: number }> {
  try {
    let path = `/${type === 'tv' ? 'discover/tv' : 'discover/movie'}?language=en-US&sort_by=${sortBy}&page=${page}`;
    if (genreId) path += `&with_genres=${genreId}`;
    const data = await tmdbFetch(path);
    return { results: data.results || [], total_pages: data.total_pages || 1 };
  } catch { return { results: [], total_pages: 1 }; }
}

export async function tmdbSearch(query: string, type: 'movie' | 'tv' | 'multi' = 'multi', page: number = 1): Promise<{ results: TmdbItem[]; total_pages: number }> {
  try {
    const data = await tmdbFetch(`/search/${type}?language=en-US&query=${encodeURIComponent(query)}&page=${page}`);
    return { results: data.results || [], total_pages: data.total_pages || 1 };
  } catch { return { results: [], total_pages: 1 }; }
}

export async function tmdbNowPlaying(page: number = 1): Promise<TmdbItem[]> {
  try {
    const data = await tmdbFetch(`/movie/now_playing?language=en-US&page=${page}`);
    return data.results || [];
  } catch { return []; }
}

export async function tmdbTopRated(type: 'movie' | 'tv' = 'movie', page: number = 1): Promise<TmdbItem[]> {
  try {
    const data = await tmdbFetch(`/${type}/top_rated?language=en-US&page=${page}`);
    return data.results || [];
  } catch { return []; }
}

export async function tmdbUpcoming(): Promise<TmdbItem[]> {
  try {
    const data = await tmdbFetch('/movie/upcoming?language=en-US&page=1');
    return data.results || [];
  } catch { return []; }
}

export function tmdbItemToMovie(item: TmdbItem, genreMap?: Map<number, string>): import('../types').Movie {
  const isTV = !!(item.name || item.first_air_date || item.media_type === 'tv');
  const title = item.title || item.name || 'Unknown';
  const year = (item.release_date || item.first_air_date || '').split('-')[0];
  const genreNames = item.genre_ids?.slice(0, 2).map(id => genreMap?.get(id) || '').filter(Boolean).join(', ') || (isTV ? 'TV Show' : 'Movie');

  return {
    id: `tmdb-${item.id}`,
    imdbId: undefined,
    title,
    genre: genreNames,
    year: parseInt(year) || 0,
    rating: item.vote_average ? item.vote_average.toFixed(1) : '—',
    duration: isTV ? 'TV Series' : '',
    description: item.overview || '',
    gradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    accentColor: '#8b5cf6',
    poster: tmdbPosterUrl(item.poster_path, 'w342'),
    background: tmdbBackdropUrl(item.backdrop_path),
    type: isTV ? 'series' : 'movie',
    isSeries: isTV,
    _tmdbId: item.id,
  };
}
