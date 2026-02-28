import { useParams, useNavigate } from "react-router-dom";
import { Heart, Play, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAnimeDetail, useEpisodes } from "@/hooks/useAnimeData";
import { useWatchlistStore } from "@/store/watchlistStore";
import ErrorFallback from "@/components/ErrorFallback";

const AnimeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useAnimeDetail(id || "");
  const { data: episodes, isLoading: epLoading } = useEpisodes(id || "");
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-background text-foreground pb-20">

      {/* IMMERSIVE BANNER */}
      <div className="w-full flex flex-col items-center px-4 md:px-12 pt-24 mt-4">
        <div className="relative w-full max-w-7xl h-[350px] md:h-[500px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
          <img
            src={info.poster}
            alt={info.name}
            className="w-full h-full object-cover"
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

          {/* Title on banner */}
          <div className="absolute inset-0 flex items-end justify-center pb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-display font-black tracking-wider text-foreground drop-shadow-2xl mb-4 text-center px-4 uppercase"
            >
              {info.name}
            </motion.h1>
          </div>

          {/* Nav arrows (decorative) */}
          <button className="absolute left-6 top-1/2 -translate-y-1/2 bg-background/40 hover:bg-background/80 p-3 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100">
            <ChevronLeft className="w-8 h-8 text-primary" />
          </button>
          <button className="absolute right-6 top-1/2 -translate-y-1/2 bg-background/40 hover:bg-background/80 p-3 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100">
            <ChevronRight className="w-8 h-8 text-primary" />
          </button>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-6 mt-8"
        >
          <button
            onClick={() => inList ? removeFromWatchlist(info.id) : addToWatchlist(animeForWatchlist)}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition group"
          >
            <Heart className={`w-5 h-5 transition-colors ${inList ? "text-primary fill-current" : "group-hover:text-primary"}`} />
            <span className="font-medium">{inList ? "In Watchlist" : "Favorite"}</span>
          </button>

          {episodes && episodes.length > 0 && (
            <button
              onClick={() => navigate(`/watch/${id}?ep=${episodes[0].episodeId}`)}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 px-10 py-3.5 rounded-full text-primary-foreground shadow-neon transition-all transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              <span className="font-bold tracking-wide uppercase">Watch now</span>
            </button>
          )}

          <button className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition">
            <Info className="w-5 h-5" />
            <span className="font-medium">Learn more</span>
          </button>
        </motion.div>
      </div>

      {/* BOTTOM: Episodes Grid + Sidebar */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12">

        {/* LEFT: Episodes */}
        <div className="lg:col-span-8">
          <h2 className="text-2xl font-display font-bold mb-6 text-foreground uppercase tracking-tight">
            Episodes
          </h2>

          {epLoading ? (
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
                  onClick={() => navigate(`/watch/${id}?ep=${ep.episodeId}`)}
                  className="group cursor-pointer flex flex-col p-2 rounded-2xl transition-all hover:bg-secondary"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-card border border-border">
                    <img
                      src={info.poster}
                      alt={ep.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-100"
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-background/40 p-3 rounded-full group-hover:bg-primary/90 transition-all duration-300 backdrop-blur-md border border-border group-hover:scale-110">
                        <Play className="w-6 h-6 ml-0.5 fill-current text-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="px-1">
                    <h3 className="font-semibold transition text-lg truncate text-foreground/80 group-hover:text-foreground">
                      {info.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Episode {ep.number} • {ep.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No episodes available.</p>
          )}
        </div>

        {/* RIGHT: Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-card p-6 rounded-[2rem] border border-border h-full shadow-xl">
            <div className="bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-lg inline-block mb-5">
              Details & Info
            </div>

            <h3 className="text-xl font-display font-bold leading-snug mb-5 text-foreground uppercase">
              Synopsis
            </h3>

            {/* Cover Image */}
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] group">
              <img
                src={info.poster}
                alt={info.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Meta info */}
            {info.stats && (
              <div className="flex flex-wrap gap-2 mb-4">
                {info.stats.type && (
                  <span className="text-xs font-bold uppercase tracking-wider bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {info.stats.type}
                  </span>
                )}
                {info.stats.rating && (
                  <span className="text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-1 rounded">
                    ★ {info.stats.rating}
                  </span>
                )}
                {info.stats.duration && (
                  <span className="text-xs font-bold uppercase tracking-wider bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {info.stats.duration}
                  </span>
                )}
              </div>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((g: string) => (
                  <span key={g} className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                    {g}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground leading-relaxed text-justify">
              {info.description || "No description available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;
