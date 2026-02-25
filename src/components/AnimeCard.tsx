import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWatchlistStore } from "@/store/watchlistStore";
import type { AnimeResult } from "@/types/anime";

interface AnimeCardProps {
  anime: AnimeResult;
}

const AnimeCard = ({ anime }: AnimeCardProps) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
  const inList = isInWatchlist(anime.id);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inList) removeFromWatchlist(anime.id);
    else addToWatchlist(anime);
  };

  return (
    <Link to={`/anime/${anime.id}`} className="anime-card animate-fade-in">
      <div className="relative overflow-hidden">
        <img
          src={anime.poster}
          alt={anime.name}
          className="anime-card-image"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Watchlist button */}
        <button
          onClick={toggleWatchlist}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10
            ${inList
              ? "bg-primary text-primary-foreground shadow-neon"
              : "bg-background/60 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
        >
          <Heart className={`w-4 h-4 ${inList ? "fill-current" : ""}`} />
        </button>

        {/* Badge */}
        {anime.rating && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-accent/90 text-accent-foreground text-xs font-bold">
            {anime.rating}
          </span>
        )}

        {/* Episodes badge */}
        <div className="absolute bottom-2 left-2 flex gap-1.5">
          {anime.episodes?.sub && (
            <span className="px-1.5 py-0.5 rounded bg-primary/80 text-primary-foreground text-[10px] font-medium">
              SUB {anime.episodes.sub}
            </span>
          )}
          {anime.episodes?.dub && (
            <span className="px-1.5 py-0.5 rounded bg-accent/80 text-accent-foreground text-[10px] font-medium">
              DUB {anime.episodes.dub}
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium text-foreground truncate leading-tight">
          {anime.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {anime.type} {anime.duration && `• ${anime.duration}`}
        </p>
      </div>
    </Link>
  );
};

export default AnimeCard;
