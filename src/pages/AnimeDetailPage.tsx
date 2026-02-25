import { useParams, useNavigate } from "react-router-dom";
import { Heart, Play, Star, Clock, Film } from "lucide-react";
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
      <div className="pt-20 pb-10 container mx-auto px-4">
        <div className="animate-pulse flex flex-col md:flex-row gap-8">
          <div className="w-64 aspect-[3/4] bg-muted rounded-xl shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-20 bg-muted rounded" />
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
    <div className="pt-20 pb-10 container mx-auto px-4">
      {/* Hero */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <img src={info.poster} alt="" className="w-full h-full object-cover blur-3xl opacity-20 scale-110" />
        </div>
        <div className="relative flex flex-col md:flex-row gap-8 p-6">
          <img
            src={info.poster}
            alt={info.name}
            className="w-48 md:w-64 aspect-[3/4] object-cover rounded-xl neon-border shadow-neon-lg shrink-0 mx-auto md:mx-0"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-2">
              {info.name}
            </h1>
            {info.stats && (
              <div className="flex flex-wrap gap-3 mb-4">
                {info.stats.rating && (
                  <span className="flex items-center gap-1 text-sm text-accent">
                    <Star className="w-4 h-4" /> {info.stats.rating}
                  </span>
                )}
                {info.stats.type && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Film className="w-4 h-4" /> {info.stats.type}
                  </span>
                )}
                {info.stats.duration && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" /> {info.stats.duration}
                  </span>
                )}
              </div>
            )}

            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((g: string) => (
                  <span key={g} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                    {g}
                  </span>
                ))}
              </div>
            )}

            <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-5">
              {info.description}
            </p>

            <div className="flex flex-wrap gap-3">
              {episodes && episodes.length > 0 && (
                <button
                  onClick={() => navigate(`/watch/${id}?ep=${episodes[0].episodeId}`)}
                  className="btn-neon flex items-center gap-2"
                >
                  <Play className="w-4 h-4" /> Watch Now
                </button>
              )}
              <button
                onClick={() =>
                  inList ? removeFromWatchlist(info.id) : addToWatchlist(animeForWatchlist)
                }
                className={`flex items-center gap-2 ${inList ? "btn-accent" : "btn-glass"}`}
              >
                <Heart className={`w-4 h-4 ${inList ? "fill-current" : ""}`} />
                {inList ? "In Watchlist" : "Add to Watchlist"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes */}
      {epLoading ? (
        <SkeletonGrid count={6} />
      ) : episodes && episodes.length > 0 ? (
        <div className="glass-card p-4">
          <h3 className="text-lg font-display font-semibold text-foreground mb-3">
            Episodes ({episodes.length})
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-72 overflow-y-auto">
            {episodes.map((ep: any) => (
              <button
                key={ep.episodeId}
                onClick={() => navigate(`/watch/${id}?ep=${ep.episodeId}`)}
                title={ep.title}
                className="py-2 px-1 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground
                  hover:bg-primary/20 hover:text-foreground transition-all"
              >
                {ep.number}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AnimeDetailPage;
