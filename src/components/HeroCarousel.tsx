import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Play, Heart, Info, ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="relative w-full flex flex-col items-center px-4 md:px-12 pt-20">
      {/* Main Banner */}
      <div className="relative w-full max-w-7xl h-[350px] md:h-[500px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
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
              alt={anime.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Title on banner */}
        <div className="absolute inset-0 flex items-end justify-center pb-12">
          <motion.h1
            key={`title-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-6xl font-display font-black tracking-wider text-foreground drop-shadow-2xl text-center px-4 uppercase"
          >
            {anime.name}
          </motion.h1>
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-background/40 hover:bg-background/80 p-3 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100 z-10"
        >
          <ChevronLeft className="w-8 h-8 text-primary" />
        </button>
        <button
          onClick={next}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-background/40 hover:bg-background/80 p-3 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100 z-10"
        >
          <ChevronRight className="w-8 h-8 text-primary" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-4">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${
              i === current ? "bg-primary scale-125" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>

      {/* Action buttons - Favorite / Watch Now / Learn more */}
      <motion.div
        key={`actions-${current}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-wrap justify-center items-center gap-6 mt-6"
      >
        <button className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition group">
          <Heart className="w-5 h-5 group-hover:text-primary transition-colors" />
          <span className="font-medium">Favorite</span>
        </button>

        <Link
          to={`/anime/${anime.id}`}
          className="flex items-center space-x-2 bg-primary hover:bg-primary/90 px-10 py-3.5 rounded-full text-primary-foreground shadow-neon transition-all transform hover:scale-105"
        >
          <Play className="w-5 h-5 fill-current" />
          <span className="font-bold tracking-wide">Watch now</span>
        </Link>

        <Link
          to={`/anime/${anime.id}`}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition"
        >
          <Info className="w-5 h-5" />
          <span className="font-medium">Learn more</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default HeroCarousel;
