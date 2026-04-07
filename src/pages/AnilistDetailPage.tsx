import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, Play, Download, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useWatchlistStore } from "@/store/watchlistStore";
import { useAuth } from "@/hooks/useAuth";
import { useEpisodeLinks } from "@/hooks/useEpisodeLinks";
import EpisodeLinkEditor from "@/components/EpisodeLinkEditor";
import ErrorFallback from "@/components/ErrorFallback";
import { useState } from "react";

const ANILIST_URL = "https://graphql.anilist.co";

const DETAIL_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english }
    coverImage { extraLarge large }
    bannerImage
    description(asHtml: false)
    format
    episodes
    duration
    averageScore
    popularity
    genres
    status
    season
    seasonYear
    studios(isMain: true) { nodes { name } }
    nextAiringEpisode { episode timeUntilAiring }
  }
}
`;

function useAnilistDetail(id: string) {
  return useQuery({
    queryKey: ["anilist-detail", id],
    queryFn: async () => {
      const res = await fetch(ANILIST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: DETAIL_QUERY, variables: { id: Number(id) } }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0]?.message);
      return json.data.Media;
    },
    enabled: !!id,
  });
}

function useHianimeSearch(name: string) {
  return useQuery({
    queryKey: ["hianime-search", name],
    queryFn: () => apiFetch<any>(`/api/v1/search?keyword=${encodeURIComponent(name)}&page=1`),
    select: (data) => {
      const list = data?.data?.animes ?? data?.data?.response ?? [];
      return list[0] ?? null;
    },
    enabled: name.length > 0,
  });
}

function useHianimeEpisodes(hianimeId: string) {
  return useQuery({
    queryKey: ["episodes", hianimeId],
    queryFn: () => apiFetch<any>(`/api/v1/episodes/${hianimeId}`),
    select: (data) => {
      const raw = data?.data;
      const episodeList = Array.isArray(raw) ? raw : raw?.episodes ?? [];
      return episodeList.map((ep: any) => ({
        title: ep?.title ?? `Episode ${ep?.episodeNumber ?? ep?.number ?? ""}`,
        episodeId: ep?.episodeId ?? ep?.id ?? "",
        number: ep?.number ?? ep?.episodeNumber ?? 0,
        isFiller: Boolean(ep?.isFiller),
      }));
    },
    enabled: !!hianimeId,
  });
}

const FORMAT_MAP: Record<string, string> = {
  TV: "TV", TV_SHORT: "TV Short", MOVIE: "Movie", SPECIAL: "Special",
  OVA: "OVA", ONA: "ONA", MUSIC: "Music",
};

const AnilistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: anime, isLoading, isError, refetch } = useAnilistDetail(id || "");
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();

  const animeName = anime?.title?.english || anime?.title?.romaji || "";
  const { data: hianimeMatch } = useHianimeSearch(animeName);
  const hianimeId = hianimeMatch?.id ?? "";
  const { data: episodes, isLoading: epLoading } = useHianimeEpisodes(hianimeId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !anime) return <ErrorFallback message="Failed to load anime" onRetry={() => refetch()} />;

  const name = anime.title?.english || anime.title?.romaji || "Unknown";
  const poster = anime.coverImage?.extraLarge || anime.coverImage?.large || "";
  const banner = anime.bannerImage || poster;
  const description = anime.description?.replace(/<[^>]*>/g, "") || "";
  const genres: string[] = anime.genres || [];
  const rating = anime.averageScore ? `${anime.averageScore}%` : null;
  const type = FORMAT_MAP[anime.format] || anime.format || "";
  const duration = anime.duration ? `${anime.duration}m` : "";
  const studio = anime.studios?.nodes?.[0]?.name || "";
  const status = anime.status || "";

  const inList = isInWatchlist(String(anime.id));
  const watchlistItem = {
    id: String(anime.id),
    name,
    poster,
    type,
    duration,
    rating,
    episodes: { sub: anime.episodes || null, dub: null },
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* BANNER */}
      <div className="w-full flex flex-col items-center px-4 md:px-12 pt-24 mt-4">
        <div className="relative w-full max-w-7xl h-[350px] md:h-[500px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
          <img src={banner} alt={name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-end justify-center pb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-display font-black tracking-wider text-foreground drop-shadow-2xl mb-4 text-center px-4 uppercase"
            >
              {name}
            </motion.h1>
          </div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-6 mt-8"
        >
          <button
            onClick={() => inList ? removeFromWatchlist(String(anime.id)) : addToWatchlist(watchlistItem)}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition group"
          >
            <Heart className={`w-5 h-5 transition-colors ${inList ? "text-primary fill-current" : "group-hover:text-primary"}`} />
            <span className="font-medium">{inList ? "In Watchlist" : "Favorite"}</span>
          </button>

          {episodes && episodes.length > 0 && (
            <button
              onClick={() => navigate(`/watch/${hianimeId}?ep=${episodes[0].episodeId}`)}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 px-10 py-3.5 rounded-full text-primary-foreground shadow-neon transition-all transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              <span className="font-bold tracking-wide uppercase">Watch now</span>
            </button>
          )}
        </motion.div>
      </div>

      {/* CONTENT */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12">
        {/* Episodes */}
        <div className="lg:col-span-8">
          <h2 className="text-2xl font-display font-bold mb-6 text-foreground uppercase tracking-tight">Episodes</h2>
          {!hianimeId ? (
            <div className="text-muted-foreground flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Finding episodes...
            </div>
          ) : epLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-xl mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : episodes && episodes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {episodes.map((ep: any) => (
                <div
                  key={ep.episodeId}
                  onClick={() => navigate(`/watch/${hianimeId}?ep=${ep.episodeId}`)}
                  className="group cursor-pointer flex flex-col p-2 rounded-2xl transition-all hover:bg-secondary"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-card border border-border">
                    <img src={poster} alt={ep.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-100" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-background/40 p-3 rounded-full group-hover:bg-primary/90 transition-all duration-300 backdrop-blur-md border border-border group-hover:scale-110">
                        <Play className="w-6 h-6 ml-0.5 fill-current text-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="px-1">
                    <h3 className="font-semibold text-lg truncate text-foreground/80 group-hover:text-foreground">{name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Episode {ep.number} • {ep.title}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No episodes available yet.</p>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-card p-6 rounded-[2rem] border border-border h-full shadow-xl">
            <div className="bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-lg inline-block mb-5">
              Details & Info
            </div>

            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
              <img src={poster} alt={name} className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {type && <span className="text-xs font-bold uppercase tracking-wider bg-secondary text-secondary-foreground px-2 py-1 rounded">{type}</span>}
              {rating && <span className="text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-1 rounded">★ {rating}</span>}
              {duration && <span className="text-xs font-bold uppercase tracking-wider bg-secondary text-secondary-foreground px-2 py-1 rounded">{duration}</span>}
              {status && <span className="text-xs font-bold uppercase tracking-wider bg-secondary text-secondary-foreground px-2 py-1 rounded">{status}</span>}
              {studio && <span className="text-xs font-bold uppercase tracking-wider bg-secondary text-secondary-foreground px-2 py-1 rounded">{studio}</span>}
            </div>

            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((g) => (
                  <span key={g} className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">{g}</span>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground leading-relaxed text-justify">
              {description || "No description available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnilistDetailPage;
