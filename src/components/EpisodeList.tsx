import type { Episode } from "@/types/anime";

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisodeId?: string;
  onSelect: (ep: Episode) => void;
}

const EpisodeList = ({ episodes, currentEpisodeId, onSelect }: EpisodeListProps) => {
  return (
    <div className="glass-card p-4">
      <h3 className="text-lg font-display font-semibold text-foreground mb-3">
        Episodes ({episodes.length})
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-64 overflow-y-auto pr-1">
        {episodes.map((ep) => {
          const isActive = ep.episodeId === currentEpisodeId;
          return (
            <button
              key={ep.episodeId}
              onClick={() => onSelect(ep)}
              title={ep.title}
              className={`py-2 px-1 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-primary text-primary-foreground shadow-neon"
                  : "bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-foreground"
                }
                ${ep.isFiller ? "opacity-60" : ""}
              `}
            >
              {ep.number}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EpisodeList;
