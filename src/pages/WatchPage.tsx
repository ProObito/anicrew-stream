import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, Play, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAnimeInfo, useEpisodes, useEpisodeSources } from "@/hooks/useAnimeData";
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

  const { data: animeInfo } = useAnimeInfo(id || "");
  const { data: episodes } = useEpisodes(id || "");
  const { data: sources, isLoading: srcLoading, isError } = useEpisodeSources(epId, server, category);

  // Auto-select first episode
  useEffect(() => {
    if (!episodes?.length) return;
    const hasSelected = episodes.some((e: any) => e.episodeId === epId);
    if (!epId || !hasSelected) {
      setSearchParams({ ep: episodes[0].episodeId }, { replace: true });
    }
  }, [episodes, epId, setSearchParams]);

  // Auto server fallback
  useEffect(() => {
    if (isError && !triedServers.includes(server)) {
      setTriedServers((prev) => [...prev, server]);
      const next = SERVERS.find((s) => s !== server && !triedServers.includes(s));
      if (next) setServer(next);
    }
  }, [isError, server, triedServers]);

  useEffect(() => { setTriedServers([]); }, [epId, category]);

  const currentIndex = episodes?.findIndex((e: any) => e.episodeId === epId) ?? -1;
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentEp = episodes?.[safeIndex];
  const allServersFailed = triedServers.length >= SERVERS.length;

  const iframeUrl = sources?.sources?.[0]?.url;
  const poster = animeInfo?.poster || "";
  const animeName = animeInfo?.name || "";

  const goToEp = (episodeId: string) => setSearchParams({ ep: episodeId });

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">

      {/* THEATER MODE PLAYER */}
      <div className="w-full flex flex-col items-center px-4 md:px-12 pt-24 mt-4">
        <div className="w-full max-w-7xl relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-card border border-border group">

          {/* Back button overlay */}
          <button
            onClick={() => navigate(`/anime/${id}`)}
            className="absolute top-6 left-6 z-20 flex items-center space-x-2 bg-background/60 hover:bg-primary text-foreground px-4 py-2 rounded-full backdrop-blur-md transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Back to Details</span>
          </button>

          {/* Now Playing badge */}
          {currentEp && (
            <div className="absolute top-6 right-6 z-20 bg-background/60 backdrop-blur-md px-4 py-2 rounded-full border border-border">
              <span className="text-sm font-medium text-muted-foreground">
                Playing: <span className="text-foreground font-bold">Episode {currentEp.number}</span>
              </span>
            </div>
          )}

          {/* Player area */}
          <div className="w-full aspect-video">
            {allServersFailed ? (
              <div className="w-full h-full flex items-center justify-center bg-card">
                <ErrorFallback message="All servers failed. Try a different episode or come back later." />
              </div>
            ) : srcLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-card">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : isError ? (
              <div className="w-full h-full flex items-center justify-center bg-card">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Switching to fallback server...</p>
                </div>
              </div>
            ) : iframeUrl ? (
              <iframe
                src={iframeUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                title={currentEp?.title || "Video Player"}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-card">
                <p className="text-muted-foreground">No source available for this episode</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls below player */}
        <div className="w-full max-w-7xl flex flex-wrap items-center justify-between gap-4 mt-4">
          {/* Category toggle */}
          <div className="flex rounded-full overflow-hidden border border-border">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
            className="px-4 py-2 rounded-full bg-secondary border border-border text-foreground text-xs font-bold uppercase tracking-wider focus:outline-none"
          >
            {SERVERS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* BOTTOM: Episode Grid + Sidebar */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12">

        {/* LEFT: Episodes */}
        <div className="lg:col-span-8">
          <h2 className="text-2xl font-display font-bold mb-6 text-foreground uppercase tracking-tight">
            Up Next / Episodes
          </h2>

          {episodes && episodes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {episodes.map((ep: any) => {
                const isActive = ep.episodeId === epId;
                return (
                  <motion.div
                    key={ep.episodeId}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => goToEp(ep.episodeId)}
                    className={`group cursor-pointer flex flex-col p-2 rounded-2xl transition-all ${
                      isActive ? "bg-secondary ring-2 ring-primary" : "hover:bg-secondary"
                    }`}
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-card border border-border">
                      <img
                        src={poster}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`p-3 rounded-full transition-all duration-300 backdrop-blur-md border border-border group-hover:scale-110 ${
                          isActive ? "bg-primary/90" : "bg-background/40 group-hover:bg-primary/90"
                        }`}>
                          <Play className="w-6 h-6 ml-0.5 fill-current text-foreground" />
                        </div>
                      </div>
                      {isActive && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                          Now Playing
                        </div>
                      )}
                    </div>
                    <div className="px-1">
                      <h3 className={`font-semibold transition text-lg truncate ${
                        isActive ? "text-primary" : "text-foreground/80 group-hover:text-foreground"
                      }`}>
                        {animeName}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Episode {ep.number} • {ep.title}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* RIGHT: Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-card p-6 rounded-[2rem] border border-border h-full shadow-xl">
            <div className="bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-lg inline-block mb-5">
              Details & Info
            </div>

            <h3 className="text-xl font-display font-bold leading-snug mb-5 text-foreground uppercase">
              {animeName} Synopsis
            </h3>

            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] group">
              <img
                src={poster}
                alt={animeName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed text-justify">
              {animeInfo?.description || "No description available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
