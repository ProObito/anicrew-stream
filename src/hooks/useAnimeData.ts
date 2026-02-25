import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export function useHomeData() {
  return useQuery({
    queryKey: ["home"],
    queryFn: () => apiFetch<any>("/api/v1/home"),
    select: (data) => data?.data,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchAnime(keyword: string, page = 1) {
  return useQuery({
    queryKey: ["search", keyword, page],
    queryFn: () =>
      apiFetch<any>(
        `/api/v1/search?keyword=${encodeURIComponent(keyword)}&page=${page}`
      ),
    select: (data) => data?.data,
    enabled: keyword.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSearchSuggestion(keyword: string) {
  return useQuery({
    queryKey: ["suggest", keyword],
    queryFn: () =>
      apiFetch<any>(
        `/api/v1/search?keyword=${encodeURIComponent(keyword)}`
      ),
    select: (data) => data?.data?.animes?.slice(0, 5) ?? [],
    enabled: keyword.length >= 2,
    staleTime: 60 * 1000,
  });
}

export function useAnimeInfo(id: string) {
  return useQuery({
    queryKey: ["anime-info", id],
    queryFn: () => apiFetch<any>(`/api/v1/anime/${id}`),
    select: (data) => data?.data?.anime?.info,
    enabled: !!id,
  });
}

export function useAnimeDetail(id: string) {
  return useQuery({
    queryKey: ["anime-detail", id],
    queryFn: () => apiFetch<any>(`/api/v1/anime/${id}`),
    select: (data) => data?.data,
    enabled: !!id,
  });
}

export function useEpisodes(id: string) {
  return useQuery({
    queryKey: ["episodes", id],
    queryFn: () => apiFetch<any>(`/api/v1/episodes/${id}`),
    select: (data) => data?.data?.episodes ?? [],
    enabled: !!id,
  });
}

export function useEpisodeSources(episodeId: string, server = "vidcloud", category = "sub") {
  return useQuery({
    queryKey: ["sources", episodeId, server, category],
    queryFn: () =>
      apiFetch<any>(
        `/api/v1/stream?id=${encodeURIComponent(episodeId)}&server=${server}&type=${category}`
      ),
    select: (data) => data?.data,
    enabled: !!episodeId,
  });
}
