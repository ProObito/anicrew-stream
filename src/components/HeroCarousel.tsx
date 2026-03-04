import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SpotlightAnime {
  id: string | number;
  name: string;
  poster: string;
  bannerImage?: string | null;
  description?: string;
  type?: string;
  genres?: string[];
  rating?: string | null;
}

interface HeroCarouselProps {
  animes: SpotlightAnime[];
}

const SWIPE_THRESHOLD = 50;

const HeroCarousel = ({ animes }: HeroCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const items = animes.slice(0, 8);

  const dragStartX = useRef(0);
  const dragDeltaX = useRef(0);
  const isDragging = useRef(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % items.length), [items.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + items.length) % items.length), [items.length]);

  useEffect(() => {
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [next]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    dragDeltaX.current = e.clientX - dragStartX.current;
  };
  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragDeltaX.current < -SWIPE_THRESHOLD) next();
    else if (dragDeltaX.current > SWIPE_THRESHOLD) prev();
    dragDeltaX.current = 0;
  };

  if (!items.length) return null;
  const anime = items[current];
  const heroImage = anime.bannerImage || anime.poster;
  const animeLink = `/anime/anilist/${anime.id}`;

  return (
    <div className="relative w-full">
      {/* Full-width hero banner */}
      <div
        className="relative w-full h-[30vh] sm:h-[50vh] md:h-[70vh] lg:h-[80vh] overflow-hidden cursor-grab active:cursor-grabbing select-none touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={String(anime.id)}
            src={heroImage}
            alt={anime.name}
            draggable={false}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover sm:object-cover object-center pointer-events-none"
          />
        </AnimatePresence>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent pointer-events-none" />

        {/* Content overlay - left aligned like reference */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-12 lg:p-16 pointer-events-none">
          <div className="max-w-3xl">
            {/* Genre tags */}
            {anime.genres && anime.genres.length > 0 && (
              <motion.div
                key={`genres-${current}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-wrap gap-2 mb-3"
              >
                {anime.genres.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/50 text-primary bg-primary/10 backdrop-blur-sm"
                  >
                    {g}
                  </span>
                ))}
                {anime.rating && (
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-primary/20 text-primary backdrop-blur-sm">
                    ⭐ {anime.rating}
                  </span>
                )}
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              key={`title-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-black text-foreground drop-shadow-2xl uppercase leading-tight mb-2 sm:mb-3"
            >
              {anime.name}
            </motion.h1>

            {/* Description */}
            {anime.description && (
              <motion.p
                key={`desc-${current}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden sm:block text-sm md:text-base text-muted-foreground max-w-xl line-clamp-2 mb-5"
              >
                {anime.description}
              </motion.p>
            )}

            {/* Action buttons */}
            <motion.div
              key={`actions-${current}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 pointer-events-auto"
            >
              <Link
                to={animeLink}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 px-4 sm:px-7 py-2 sm:py-3 rounded-xl text-primary-foreground font-bold text-sm sm:text-base tracking-wide transition-all hover:scale-105 shadow-neon"
              >
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </Link>
              <Link
                to={animeLink}
                className="hidden sm:flex items-center gap-2 bg-secondary/80 hover:bg-secondary backdrop-blur-md px-7 py-3 rounded-xl text-foreground font-bold tracking-wide border border-border hover:border-primary/40 transition-all"
              >
                <Info className="w-5 h-5" />
                Details
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Nav arrows */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/30 hover:bg-background/60 p-2.5 rounded-full backdrop-blur-sm transition-all opacity-0 hover:opacity-100 focus:opacity-100 z-10 group"
          style={{ opacity: undefined }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/30 hover:bg-background/60 p-2.5 rounded-full backdrop-blur-sm transition-all opacity-0 hover:opacity-100 focus:opacity-100 z-10"
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>
      </div>

      {/* Slide indicators - bottom bar style */}
      <div className="flex justify-center gap-1.5 -mt-8 relative z-10">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === current ? "w-8 bg-primary" : "w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
