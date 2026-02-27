import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
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

  const { data: episodes, isLoading: epLoading } = useEpisodes(id || "");
  const { data: sources, isLoading: srcLoading, isError } = useEpisodeSources(epId, server, category);

  useEffect(() => {
    if (!episodes?.length) return;
    const hasSelectedEpisode = episodes.some((episode: any) => episode.episodeId === epId);

    if (!epId || !hasSelectedEpisode) {
      setSearchParams({ ep: episodes[0].episodeId }, { replace: true });
    }
  }, [episodes, epId, setSearchParams]);

  const currentIndex = episodes?.findIndex((e: any) => e.episodeId === epId) ?? -1;
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentEp = episodes?.[safeIndex];
  const hasPrev = safeIndex > 0;
  const hasNext = !!episodes && safeIndex < episodes.length - 1;

  const goToEp = (episodeId: string) => {
    setSearchParams({ ep: episodeId });
  };

  return (
    <div className="pt-20 pb-10 container mx-auto px-4">
      {/* Back button */}
      <button
        onClick={() => navigate(`/anime/${id}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to details
      </button>

      {/* Player */}
      {isError ? (
        <ErrorFallback message="Failed to load video source" />
      ) : srcLoading ? (
        <div className="w-full aspect-video skeleton-pulse rounded-xl" />
      ) : (
        <VideoPlayer sources={sources} title={currentEp?.title} />
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-2">
          <button
            disabled={!hasPrev}
            onClick={() => episodes && goToEp(episodes[safeIndex - 1].episodeId)}
            className="btn-glass px-3 py-2 text-sm disabled:opacity-30 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          {currentEp && (
            <span className="text-sm text-foreground font-medium">
              Ep {currentEp.number}: {currentEp.title}
            </span>
          )}
          <button
            disabled={!hasNext}
            onClick={() => episodes && goToEp(episodes[safeIndex + 1].episodeId)}
            className="btn-glass px-3 py-2 text-sm disabled:opacity-30 flex items-center gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Category toggle */}
          <div className="flex rounded-xl overflow-hidden border border-border">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 text-xs font-medium uppercase transition-colors ${
                  category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Server select */}
          <select
            value={server}
            onChange={(e) => setServer(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground text-xs focus:outline-none"
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
