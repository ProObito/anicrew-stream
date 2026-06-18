import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { mm, pickArray } from "@/lib/multimovies";
import { Star, Calendar } from "lucide-react";

const SeriesDetailPage = () => {
  const { slug = "" } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["mm-tv", slug],
    queryFn: () => mm.tvDetail(slug),
    enabled: !!slug,
  });

  const seasons = useMemo(() => pickArray(data, "seasons"), [data]);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  const { data: epData } = useQuery({
    queryKey: ["mm-tv-eps", slug, season],
    queryFn: () => mm.episodes(slug, season),
    enabled: !!slug && !!season,
  });
  const episodes = pickArray(epData, "episodes", "items");

  if (isLoading) {
    return <div className="pt-20 pb-24 md:pb-10 px-4 md:px-16 text-muted-foreground">Loading...</div>;
  }
  if (!data) {
    return <div className="pt-20 pb-24 md:pb-10 px-4 md:px-16 text-muted-foreground">Not found.</div>;
  }

  const title = data.title || data.name || "Untitled";
  const poster = data.poster || data.thumbnail || data.image;
  const playerSrc = mm.playerUrl(slug, "tv", title, season, episode);

  return (
    <div className="pt-20 pb-24 md:pb-10 px-4 md:px-16 lg:px-24 space-y-6">
      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        {poster && (
          <img src={poster} alt={title} className="w-full max-w-[220px] rounded-xl border border-border" />
        )}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-display font-black">{title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {data.rating && <span className="flex items-center gap-1"><Star className="w-4 h-4 text-primary fill-current" /> {data.rating}</span>}
            {data.year && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {data.year}</span>}
          </div>
          {data.description && <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4">{data.description}</p>}
        </div>
      </div>

      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border bg-black">
        <iframe
          key={`${season}-${episode}`}
          src={playerSrc}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          title={`${title} S${season}E${episode}`}
        />
      </div>

      {/* Season picker */}
      {seasons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {seasons.map((s: any, i: number) => {
            const n = s.season_number || s.number || i + 1;
            return (
              <button
                key={n}
                onClick={() => { setSeason(n); setEpisode(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  season === n
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground border border-border hover:text-foreground"
                }`}
              >
                Season {n}
              </button>
            );
          })}
        </div>
      )}

      {/* Episodes */}
      {episodes.length > 0 && (
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-3">Episodes</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {episodes.map((ep: any, i: number) => {
              const n = ep.episode_number || ep.number || i + 1;
              return (
                <button
                  key={n}
                  onClick={() => setEpisode(n)}
                  className={`aspect-square rounded-lg font-bold text-sm transition ${
                    episode === n
                      ? "bg-primary text-primary-foreground shadow-neon"
                      : "bg-secondary border border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesDetailPage;
