import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import { motion } from "framer-motion";
import { ax, axTitle, axCover, type AXCard } from "@/lib/animex";

const ROWS: { title: string; key: string; fetch: () => Promise<{ items: AXCard[] }> }[] = [
  { title: "Trending Anime", key: "trending", fetch: () => ax.trending(30) },
  { title: "Popular Anime", key: "popular", fetch: () => ax.popular(30) },
  { title: "This Season", key: "season", fetch: () => ax.season(30) },
];

function AnimeRow({ title, items }: { title: string; items: AXCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "l" | "r") => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === "l" ? -400 : 400, behavior: "smooth" });
  };
  if (!items?.length) return null;
  return (
    <section className="mb-4">
      <div className="px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-display font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll("l")} className="w-7 h-7 rounded-lg border border-border/50 bg-card/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => scroll("r")} className="w-7 h-7 rounded-lg border border-border/50 bg-card/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
      <div ref={ref} className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 pt-1 px-6 md:px-12 lg:px-16">
        {items.map((a) => (
          <Link key={a.id} to={`/anime/x/${a.id}`} className="block flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.04, y: -4 }}
              transition={{ duration: 0.25 }}
              className="relative cursor-pointer group overflow-hidden bg-card/50 border border-border/50 hover:border-primary/40 rounded-xl w-40 md:w-44"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
                {axCover(a) ? (
                  <img src={axCover(a)} alt={axTitle(a)} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                )}
                {a.averageScore && (
                  <div className="absolute top-2 left-2 z-10 bg-background/70 backdrop-blur-md text-primary text-[10px] font-bold px-2 py-0.5 rounded-md border border-primary/20 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> {(a.averageScore / 10).toFixed(1)}
                  </div>
                )}
                {a.format && (
                  <div className="absolute top-2 right-2 z-10 bg-primary/80 text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {a.format}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/20 backdrop-blur-[2px]">
                  <div className="w-11 h-11 rounded-xl bg-primary/90 flex items-center justify-center shadow-neon">
                    <Play size={18} className="fill-primary-foreground text-primary-foreground ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-2.5">
                <h3 className="font-semibold text-foreground truncate text-xs mb-1">{axTitle(a)}</h3>
                <div className="flex items-center justify-between text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                  <span>{a.format || "Anime"}</span>
                  {a.seasonYear && <span>{a.seasonYear}</span>}
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}

const AnimePage = () => {
  const queries = useQueries({
    queries: ROWS.map((r) => ({
      queryKey: ["ax", r.key],
      queryFn: r.fetch,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);

  return (
    <div className="pt-20 pb-24 md:pb-10">
      <div className="px-6 md:px-12 lg:px-16 mb-6">
        <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight">Anime</h1>
        <p className="text-sm text-muted-foreground mt-1">Multi-server playback with sub & dub. Auto-fallback when a server fails.</p>
      </div>

      {isLoading && (
        <div className="px-6 md:px-12 lg:px-16 text-muted-foreground text-sm">Loading anime catalogue...</div>
      )}

      {queries.map((q, idx) => (
        <AnimeRow key={ROWS[idx].key} title={ROWS[idx].title} items={(q.data as any)?.items || []} />
      ))}
    </div>
  );
};

export default AnimePage;
