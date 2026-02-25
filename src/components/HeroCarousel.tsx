import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

interface SpotlightAnime {
  id: string;
  name: string;
  poster: string;
  description?: string;
  rank?: number;
  episodes?: { sub?: number; dub?: number };
  type?: string;
}

interface HeroCarouselProps {
  animes: SpotlightAnime[];
}

const HeroCarousel = ({ animes }: HeroCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const items = animes.slice(0, 8);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  if (!items.length) return null;

  const anime = items[current];

  return (
    <div className="relative w-full h-[50vh] md:h-[65vh] rounded-2xl overflow-hidden mb-12">
      {/* Background image */}
      <div className="absolute inset-0 transition-all duration-700">
        <img
          src={anime.poster}
          alt=""
          className="w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 md:p-12 max-w-2xl">
        {anime.rank && (
          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2">
            #{anime.rank} Spotlight
          </span>
        )}
        <h2 className="text-2xl md:text-5xl font-display font-bold text-foreground mb-3 line-clamp-2">
          {anime.name}
        </h2>
        <div className="flex items-center gap-3 mb-3">
          {anime.type && (
            <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
              {anime.type}
            </span>
          )}
          {anime.episodes?.sub && (
            <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-xs font-medium">
              SUB {anime.episodes.sub}
            </span>
          )}
          {anime.episodes?.dub && (
            <span className="px-2 py-0.5 rounded-md bg-accent/20 text-accent text-xs font-medium">
              DUB {anime.episodes.dub}
            </span>
          )}
        </div>
        {anime.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-5 hidden md:block">
            {anime.description}
          </p>
        )}
        <Link
          to={`/anime/${anime.id}`}
          className="btn-neon w-fit flex items-center gap-2"
        >
          <Play className="w-4 h-4" /> Watch Now
        </Link>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/70 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/70 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
