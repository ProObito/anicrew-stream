// AnimeXAPI client — https://animexoneapi.vercel.app
const AX_BASE = "https://animexoneapi.vercel.app/api";

async function axFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${AX_BASE}${path}`);
  if (!res.ok) throw new Error(`AnimeX ${res.status}`);
  return res.json();
}

export interface AXCard {
  id: string;
  anilistId: number;
  malId?: number;
  titleRomaji?: string;
  titleEnglish?: string;
  coverImage?: { extraLarge?: string; large?: string; medium?: string; color?: string };
  bannerImage?: string;
  format?: string;
  status?: string;
  episodes?: number;
  episodeCount?: number;
  duration?: number;
  season?: string;
  seasonYear?: number;
  averageScore?: number;
  genres?: string[];
  description?: string;
}

export const axTitle = (a: AXCard) => a.titleEnglish || a.titleRomaji || a.id;
export const axCover = (a: AXCard) => a.coverImage?.extraLarge || a.coverImage?.large || a.coverImage?.medium || a.bannerImage;

export const ax = {
  base: AX_BASE,
  home: () => axFetch<any>(`/home`),
  trending: (limit = 24) => axFetch<{ items: AXCard[] }>(`/trending?limit=${limit}`),
  popular: (limit = 24) => axFetch<{ items: AXCard[] }>(`/popular?limit=${limit}`),
  season: (limit = 24) => axFetch<{ items: AXCard[] }>(`/season?limit=${limit}`),
  catalog: (params: Record<string, string | number> = {}) => {
    const q = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
    return axFetch<any>(`/catalog?${q.toString()}`);
  },
  search: (q: string) => axFetch<{ items: AXCard[] }>(`/search?q=${encodeURIComponent(q)}`),
  detail: (id: string | number) => axFetch<any>(`/anime/${id}`),
  characters: (id: string | number) => axFetch<any>(`/anime/${id}/characters`),
  recommendations: (id: string | number) => axFetch<any>(`/anime/${id}/recommendations`),
  trailer: (id: string | number) => axFetch<any>(`/anime/${id}/trailer`),
  episodes: (slug: string) => axFetch<{ episodes: any[] }>(`/episodes/${slug}`),
  servers: (slug: string, ep: number) => axFetch<any>(`/servers/${slug}/${ep}`),
  sources: (slug: string, ep: number, provider: string, type: "sub" | "dub" = "sub") =>
    axFetch<any>(`/sources/${slug}/${ep}?provider=${provider}&type=${type}`),
  watch: (anilistId: number | string, ep: number) => axFetch<any>(`/watch/${anilistId}/${ep}`),
  schedule: () => axFetch<any>(`/schedule`),
};
