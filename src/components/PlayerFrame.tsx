import { ExternalLink } from "lucide-react";

interface Props {
  src: string;
  title?: string;
}

const PlayerFrame = ({ src, title }: Props) => {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border bg-black shadow-neon">
      <iframe
        src={src}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        title={title || "Player"}
        referrerPolicy="origin"
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
      />

      {/* Site logo overlay — pointer-events-none so it doesn't block player */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-2 bg-background/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-primary/30 shadow-neon">
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-display font-black text-sm leading-none">A</span>
        </div>
        <span className="text-xs font-display font-black uppercase tracking-widest text-foreground">
          Anicrew
        </span>
      </div>

      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-background/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary hover:border-primary/40 transition"
      >
        Open <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};

export default PlayerFrame;
