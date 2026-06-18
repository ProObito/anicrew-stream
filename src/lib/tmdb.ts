// TMDB API client
const TMDB_KEY = "8d747df882ed5d7858d8330e4c971500";
const TMDB_BASE = "https://api.themoviedb.org/3";

export const tmdbImg = (path?: string | null, size: "w185" | "w300" | "w500" | "w780" | "original" = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

async function tFetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", TMDB_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export interface TmdbItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  media_type?: "movie" | "tv";
  genre_ids?: number[];
}

export interface TmdbGenre { id: number; name: string }

export const tmdb = {
  trending: (kind: "movie" | "tv", window: "day" | "week" = "week") =>
    tFetch<{ results: TmdbItem[] }>(`/trending/${kind}/${window}`),
  popular: (kind: "movie" | "tv", page = 1) =>
    tFetch<{ results: TmdbItem[] }>(`/${kind}/popular`, { page }),
  topRated: (kind: "movie" | "tv", page = 1) =>
    tFetch<{ results: TmdbItem[] }>(`/${kind}/top_rated`, { page }),
  nowPlaying: (page = 1) => tFetch<{ results: TmdbItem[] }>(`/movie/now_playing`, { page }),
  upcoming: (page = 1) => tFetch<{ results: TmdbItem[] }>(`/movie/upcoming`, { page }),
  airingToday: (page = 1) => tFetch<{ results: TmdbItem[] }>(`/tv/airing_today`, { page }),
  onTheAir: (page = 1) => tFetch<{ results: TmdbItem[] }>(`/tv/on_the_air`, { page }),
  detail: (kind: "movie" | "tv", id: number | string) =>
    tFetch<any>(`/${kind}/${id}`, { append_to_response: "credits,videos,similar,recommendations" }),
  season: (tvId: number | string, season: number) =>
    tFetch<any>(`/tv/${tvId}/season/${season}`),
  search: (q: string) =>
    tFetch<{ results: TmdbItem[] }>(`/search/multi`, { query: q, include_adult: 0 }),
  genres: (kind: "movie" | "tv") =>
    tFetch<{ genres: TmdbGenre[] }>(`/genre/${kind}/list`),
  discover: (kind: "movie" | "tv", params: Record<string, string | number> = {}) =>
    tFetch<{ results: TmdbItem[] }>(`/discover/${kind}`, params),
};

// Ad-blocked embed player (vidsrc.cc v2 is one of the cleaner options)
export const playerUrl = {
  movie: (tmdbId: number | string) =>
    `https://vidsrc.cc/v2/embed/movie/${tmdbId}?autoPlay=false`,
  tv: (tmdbId: number | string, season: number, episode: number) =>
    `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}?autoPlay=false`,
};

export const itemTitle = (it: TmdbItem) => it.title || it.name || "Untitled";
export const itemYear = (it: TmdbItem) => {
  const d = it.release_date || it.first_air_date;
  return d ? d.slice(0, 4) : "";
};
