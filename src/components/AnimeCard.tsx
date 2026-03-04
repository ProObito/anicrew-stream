import { Link } from "react-router-dom";
import { Heart, Play } from "lucide-react";
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
  const linkTo = `/anime/${anime.id}`;

  return (
    <Link to={linkTo} className="block flex-shrink-0">
      <motion.div
        whileHover={{ scale: 1.04, y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`relative cursor-pointer group overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 ${
          isLandscape
            ? "w-72 aspect-video rounded-xl"
            : "w-40 md:w-44 rounded-xl"
        }`}
      >
        {/* Image */}
        <div className={`relative overflow-hidden ${isLandscape ? "" : "aspect-[2/3]"}`}>
          <img
            src={anime.poster}
            alt={anime.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />

          {/* Rating badge */}
          {anime.rating && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-background/70 backdrop-blur-md text-primary text-[10px] font-bold px-2 py-0.5 rounded-md border border-primary/20">
                {anime.rating}
              </span>
            </div>
          )}

          {/* Watchlist */}
          <button
            onClick={toggleWatchlist}
            className={`absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 z-10
              ${inList
                ? "bg-primary text-primary-foreground"
                : "bg-background/40 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100"
              }`}
          >
            <Heart className={`w-3.5 h-3.5 ${inList ? "fill-current" : ""}`} />
          </button>

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/20 backdrop-blur-[2px]">
            <div className="w-11 h-11 rounded-xl bg-primary/90 flex items-center justify-center shadow-neon">
              <Play size={18} className="fill-primary-foreground text-primary-foreground ml-0.5" />
            </div>
          </div>

          {/* Bottom gradient */}
          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-card to-transparent pointer-events-none" />
        </div>

        {/* Info */}
        <div className="p-2.5">
          <h3 className="font-semibold text-foreground truncate text-xs mb-1">
            {anime.name}
          </h3>
          <div className="flex items-center justify-between text-[9px] text-muted-foreground font-medium">
            <span className="uppercase tracking-wider">{anime.type}</span>
            <div className="flex gap-1">
              {anime.episodes?.sub && (
                <span className="text-primary font-bold">EP {anime.episodes.sub}</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default AnimeCard;
