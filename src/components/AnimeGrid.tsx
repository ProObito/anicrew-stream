import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import AnimeCard from "./AnimeCard";
import { SkeletonGrid } from "./SkeletonCard";
import type { AnimeResult } from "@/types/anime";
import type { AnilistAnime } from "@/hooks/useAnilistHome";

interface AnimeGridProps {
  title: string;
  animes: (AnimeResult | AnilistAnime)[] | undefined;
  isLoading?: boolean;
  count?: number;
  variant?: "poster" | "landscape";
  isAnilist?: boolean;
}

const AnimeGrid = ({ title, animes, isLoading, count = 12, variant = "poster", isAnilist }: AnimeGridProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = dir === "left" ? -400 : 400;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <section className="mb-6 px-6 md:px-12 lg:px-16">
        <h2 className="section-title mb-4 border-l-4 border-primary pl-4">{title}</h2>
        <SkeletonGrid count={6} />
      </section>
    );
  }

  if (!animes || animes.length === 0) return null;

  return (
    <section className="mb-4">
      <div className="px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-display font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll("left")} className="w-7 h-7 rounded-lg border border-border/50 bg-card/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors backdrop-blur-sm">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => scroll("right")} className="w-7 h-7 rounded-lg border border-border/50 bg-card/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors backdrop-blur-sm">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 pt-1 px-6 md:px-12 lg:px-16"
      >
        {animes.slice(0, count).map((anime) => {
          if (isAnilist) {
            const a = anime as AnilistAnime;
            return (
              <AnimeCard
                key={a.id}
                anime={{
                  id: String(a.id),
                  name: a.name,
                  poster: a.poster,
                  duration: a.duration,
                  type: a.type,
                  rating: a.rating,
                  episodes: a.episodes,
                  jname: a.jname,
                }}
                variant={variant}
                searchLink
              />
            );
          }
          return <AnimeCard key={(anime as AnimeResult).id} anime={anime as AnimeResult} variant={variant} />;
        })}
      </div>
    </section>
  );
};

export default AnimeGrid;
