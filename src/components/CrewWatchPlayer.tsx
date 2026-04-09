import { Download, Play } from "lucide-react";

interface VideoVersion {
  label: string;
  embed_url: string;
  drive_url?: string;
}

interface CrewWatchPlayerProps {
  embedUrl: string;
  driveUrl?: string;
  title: string;
  episodeNumber: number;
  episodeTitle?: string;
  /** Alternate versions like Sub, Dub, Hindi etc — each is a separate video */
  versions?: VideoVersion[];
  activeVersionIndex?: number;
  onVersionChange?: (index: number) => void;
}

const CrewWatchPlayer = ({
  embedUrl,
  driveUrl,
  title,
  episodeNumber,
  episodeTitle,
  versions,
  activeVersionIndex = 0,
  onVersionChange,
}: CrewWatchPlayerProps) => {
  if (!embedUrl) {
    return (
      <div className="w-full aspect-video bg-card border border-border rounded-2xl flex items-center justify-center">
        <div className="text-center space-y-2">
          <Play className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-sm">Select an episode to start watching</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Player */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border shadow-2xl bg-black">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          title={`${title} - Episode ${episodeNumber}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        />
        {/* CrewWatch watermark */}
        <div className="absolute top-3 right-3 bg-background/60 backdrop-blur-md border border-border rounded-lg px-3 py-1 pointer-events-none">
          <span className="text-xs font-display font-black tracking-widest text-primary uppercase">
            CrewWatch
          </span>
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            Playing:{" "}
            <span className="text-foreground font-bold">
              Episode {episodeNumber}
            </span>
            {episodeTitle && ` — ${episodeTitle}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Version switcher (Sub/Dub/Hindi etc.) */}
          {versions && versions.length > 1 && (
            <div className="flex items-center gap-1.5">
              {versions.map((v, i) => (
                <button
                  key={i}
                  onClick={() => onVersionChange?.(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    i === activeVersionIndex
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}

          {/* Download */}
          {driveUrl && (
            <a
              href={driveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-lg text-foreground text-sm font-medium border border-border transition"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrewWatchPlayer;
