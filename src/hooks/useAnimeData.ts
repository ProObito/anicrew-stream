import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { AnimeInfo, AnimeResult, Episode, SearchSuggestion } from "@/types/anime";

const toAnimeResult = (anime: any): AnimeResult => ({
  id: anime?.id ?? "",
  name: anime?.name ?? anime?.title ?? "Unknown",
  poster: anime?.poster ?? "",
  duration: anime?.duration ?? "",
  type: anime?.type ?? "",
  rating: anime?.rating ?? anime?.MAL_score ?? null,
  episodes: {
    sub: anime?.episodes?.sub ?? anime?.episodes?.eps ?? null,
    dub: anime?.episodes?.dub ?? null,
  },
  jname: anime?.jname ?? anime?.alternativeTitle,
});

const toAnimeInfo = (anime: any): AnimeInfo => ({
  id: anime?.id ?? "",
  name: anime?.title ?? anime?.name ?? "",
  poster: anime?.poster ?? "",
  description: anime?.synopsis ?? anime?.description ?? "",
  stats: {
    rating: anime?.rating ?? anime?.MAL_score ?? "",
    quality: anime?.quality ?? "HD",
    episodes: {
      sub: anime?.episodes?.sub ?? anime?.episodes?.eps ?? 0,
      dub: anime?.episodes?.dub ?? 0,
    },
    type: anime?.type ?? "",
    duration: anime?.duration ?? "",
  },
  moreInfo: {
    genres: Array.isArray(anime?.genres) ? anime.genres : [],
    status: anime?.status ?? "",
  },
});

export function useHomeData() {
  return useQuery({
    queryKey: ["home"],
    queryFn: () => apiFetch<any>("/api/v1/home"),
    select: (data) => {
      const payload = data?.data ?? {};
      const spotlight = payload?.spotlightAnimes ?? payload?.spotlight ?? [];

      return {
        spotlightAnimes: spotlight.map((anime: any) => ({
          ...toAnimeResult(anime),
          description: anime?.description ?? anime?.synopsis,
          rank: anime?.rank,
        })),
        trending: (payload?.trending ?? []).map(toAnimeResult),
        topAiring: (payload?.topAiring ?? []).map(toAnimeResult),
        mostPopular: (payload?.mostPopular ?? []).map(toAnimeResult),
        mostFavorite: (payload?.mostFavorite ?? []).map(toAnimeResult),
        latestCompleted: (payload?.latestCompleted ?? []).map(toAnimeResult),
        latestEpisode: (payload?.latestEpisode ?? payload?.recentlyUpdated ?? []).map(toAnimeResult),
        topUpcoming: (payload?.topUpcoming ?? []).map(toAnimeResult),
        top10: payload?.top10,
      };
    },
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
    select: (data) => {
      const payload = data?.data ?? {};
      const pageInfo = payload?.pageInfo ?? {};
      const rawResults = payload?.animes ?? payload?.response ?? [];

      return {
        animes: rawResults.map(toAnimeResult),
        totalPages: pageInfo?.totalPages ?? payload?.totalPages ?? 1,
        currentPage: pageInfo?.currentPage ?? payload?.currentPage ?? page,
        hasNextPage:
          pageInfo?.hasNextPage ?? page < (pageInfo?.totalPages ?? payload?.totalPages ?? 1),
      };
    },
    enabled: keyword.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSearchSuggestion(keyword: string) {
  return useQuery({
    queryKey: ["suggest", keyword],
    queryFn: () =>
      apiFetch<any>(
        `/api/v1/search?keyword=${encodeURIComponent(keyword)}&page=1`
      ),
    select: (data): SearchSuggestion[] => {
      const list = data?.data?.response ?? data?.data?.animes ?? [];
      return list.slice(0, 5).map((item: any) => ({
        id: item?.id ?? "",
        name: item?.title ?? item?.name ?? "",
        jname: item?.alternativeTitle ?? item?.jname ?? "",
        poster: item?.poster ?? "",
        moreInfo: [item?.type, item?.duration].filter(Boolean),
      }));
    },
    enabled: keyword.length >= 2,
    staleTime: 60 * 1000,
  });
}

export function useAnimeInfo(id: string) {
  return useQuery({
    queryKey: ["anime-info", id],
    queryFn: () => apiFetch<any>(`/api/v1/anime/${id}`),
    select: (data) => {
      if (!data?.data) return null;
      return toAnimeInfo(data.data);
    },
    enabled: !!id,
  });
}

export function useAnimeDetail(id: string) {
  return useQuery({
    queryKey: ["anime-detail", id],
    queryFn: () => apiFetch<any>(`/api/v1/anime/${id}`),
    select: (data) => {
      const anime = data?.data;
      if (!anime) return null;

      return {
        anime: {
          info: toAnimeInfo(anime),
          moreInfo: {
            genres: Array.isArray(anime?.genres) ? anime.genres : [],
            producers: anime?.producers ?? [],
            studios: anime?.studios ?? [],
          },
        },
        recommended: (anime?.recommended ?? []).map(toAnimeResult),
        mostPopular: (anime?.mostPopular ?? []).map(toAnimeResult),
      };
    },
    enabled: !!id,
  });
}

export function useEpisodes(id: string) {
  return useQuery({
    queryKey: ["episodes", id],
    queryFn: () => apiFetch<any>(`/api/v1/episodes/${id}`),
    select: (data): Episode[] => {
      const raw = data?.data;
      const episodeList = Array.isArray(raw) ? raw : raw?.episodes ?? [];

      return episodeList.map((episode: any) => ({
        title: episode?.title ?? `Episode ${episode?.episodeNumber ?? episode?.number ?? ""}`,
        episodeId: episode?.episodeId ?? episode?.id ?? "",
        number: episode?.number ?? episode?.episodeNumber ?? 0,
        isFiller: Boolean(episode?.isFiller),
      }));
    },
    enabled: !!id,
  });
}

export function useEpisodeSources(episodeId: string, server = "megaplay", category = "sub") {
  return useQuery({
    queryKey: ["sources", episodeId, server, category],
    queryFn: () =>
      apiFetch<any>(
        `/api/v1/stream?id=${encodeURIComponent(episodeId)}&server=${server}&type=${category}`
      ),
    select: (data) => {
      const payload = data?.data;
      if (!payload) return null;

      if (payload?.streamingLink) {
        return {
          headers: payload?.headers ?? {},
          sources: [{ url: payload.streamingLink, type: "iframe" }],
          subtitles: payload?.subtitles ?? [],
        };
      }

      if (Array.isArray(payload?.sources)) return payload;
      return null;
    },
    enabled: !!episodeId,
  });
}
