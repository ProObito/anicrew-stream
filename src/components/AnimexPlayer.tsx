import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RefreshCcw, ExternalLink } from "lucide-react";
import { ax } from "@/lib/animex";

interface Props {
  slug: string;
  anilistId: number;
  episode: number;
  title?: string;
}

type Track = "sub" | "dub";

/**
 * AnimeX multi-server player.
 * - Lists every available sub/dub provider as a switchable server
 * - Auto-falls back to the next provider on load/playback error
 * - Plays HLS (.m3u8) via hls.js, or iframe for embed-type providers
 */
const AnimexPlayer = ({ slug, anilistId, episode, title }: Props) => {
  const [track, setTrack] = useState<Track>("sub");
  const [activeIdx, setActiveIdx] = useState(0);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const { data: serversData, isLoading: srvLoading } = useQuery({
    queryKey: ["ax", "servers", slug, episode],
    queryFn: () => ax.servers(slug, episode),
    enabled: !!slug && !!episode,
  });

  const providers: any[] =
    (track === "sub" ? serversData?.subProviders : serversData?.dubProviders) || [];

  // Reset active index when track / episode changes
  useEffect(() => {
    setActiveIdx(0);
    setFailed(new Set());
  }, [track, episode, slug]);

  const current = providers[activeIdx];
  const key = current ? `${track}:${current.id}` : "";

  const { data: srcData, isLoading: srcLoading, isError, refetch } = useQuery({
    queryKey: ["ax", "sources", slug, episode, track, current?.id],
    queryFn: () => ax.sources(slug, episode, current.id, track),
    enabled: !!current && current.type !== "embed",
    retry: 0,
  });

  // Auto-fallback when fetch errors
  useEffect(() => {
    if (isError && current) {
      markFailedAndRotate(activeIdx, current.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  const markFailedAndRotate = (idx: number, id: string) => {
    setFailed((prev) => {
      const next = new Set(prev);
      next.add(`${track}:${id}`);
      return next;
    });
    // pick next non-failed
    for (let i = 1; i <= providers.length; i++) {
      const cand = (idx + i) % providers.length;
      const candKey = `${track}:${providers[cand].id}`;
      if (!failed.has(candKey) && cand !== idx) {
        setActiveIdx(cand);
        return;
      }
    }
  };

  // Mount HLS / native stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !current || current.type === "embed") return;
    const stream = srcData?.sources?.[0];
    if (!stream?.url) return;

    // Cleanup previous
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const url = stream.url;
    const isHls = stream.type?.includes("mpegurl") || url.includes(".m3u8");

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          markFailedAndRotate(activeIdx, current.id);
        }
      });
    } else {
      video.src = url;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcData, current]);

  const allFailed =
    providers.length > 0 &&
    providers.every((p) => failed.has(`${track}:${p.id}`));

  const retry = () => {
    setFailed(new Set());
    setActiveIdx(0);
    refetch();
  };

  return (
    <div className="w-full">
      {/* Sub/Dub toggle */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex rounded-full overflow-hidden border border-border">
          {(["sub", "dub"] as Track[]).map((t) => {
            const count =
              t === "sub" ? serversData?.subProviders?.length : serversData?.dubProviders?.length;
            const disabled = !count;
            return (
              <button
                key={t}
                disabled={disabled}
                onClick={() => setTrack(t)}
                className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                  track === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                {t} {count ? `(${count})` : ""}
              </button>
            );
          })}
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground ml-auto">
          Episode {episode}
        </span>
      </div>

      {/* Player */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border bg-black shadow-neon">
        {allFailed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
            <AlertCircle className="w-8 h-8 text-primary" />
            <p className="text-sm text-muted-foreground">All servers failed.</p>
            <button onClick={retry} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">
              <RefreshCcw className="w-3 h-3" /> Retry
            </button>
          </div>
        ) : srvLoading || (current && current.type !== "embed" && srcLoading) ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : current?.type === "embed" && current.url ? (
          <iframe
            key={current.id}
            src={current.url}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            title={title || "Player"}
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups"
            onError={() => current && markFailedAndRotate(activeIdx, current.id)}
          />
        ) : srcData?.sources?.[0]?.url ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full bg-black"
            controls
            playsInline
            onError={() => current && markFailedAndRotate(activeIdx, current.id)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            No source.
          </div>
        )}

        {/* Site logo */}
        <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-2 bg-background/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-primary/30 shadow-neon">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-black text-sm leading-none">A</span>
          </div>
          <span className="text-xs font-display font-black uppercase tracking-widest text-foreground">
            Anicrew
          </span>
        </div>

        {current?.type === "embed" && current.url && (
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-background/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition"
          >
            Open <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Server switcher */}
      {providers.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mr-1">
            Servers:
          </span>
          {providers.map((p, i) => {
            const isActive = i === activeIdx;
            const isFailed = failed.has(`${track}:${p.id}`);
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActiveIdx(i);
                  setFailed((prev) => {
                    const n = new Set(prev);
                    n.delete(`${track}:${p.id}`);
                    return n;
                  });
                }}
                title={p.tip}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : isFailed
                    ? "bg-secondary/40 text-muted-foreground border-destructive/40 line-through"
                    : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                }`}
              >
                {p.id}
              </button>
            );
          })}
          <button
            onClick={retry}
            className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary border border-border hover:border-primary/40 transition"
          >
            <RefreshCcw className="w-3 h-3" /> Reload
          </button>
        </div>
      )}
    </div>
  );
};

export default AnimexPlayer;
