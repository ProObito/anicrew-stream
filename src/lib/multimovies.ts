// MultiMoviesAPI client - https://multimoviesapis.vercel.app
const MM_BASE = "https://multimoviesapis.vercel.app/api";

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

export interface MMResponse<T> {
  success: boolean;
  results: T;
}

async function mmFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${MM_BASE}${path}`);
  if (!res.ok) throw new Error(`MultiMovies API ${res.status}`);
  const json = await res.json();
  if (json.success === false) throw new Error(json.message || "API error");
  return json.results as T;
}

export const mm = {
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
  search: (q: string) => mmFetch<any>(`/search?q=${encodeURIComponent(q)}`),
  playerUrl: (slug: string, type: "movie" | "tv", title?: string, season?: number, episode?: number) => {
    const params = new URLSearchParams({ type });
    if (title) params.set("title", title);
    if (season) params.set("season", String(season));
    if (episode) params.set("episode", String(episode));
    return `${MM_BASE}/player/${slug}?${params.toString()}`;
  },
};

// Normalize various API shapes into a common card item
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
