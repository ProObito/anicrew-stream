import { Link } from "react-router-dom";
import { Heart, Play, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useWatchlistStore } from "@/store/watchlistStore";
import type { AnimeResult } from "@/types/anime";

interface AnimeCardProps {
  anime: AnimeResult;
  variant?: "poster" | "landscape";
}

const AnimeCard = ({ anime, variant = "poster" }: AnimeCardProps) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
  const inList = isInWatchlist(anime.id);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inList) removeFromWatchlist(anime.id);
    else addToWatchlist(anime);
  };

  const isLandscape = variant === "landscape";

  return (
    <Link to={`/anime/${anime.id}`} className="block flex-shrink-0">
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ duration: 0.2 }}
        className={`relative cursor-pointer group rounded-md overflow-hidden bg-card ${
          isLandscape ? "w-72 aspect-video" : "w-44 md:w-48 aspect-[2/3]"
        }`}
      >
        <img
          src={anime.poster}
          alt={anime.name}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          loading="lazy"
        />

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 z-10">
          {anime.rating && (
            <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-lg">
              {anime.rating}
            </span>
          )}
        </div>

        {/* Watchlist */}
        <button
          onClick={toggleWatchlist}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 z-10
            ${inList
              ? "bg-primary text-primary-foreground"
              : "bg-background/50 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100"
            }`}
        >
          <Heart className={`w-3.5 h-3.5 ${inList ? "fill-current" : ""}`} />
        </button>

        {/* Hover play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/30">
          <div className="w-12 h-12 rounded-full border-2 border-foreground flex items-center justify-center bg-background/40 backdrop-blur-sm">
            <Play size={20} className="fill-foreground text-foreground ml-0.5" />
          </div>
        </div>

        {/* Bottom gradient info */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background via-background/80 to-transparent p-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-foreground truncate text-sm mb-1">
            {anime.name}
          </h3>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
            <span className="uppercase tracking-widest">{anime.type}</span>
            <div className="flex gap-1.5">
              {anime.episodes?.sub && (
                <span className="text-primary font-bold">SUB {anime.episodes.sub}</span>
              )}
              {anime.episodes?.dub && (
                <span className="text-secondary-foreground font-bold">DUB {anime.episodes.dub}</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default AnimeCard;
