import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, AlertCircle, RefreshCcw } from "lucide-react";

export interface PlayerServer {
  label: string;
  url: string;
}

interface Props {
  servers: PlayerServer[];
  title?: string;
  /** Seconds before assuming the iframe is dead and trying the next server. */
  watchdogMs?: number;
}

/**
 * Multi-server video player with manual switching + auto-fallback on failure.
 * Cross-origin iframes don't fire reliable `onError`, so we also use a watchdog:
 * if the iframe doesn't fire `onLoad` within `watchdogMs`, mark it failed and rotate.
 */
const MultiServerPlayer = ({ servers, title, watchdogMs = 9000 }: Props) => {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Set<number>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);
  const watchdog = useRef<number | null>(null);

  // Clamp active when servers list changes
  useEffect(() => {
    if (active >= servers.length) setActive(0);
  }, [servers.length, active]);

  // Arm watchdog whenever we (re)load an iframe
  useEffect(() => {
    if (watchdog.current) window.clearTimeout(watchdog.current);
    if (!servers[active]) return;
    watchdog.current = window.setTimeout(() => {
      markFailedAndRotate(active);
    }, watchdogMs);
    return () => {
      if (watchdog.current) window.clearTimeout(watchdog.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reloadKey, servers.length]);

  const markFailedAndRotate = (idx: number) => {
    setFailed((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
    // pick next not-failed
    const total = servers.length;
    for (let i = 1; i <= total; i++) {
      const candidate = (idx + i) % total;
      if (!failed.has(candidate) && candidate !== idx) {
        setActive(candidate);
        return;
      }
    }
  };

  const handleLoad = () => {
    if (watchdog.current) window.clearTimeout(watchdog.current);
  };

  const allFailed = failed.size >= servers.length && servers.length > 0;
  const current = servers[active];

  const retry = () => {
    setFailed(new Set());
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border bg-black shadow-neon">
        {current && !allFailed ? (
          <iframe
            key={`${active}-${reloadKey}`}
            src={current.url}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            title={title || current.label}
            referrerPolicy="origin"
            onLoad={handleLoad}
            onError={() => markFailedAndRotate(active)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
            <AlertCircle className="w-8 h-8 text-primary" />
            <p className="text-sm text-muted-foreground">All servers failed to load.</p>
            <button
              onClick={retry}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider"
            >
              <RefreshCcw className="w-3 h-3" /> Retry all
            </button>
          </div>
        )}

        {/* Site logo overlay */}
        <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-2 bg-background/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-primary/30 shadow-neon">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-black text-sm leading-none">A</span>
          </div>
          <span className="text-xs font-display font-black uppercase tracking-widest text-foreground">
            Anicrew
          </span>
        </div>

        {current && (
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-background/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary hover:border-primary/40 transition"
          >
            Open <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Server switcher */}
      {servers.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mr-1">
            Servers:
          </span>
          {servers.map((s, i) => {
            const isActive = i === active;
            const isFailed = failed.has(i);
            return (
              <button
                key={`${s.label}-${i}`}
                onClick={() => {
                  setActive(i);
                  setFailed((prev) => {
                    const next = new Set(prev);
                    next.delete(i);
                    return next;
                  });
                  setReloadKey((k) => k + 1);
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : isFailed
                    ? "bg-secondary/40 text-muted-foreground border-destructive/40 line-through"
                    : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                }`}
                title={s.url}
              >
                {s.label}
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

/** Build a default server list for TMDB-based content. */
export function buildTmdbServers(tmdbId: number | string, kind: "movie" | "tv", season?: number, episode?: number): PlayerServer[] {
  if (kind === "movie") {
    return [
      { label: "VidSrc CC", url: `https://vidsrc.cc/v2/embed/movie/${tmdbId}?autoPlay=false` },
      { label: "VidSrc Pro", url: `https://vidsrc.to/embed/movie/${tmdbId}` },
      { label: "VidSrc XYZ", url: `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}` },
      { label: "2Embed", url: `https://www.2embed.cc/embed/${tmdbId}` },
      { label: "MultiEmbed", url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1` },
      { label: "MoviesAPI", url: `https://moviesapi.club/movie/${tmdbId}` },
    ];
  }
  const s = season ?? 1;
  const e = episode ?? 1;
  return [
    { label: "VidSrc CC", url: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${s}/${e}?autoPlay=false` },
    { label: "VidSrc Pro", url: `https://vidsrc.to/embed/tv/${tmdbId}/${s}/${e}` },
    { label: "VidSrc XYZ", url: `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${s}&episode=${e}` },
    { label: "2Embed", url: `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}` },
    { label: "MultiEmbed", url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}` },
    { label: "MoviesAPI", url: `https://moviesapi.club/tv/${tmdbId}-${s}-${e}` },
  ];
}

/** Build server list from multimovies detail sources + player wrapper servers. */
export function buildMMServers(
  slug: string,
  type: "movie" | "tv",
  sources: Array<{ title?: string; embed_url?: string }> = [],
  opts: { title?: string; season?: number; episode?: number } = {}
): PlayerServer[] {
  const base = "https://moviesapi.proyato.com/api";
  const params = new URLSearchParams({ type });
  if (opts.title) params.set("title", opts.title);
  if (opts.season) params.set("season", String(opts.season));
  if (opts.episode) params.set("episode", String(opts.episode));

  const wrapperServers: PlayerServer[] = [0, 1, 2, 3, 4].map((i) => {
    const p = new URLSearchParams(params);
    p.set("server", String(i));
    return { label: `Server ${i + 1}`, url: `${base}/player/${slug}?${p.toString()}` };
  });

  const direct: PlayerServer[] = (sources || [])
    .filter((s) => s?.embed_url)
    .map((s, i) => ({ label: s.title || `Direct ${i + 1}`, url: s.embed_url! }));

  return [...wrapperServers, ...direct];
}

export default MultiServerPlayer;
