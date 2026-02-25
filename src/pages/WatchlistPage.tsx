import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { useWatchlistStore } from "@/store/watchlistStore";

const WatchlistPage = () => {
  const { items, removeFromWatchlist } = useWatchlistStore();

  return (
    <div className="pt-20 pb-10 container mx-auto px-4">
      <h1 className="text-3xl font-display font-bold gradient-text mb-8 flex items-center gap-3">
        <Heart className="w-8 h-8 text-primary" /> My Watchlist
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground text-lg mb-2">Your watchlist is empty</p>
          <p className="text-muted-foreground text-sm mb-6">Start adding anime to keep track</p>
          <Link to="/" className="btn-neon">
            Browse Anime
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <div key={item.id} className="anime-card animate-fade-in">
              <Link to={`/anime/${item.id}`}>
                <div className="relative overflow-hidden">
                  <img
                    src={item.poster}
                    alt={item.name}
                    className="anime-card-image"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 left-2 flex gap-1.5">
                    {item.episodes?.sub && (
                      <span className="px-1.5 py-0.5 rounded bg-primary/80 text-primary-foreground text-[10px] font-medium">
                        SUB {item.episodes.sub}
                      </span>
                    )}
                    {item.episodes?.dub && (
                      <span className="px-1.5 py-0.5 rounded bg-accent/80 text-accent-foreground text-[10px] font-medium">
                        DUB {item.episodes.dub}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.type}</p>
                </div>
              </Link>
              <button
                onClick={() => removeFromWatchlist(item.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive/80 text-destructive-foreground
                  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
