import { useParams, useNavigate } from "react-router-dom";
import { Heart, Play, Star, Clock, Film } from "lucide-react";
import { motion } from "framer-motion";
import { useAnimeDetail, useEpisodes } from "@/hooks/useAnimeData";
import { useWatchlistStore } from "@/store/watchlistStore";
import { SkeletonGrid } from "@/components/SkeletonCard";
import ErrorFallback from "@/components/ErrorFallback";

const AnimeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useAnimeDetail(id || "");
  const { data: episodes, isLoading: epLoading } = useEpisodes(id || "");
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();

  if (isLoading) {
    return (
      <div className="pt-20 pb-10 px-8 md:px-16 lg:px-24">
        <div className="animate-pulse flex flex-col md:flex-row gap-8">
          <div className="w-64 aspect-[3/4] bg-muted rounded-md shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) return <ErrorFallback message="Failed to load anime" onRetry={() => refetch()} />;

  const info = data.anime?.info;
  const moreInfo = data.anime?.moreInfo;
  if (!info) return <ErrorFallback message="Anime not found" />;

  const inList = isInWatchlist(info.id);
  const animeForWatchlist = {
    id: info.id,
    name: info.name,
    poster: info.poster,
    type: info.stats?.type || "",
    duration: info.stats?.duration || "",
    rating: info.stats?.rating || null,
    episodes: info.stats?.episodes || { sub: 0, dub: 0 },
  };

  const genres: string[] = moreInfo?.genres ?? [];

  return (
    <div className="min-h-screen">
      {/* Cinematic hero banner */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0">
          <img src={info.poster} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 h-full flex items-end pb-12 px-8 md:px-16 lg:px-24"
        >
          <div className="flex flex-col md:flex-row gap-8 items-end md:items-end">
            <img
              src={info.poster}
              alt={info.name}
              className="w-40 md:w-56 aspect-[2/3] object-cover rounded-md border border-border shadow-2xl shrink-0 hidden md:block"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl md:text-7xl font-display uppercase tracking-tight text-foreground mb-4 leading-none">
                {info.name}
              </h1>
              {info.stats && (
                <div className="flex flex-wrap gap-4 mb-4 text-sm font-bold tracking-widest uppercase text-muted-foreground">
                  {info.stats.rating && (
                    <span className="flex items-center gap-1 text-primary">
                      <Star className="w-4 h-4" /> {info.stats.rating}
                    </span>
                  )}
                  {info.stats.type && (
                    <span className="border border-border px-2 py-0.5 rounded text-[10px] text-foreground">{info.stats.type}</span>
                  )}
                  {info.stats.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {info.stats.duration}
                    </span>
                  )}
                </div>
              )}

              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {genres.map((g: string) => (
                    <span key={g} className="px-3 py-1 rounded bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-4 max-w-2xl">
                {info.description}
              </p>

              <div className="flex flex-wrap gap-3">
                {episodes && episodes.length > 0 && (
                  <button
                    onClick={() => navigate(`/watch/${id}?ep=${episodes[0].episodeId}`)}
                    className="flex items-center gap-3 bg-foreground hover:bg-foreground/90 text-background px-8 py-3.5 rounded font-extrabold uppercase tracking-wide transition-all hover:scale-105"
                  >
                    <Play className="w-5 h-5 fill-current" /> Watch Now
                  </button>
                )}
                <button
                  onClick={() =>
                    inList ? removeFromWatchlist(info.id) : addToWatchlist(animeForWatchlist)
                  }
                  className={`flex items-center gap-3 px-7 py-3.5 rounded font-extrabold uppercase tracking-wide transition-all border ${
                    inList
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/80 backdrop-blur-md text-foreground border-border hover:border-primary/40"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${inList ? "fill-current" : ""}`} />
                  {inList ? "In Watchlist" : "Add to List"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Episodes */}
      <div className="relative z-20 px-8 md:px-16 lg:px-24 pb-16 -mt-4">
        {epLoading ? (
          <SkeletonGrid count={6} />
        ) : episodes && episodes.length > 0 ? (
          <div className="bg-card border border-border rounded-md p-5">
            <h3 className="text-xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              Episodes ({episodes.length})
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-72 overflow-y-auto">
              {episodes.map((ep: any) => (
                <button
                  key={ep.episodeId}
                  onClick={() => navigate(`/watch/${id}?ep=${ep.episodeId}`)}
                  title={ep.title}
                  className="py-2.5 px-1 rounded text-sm font-bold bg-secondary text-secondary-foreground
                    hover:bg-primary hover:text-primary-foreground transition-all uppercase tracking-wider"
                >
                  {ep.number}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AnimeDetailPage;
