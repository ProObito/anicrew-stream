import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Play, Info, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [next]);

  if (!items.length) return null;

  const anime = items[current];

  return (
    <div className="relative w-full h-[85vh] md:h-[90vh] flex items-end">
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={anime.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={anime.poster}
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <motion.div
        key={`content-${current}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 pb-24 px-8 md:px-16 lg:px-24 max-w-3xl"
      >
        {anime.rank && (
          <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3">
            #{anime.rank} Spotlight
          </span>
        )}
        <h1 className="text-5xl md:text-8xl font-display uppercase tracking-tight mb-4 text-foreground leading-none">
          {anime.name}
        </h1>

        <div className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase mb-5 text-muted-foreground">
          {anime.type && (
            <span className="border border-border px-2 py-0.5 rounded text-[10px] text-foreground">{anime.type}</span>
          )}
          {anime.episodes?.sub && (
            <span className="text-primary">SUB {anime.episodes.sub}</span>
          )}
          {anime.episodes?.dub && (
            <span className="text-secondary-foreground">DUB {anime.episodes.dub}</span>
          )}
        </div>

        {anime.description && (
          <p className="text-sm md:text-base text-muted-foreground line-clamp-3 mb-8 max-w-2xl leading-relaxed hidden md:block">
            {anime.description}
          </p>
        )}

        <div className="flex items-center gap-4">
          <Link
            to={`/anime/${anime.id}`}
            className="flex items-center gap-3 bg-foreground hover:bg-foreground/90 text-background px-8 py-3.5 rounded font-extrabold uppercase tracking-wide transition-all hover:scale-105"
          >
            <Play size={20} className="fill-current" /> Watch Now
          </Link>
          <Link
            to={`/anime/${anime.id}`}
            className="flex items-center gap-3 bg-secondary/80 hover:bg-secondary backdrop-blur-md text-foreground px-7 py-3.5 rounded font-extrabold uppercase tracking-wide transition-all border border-border"
          >
            <Info size={20} /> More Info
          </Link>
        </div>
      </motion.div>

      {/* Navigation */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-border bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/70 hover:border-primary/50 transition-all z-20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-border bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/70 hover:border-primary/50 transition-all z-20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === current ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
