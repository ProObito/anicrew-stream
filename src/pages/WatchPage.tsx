import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft, AlertCircle } from "lucide-react";
import { useEpisodes, useEpisodeSources } from "@/hooks/useAnimeData";
import VideoPlayer from "@/components/VideoPlayer";
import EpisodeList from "@/components/EpisodeList";
import ErrorFallback from "@/components/ErrorFallback";

const SERVERS = ["megaplay", "vidwish"] as const;
const CATEGORIES = ["sub", "dub"] as const;

const WatchPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const epId = searchParams.get("ep") || "";

  const [server, setServer] = useState<string>("megaplay");
  const [category, setCategory] = useState<string>("sub");
  const [triedServers, setTriedServers] = useState<string[]>([]);

  const { data: episodes } = useEpisodes(id || "");
  const { data: sources, isLoading: srcLoading, isError } = useEpisodeSources(epId, server, category);

  // Auto-select first episode
  useEffect(() => {
    if (!episodes?.length) return;
    const hasSelectedEpisode = episodes.some((episode: any) => episode.episodeId === epId);
    if (!epId || !hasSelectedEpisode) {
      setSearchParams({ ep: episodes[0].episodeId }, { replace: true });
    }
  }, [episodes, epId, setSearchParams]);

  // Auto server fallback
  useEffect(() => {
    if (isError && !triedServers.includes(server)) {
      setTriedServers((prev) => [...prev, server]);
      const nextServer = SERVERS.find((s) => s !== server && !triedServers.includes(s));
      if (nextServer) {
        setServer(nextServer);
      }
    }
  }, [isError, server, triedServers]);

  // Reset tried servers on episode change
  useEffect(() => {
    setTriedServers([]);
  }, [epId, category]);

  const currentIndex = episodes?.findIndex((e: any) => e.episodeId === epId) ?? -1;
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentEp = episodes?.[safeIndex];
  const hasPrev = safeIndex > 0;
  const hasNext = !!episodes && safeIndex < episodes.length - 1;
  const allServersFailed = triedServers.length >= SERVERS.length;

  const goToEp = (episodeId: string) => {
    setSearchParams({ ep: episodeId });
  };

  return (
    <div className="pt-20 pb-10 px-4 md:px-16 lg:px-24">
      {/* Back button */}
      <button
        onClick={() => navigate(`/anime/${id}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors uppercase tracking-wider font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to details
      </button>

      {/* Player */}
      {allServersFailed ? (
        <ErrorFallback message="All servers failed. Try a different episode or come back later." />
      ) : srcLoading ? (
        <div className="w-full aspect-video skeleton-pulse rounded-md" />
      ) : isError ? (
        <div className="w-full aspect-video bg-card rounded-md flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Switching to fallback server...</p>
          </div>
        </div>
      ) : (
        <VideoPlayer sources={sources} title={currentEp?.title} />
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-2">
          <button
            disabled={!hasPrev}
            onClick={() => episodes && goToEp(episodes[safeIndex - 1].episodeId)}
            className="btn-glass px-4 py-2 text-sm disabled:opacity-30 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          {currentEp && (
            <span className="text-sm text-foreground font-bold uppercase tracking-wide">
              Ep {currentEp.number}: {currentEp.title}
            </span>
          )}
          <button
            disabled={!hasNext}
            onClick={() => episodes && goToEp(episodes[safeIndex + 1].episodeId)}
            className="btn-glass px-4 py-2 text-sm disabled:opacity-30 flex items-center gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Category toggle */}
          <div className="flex rounded overflow-hidden border border-border">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Server select */}
          <select
            value={server}
            onChange={(e) => { setServer(e.target.value); setTriedServers([]); }}
            className="px-4 py-2 rounded bg-secondary border border-border text-foreground text-xs font-bold uppercase tracking-wider focus:outline-none"
          >
            {SERVERS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Episode list */}
      {episodes && episodes.length > 0 && (
        <div className="mt-6">
          <EpisodeList
            episodes={episodes}
            currentEpisodeId={currentEp?.episodeId}
            onSelect={(ep) => goToEp(ep.episodeId)}
          />
        </div>
      )}
    </div>
  );
};

export default WatchPage;
