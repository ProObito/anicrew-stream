import { useRef } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { tmdbImg } from "@/lib/tmdb";

interface EpisodeLite {
  episode_number: number;
  name?: string;
  still_path?: string | null;
  overview?: string;
  air_date?: string;
  runtime?: number | null;
}

interface Props {
  episodes: EpisodeLite[];
  active: number;
  onPick: (n: number) => void;
  fallbackBackdrop?: string | null;
}

const EpisodeSlider = ({ episodes, active, onPick, fallbackBackdrop }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });

  if (!episodes?.length) return <p className="text-muted-foreground text-sm">No episodes available.</p>;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" /> Episodes
          <span className="text-xs text-muted-foreground font-normal">({episodes.length})</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={() => scroll("left")} className="w-7 h-7 rounded-lg border border-border/50 bg-card/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => scroll("right")} className="w-7 h-7 rounded-lg border border-border/50 bg-card/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto hide-scrollbar pb-3 scroll-smooth -mx-1 px-1"
      >
        {episodes.map((ep) => {
          const thumb = ep.still_path ? tmdbImg(ep.still_path, "w300") : (fallbackBackdrop ? tmdbImg(fallbackBackdrop, "w500") : "");
          const isActive = ep.episode_number === active;
          return (
            <button
              key={ep.episode_number}
              onClick={() => onPick(ep.episode_number)}
              className={`flex-shrink-0 w-56 group text-left transition rounded-xl overflow-hidden border ${
                isActive ? "border-primary shadow-neon" : "border-border/50 hover:border-primary/40"
              }`}
            >
              <div className="relative aspect-video bg-secondary overflow-hidden">
                {thumb ? (
                  <img src={thumb} alt={ep.name || `Episode ${ep.episode_number}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No preview</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-background/70 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-foreground">
                  EP {ep.episode_number}
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-bold uppercase">
                    Now Playing
                  </div>
                )}
                <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-neon">
                  <Play size={14} className="fill-primary-foreground text-primary-foreground ml-0.5" />
                </div>
              </div>
              <div className="p-2.5 bg-card/60">
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">
                  Episode {ep.episode_number}
                </div>
                <div className="text-sm font-semibold text-foreground line-clamp-1">
                  {ep.name || "Untitled"}
                </div>
                {ep.air_date && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">{ep.air_date}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EpisodeSlider;
