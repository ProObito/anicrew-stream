import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnimeCard from "./AnimeCard";
import { SkeletonGrid } from "./SkeletonCard";
import type { AnimeResult } from "@/types/anime";

interface AnimeGridProps {
  title: string;
  animes: AnimeResult[] | undefined;
  isLoading?: boolean;
  count?: number;
  variant?: "poster" | "landscape";
}

const AnimeGrid = ({ title, animes, isLoading, count = 12, variant = "poster" }: AnimeGridProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = dir === "left" ? -400 : 400;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <section className="mb-8 px-8 md:px-16 lg:px-24">
        <h2 className="section-title mb-4 border-l-4 border-primary pl-4">{title}</h2>
        <SkeletonGrid count={6} />
      </section>
    );
  }

  if (!animes || animes.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="px-8 md:px-16 lg:px-24">
        <div className="flex items-center justify-between mb-4 group/header">
          <h2 className="section-title border-l-4 border-primary pl-4 flex items-center gap-2">
            {title}
            <ChevronRight size={18} className="text-primary opacity-0 -translate-x-2 group-hover/header:opacity-100 group-hover/header:translate-x-0 transition-all" />
          </h2>
          <div className="flex gap-2">
            <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full border border-border bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full border border-border bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar pb-6 pt-2 px-8 md:px-16 lg:px-24"
      >
        {animes.slice(0, count).map((anime) => (
          <AnimeCard key={anime.id} anime={anime} variant={variant} />
        ))}
      </div>
    </section>
  );
};

export default AnimeGrid;
