// MultiMoviesAPI client — https://moviesapi.proyato.com
const MM_BASE = "https://moviesapi.proyato.com/api";

export interface MMItem {
  title: string;
  slug: string;
  poster?: string;
  thumbnail?: string;
  image?: string;
  year?: string | number;
  rating?: string | number;
  quality?: string;
  type?: string;
  genres?: string[];
}

export interface MMSource {
  title: string;
  embed_url: string;
  type?: string;
}

async function mmFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${MM_BASE}${path}`);
  if (!res.ok) throw new Error(`MultiMovies API ${res.status}`);
  const json = await res.json();
  if (json.success === false) throw new Error(json.message || "API error");
  return json.results as T;
}

export const mm = {
  base: MM_BASE,
  home: () => mmFetch<any>("/"),
  featured: () => mmFetch<any>("/featured"),
  trending: (type: "movie" | "tv" = "movie") => mmFetch<any>(`/trending?type=${type}`),
  popular: (type: "movie" | "tv" = "movie") => mmFetch<any>(`/popular?type=${type}`),
  recent: (type: "movie" | "tv" = "movie") => mmFetch<any>(`/recently-added?type=${type}`),
  movies: (page = 1) => mmFetch<any>(`/movies?page=${page}`),
  tvshows: (page = 1) => mmFetch<any>(`/tvshows?page=${page}`),
  movieDetail: (slug: string) => mmFetch<any>(`/movies/${slug}`),
  tvDetail: (slug: string) => mmFetch<any>(`/tvshows/${slug}`),
  seasons: (slug: string) => mmFetch<any>(`/tvshows/${slug}/seasons`),
  episodes: (slug: string, season: number) =>
    mmFetch<any>(`/tvshows/${slug}/seasons/${season}/episodes`),
  genre: (slug: string, page = 1) => mmFetch<any>(`/genre/${slug}?page=${page}`),
  search: (q: string) => mmFetch<any>(`/search?q=${encodeURIComponent(q)}`),
  playerUrl: (slug: string, opts: { type: "movie" | "tv"; title?: string; season?: number; episode?: number; server?: number }) => {
    const params = new URLSearchParams({ type: opts.type });
    if (opts.title) params.set("title", opts.title);
    if (opts.season) params.set("season", String(opts.season));
    if (opts.episode) params.set("episode", String(opts.episode));
    if (opts.server !== undefined) params.set("server", String(opts.server));
    return `${MM_BASE}/player/${slug}?${params.toString()}`;
  },
};

export function normalizeMM(raw: any): MMItem {
  return {
    title: raw?.title || raw?.name || "Untitled",
    slug: raw?.slug || raw?.id || "",
    poster: raw?.poster || raw?.thumbnail || raw?.image || raw?.image_url,
    year: raw?.year || raw?.release_year,
    rating: raw?.rating || raw?.imdb_rating,
    quality: raw?.quality,
    type: raw?.type,
    genres: raw?.genres,
  };
}

export function pickArray(obj: any, ...keys: string[]): any[] {
  for (const k of keys) {
    if (Array.isArray(obj?.[k])) return obj[k];
  }
  if (Array.isArray(obj)) return obj;
  return [];
}
