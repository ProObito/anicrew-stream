import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TmdbCard from "./TmdbCard";
import type { TmdbItem } from "@/lib/tmdb";

interface Props {
  title: string;
  items?: TmdbItem[];
  kind?: "movie" | "tv";
  isLoading?: boolean;
}

const TmdbRow = ({ title, items, kind, isLoading }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({ left: dir === "left" ? -500 : 500, behavior: "smooth" });

  if (isLoading) {
    return (
      <section className="mb-6">
        <div className="px-4 md:px-12 lg:px-16 mb-3">
          <h2 className="text-lg md:text-xl font-display font-bold uppercase tracking-tight flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            {title}
          </h2>
        </div>
        <div className="flex gap-3 px-4 md:px-12 lg:px-16">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-36 md:w-44 aspect-[2/3] rounded-xl skeleton-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-4">
      <div className="px-4 md:px-12 lg:px-16">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-display font-bold uppercase tracking-tight flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            {title}
          </h2>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => scroll("left")} className="w-7 h-7 rounded-lg border border-border/50 bg-card/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => scroll("right")} className="w-7 h-7 rounded-lg border border-border/50 bg-card/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
      <div ref={ref} className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 pt-1 px-4 md:px-12 lg:px-16 scroll-smooth">
        {items.map((it) => (
          <TmdbCard key={`${it.id}-${it.media_type ?? kind}`} item={it} kind={kind} />
        ))}
      </div>
    </section>
  );
};

export default TmdbRow;
