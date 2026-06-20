import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Star, Calendar } from "lucide-react";
import { mm, pickArray, normalizeMM } from "@/lib/multimovies";
import MultiServerPlayer, { buildMMServers } from "@/components/MultiServerPlayer";
import PlayerComments from "@/components/PlayerComments";

const MMDetailPage = () => {
  const { type = "movie", slug = "" } = useParams<{ type: "movie" | "tv"; slug: string }>();
  const kind: "movie" | "tv" = type === "tv" ? "tv" : "movie";

  const { data, isLoading } = useQuery({
    queryKey: ["mm", "detail", kind, slug],
    queryFn: () => (kind === "movie" ? mm.movieDetail(slug) : mm.tvDetail(slug)),
    enabled: !!slug,
  });

  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  const seasons = useMemo(() => pickArray(data, "seasons"), [data]);
  useEffect(() => {
    if (seasons.length && !seasons.find((s: any) => (s.number ?? s.season_number) === season)) {
      const first = seasons[0]?.number ?? seasons[0]?.season_number ?? 1;
      setSeason(first);
    }
  }, [seasons, season]);

  const { data: epData } = useQuery({
    queryKey: ["mm", "episodes", slug, season],
    queryFn: () => mm.episodes(slug, season),
    enabled: kind === "tv" && !!slug && !!season,
  });

  const episodes = useMemo(() => pickArray(epData, "episodes", "items", "data"), [epData]);

  if (isLoading) return <div className="pt-20 pb-24 md:pb-10 px-4 md:px-16 text-muted-foreground">Loading...</div>;
  if (!data) return <div className="pt-20 pb-24 md:pb-10 px-4 md:px-16 text-muted-foreground">Not found.</div>;

  const title = data.title || data.name || slug;
  const poster = data.poster || data.image || data.thumbnail;
  const backdrop = data.backdrop || data.banner || poster;
  const overview = data.description || data.overview || data.synopsis || "";
  const year = data.year || data.release_year;
  const rating = data.rating || data.imdb_rating;
  const genres: string[] = data.genres || [];
  const sources = pickArray(data, "sources");
  const related = pickArray(data, "related", "similar", "recommendations").map(normalizeMM).filter((i) => i.slug);

  const servers = buildMMServers(slug, kind, sources, {
    title,
    season: kind === "tv" ? season : undefined,
    episode: kind === "tv" ? episode : undefined,
  });

  return (
    <div className="pb-24 md:pb-10 min-h-screen">
      <div className="relative h-[40vh] md:h-[55vh] w-full overflow-hidden">
        {backdrop && <img src={backdrop} alt={title} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
      </div>

      <div className="-mt-32 md:-mt-48 relative z-10 px-4 md:px-12 lg:px-24">
        <div className="grid md:grid-cols-[200px_1fr] gap-6 mb-6">
          {poster && <img src={poster} alt={title} className="w-40 md:w-[200px] rounded-xl border border-border shadow-2xl" />}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight">{title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {rating && <span className="flex items-center gap-1 text-primary"><Star className="w-4 h-4 fill-current" /> {rating}</span>}
              {year && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {year}</span>}
              <span className="uppercase tracking-wider text-xs">{kind === "movie" ? "Movie" : "Series"}</span>
            </div>
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((g: string) => (
                  <span key={g} className="px-2.5 py-0.5 rounded-full bg-secondary border border-border text-xs">{g}</span>
                ))}
              </div>
            )}
            {overview && <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl line-clamp-4">{overview}</p>}
          </div>
        </div>

        <MultiServerPlayer
          servers={servers}
          title={kind === "tv" ? `${title} S${season}E${episode}` : title}
        />

        {kind === "tv" && (
          <>
            {seasons.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {seasons.map((s: any) => {
                  const n = s.number ?? s.season_number ?? 1;
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

            {episodes.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-display font-bold uppercase tracking-wider text-muted-foreground mb-3">Episodes</h3>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-3">
                  {episodes.map((ep: any) => {
                    const n = ep.number ?? ep.episode_number ?? ep.episode;
                    const epTitle = ep.title || ep.name || `Episode ${n}`;
                    const thumb = ep.thumbnail || ep.image || ep.still_path || poster;
                    const isActive = n === episode;
                    return (
                      <button
                        key={n}
                        onClick={() => setEpisode(n)}
                        className={`flex-shrink-0 w-56 text-left rounded-xl overflow-hidden border transition ${
                          isActive ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="aspect-video bg-secondary overflow-hidden">
                          {thumb && <img src={thumb} alt={epTitle} loading="lazy" className="w-full h-full object-cover" />}
                        </div>
                        <div className="p-2 bg-card/60">
                          <div className="text-[10px] uppercase tracking-wider text-primary font-bold">Ep {n}</div>
                          <div className="text-xs text-foreground/90 truncate">{epTitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <PlayerComments storageKey={`anicrew-comments-mm-${kind}-${slug}-s${season}e${episode}`} />

        {related.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-display font-bold uppercase tracking-tight mb-3">You may also like</h3>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-3">
              {related.map((r) => {
                const rkind = (r.type || "").toLowerCase().includes("movie") ? "movie" : "tv";
                return (
                  <Link key={r.slug} to={`/mm/${rkind}/${r.slug}`} className="flex-shrink-0 w-32">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden border border-border bg-secondary">
                      {r.poster && <img src={r.poster} alt={r.title} loading="lazy" className="w-full h-full object-cover" />}
                    </div>
                    <div className="text-xs mt-1 truncate">{r.title}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MMDetailPage;
