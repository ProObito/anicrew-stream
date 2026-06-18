import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { tmdbImg, itemTitle, itemYear, type TmdbItem } from "@/lib/tmdb";

interface Props {
  items: TmdbItem[];
  kind: "movie" | "tv";
}

const TmdbHeroSlider = ({ items, kind }: Props) => {
  const [idx, setIdx] = useState(0);
  const slides = items.filter((i) => i.backdrop_path).slice(0, 7);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;
  const cur = slides[idx];
  const title = itemTitle(cur);
  const year = itemYear(cur);
  const to = `/${kind === "movie" ? "movies" : "series"}/${cur.id}`;

  return (
    <div className="relative w-full h-[55vh] md:h-[70vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={cur.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={tmdbImg(cur.backdrop_path, "original")}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 lg:px-24 lg:pb-16 max-w-3xl">
        <motion.div
          key={cur.id + "-text"}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-6xl font-display font-black uppercase tracking-tight mb-3 text-foreground drop-shadow-lg">
            {title}
          </h1>
          <div className="flex items-center gap-3 mb-3 text-xs md:text-sm text-muted-foreground uppercase tracking-widest font-bold">
            {year && <span>{year}</span>}
            {cur.vote_average ? <span className="text-primary">★ {cur.vote_average.toFixed(1)}</span> : null}
            <span>{kind === "movie" ? "Movie" : "Series"}</span>
          </div>
          {cur.overview && (
            <p className="text-sm md:text-base text-foreground/80 line-clamp-3 mb-5 max-w-2xl">
              {cur.overview}
            </p>
          )}
          <div className="flex items-center gap-3">
            <Link
              to={to}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider shadow-neon hover:brightness-110 transition"
            >
              <Play className="w-4 h-4 fill-current" /> Watch
            </Link>
            <Link
              to={to}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/70 backdrop-blur border border-border text-foreground font-bold text-sm uppercase tracking-wider hover:border-primary/50 transition"
            >
              <Info className="w-4 h-4" /> Details
            </Link>
          </div>
        </motion.div>
      </div>

      {/* arrows */}
      <button
        onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/40 backdrop-blur border border-border/50 flex items-center justify-center text-foreground hover:bg-primary/80 transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setIdx((i) => (i + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/40 backdrop-blur border border-border/50 flex items-center justify-center text-foreground hover:bg-primary/80 transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* dots */}
      <div className="absolute bottom-3 right-4 md:right-16 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-foreground/40"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TmdbHeroSlider;
