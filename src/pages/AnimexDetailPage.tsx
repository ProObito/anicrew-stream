import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Star, Calendar } from "lucide-react";
import { ax, axTitle, axCover } from "@/lib/animex";
import AnimexPlayer from "@/components/AnimexPlayer";
import PlayerComments from "@/components/PlayerComments";

const AnimexDetailPage = () => {
  const { id = "" } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["ax", "detail", id],
    queryFn: () => ax.detail(id),
    enabled: !!id,
  });

  const slug: string = data?.id || id;
  const anilistId: number = data?.anilistId;

  const { data: epData } = useQuery({
    queryKey: ["ax", "episodes", slug],
    queryFn: () => ax.episodes(slug),
    enabled: !!slug,
  });

  const { data: recs } = useQuery({
    queryKey: ["ax", "recs", id],
    queryFn: () => ax.recommendations(id),
    enabled: !!id,
  });

  const episodes: any[] = epData?.episodes || [];
  const [episode, setEpisode] = useState(1);
  useEffect(() => {
    if (episodes.length && !episodes.find((e) => e.number === episode)) {
      setEpisode(episodes[0].number);
    }
  }, [episodes, episode]);

  if (isLoading) return <div className="pt-20 pb-24 md:pb-10 px-4 md:px-16 text-muted-foreground">Loading...</div>;
  if (!data) return <div className="pt-20 pb-24 md:pb-10 px-4 md:px-16 text-muted-foreground">Not found.</div>;

  const title = axTitle(data);
  const banner = data.bannerImage || axCover(data);
  const poster = axCover(data);
  const genres: string[] = data.genres || [];

  return (
    <div className="pb-24 md:pb-10 min-h-screen">
      <div className="relative h-[40vh] md:h-[55vh] w-full overflow-hidden">
        {banner && <img src={banner} alt={title} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
      </div>

      <div className="-mt-32 md:-mt-48 relative z-10 px-4 md:px-12 lg:px-24">
        <div className="grid md:grid-cols-[200px_1fr] gap-6 mb-6">
          {poster && <img src={poster} alt={title} className="w-40 md:w-[200px] rounded-xl border border-border shadow-2xl" />}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight">{title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {data.averageScore && (
                <span className="flex items-center gap-1 text-primary">
                  <Star className="w-4 h-4 fill-current" /> {(data.averageScore / 10).toFixed(1)}
                </span>
              )}
              {data.seasonYear && (
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {data.seasonYear}</span>
              )}
              {data.format && <span className="uppercase tracking-wider text-xs">{data.format}</span>}
              {data.episodeCount && <span className="text-xs">{data.episodeCount} eps</span>}
            </div>
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <span key={g} className="px-2.5 py-0.5 rounded-full bg-secondary border border-border text-xs">{g}</span>
                ))}
              </div>
            )}
            {data.description && (
              <p
                className="text-sm text-foreground/80 leading-relaxed max-w-3xl line-clamp-4"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            )}
          </div>
        </div>

        {anilistId && episodes.length > 0 && (
          <AnimexPlayer slug={slug} anilistId={anilistId} episode={episode} title={`${title} EP ${episode}`} />
        )}

        {episodes.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-display font-bold uppercase tracking-wider text-muted-foreground mb-3">Episodes</h3>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-3">
              {episodes.map((ep) => {
                const epTitle = ep.titles?.en || ep.titles?.["x-jat"] || `Episode ${ep.number}`;
                const thumb = ep.img || poster;
                const isActive = ep.number === episode;
                return (
                  <button
                    key={ep.number}
                    onClick={() => setEpisode(ep.number)}
                    className={`flex-shrink-0 w-56 text-left rounded-xl overflow-hidden border transition ${
                      isActive ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="aspect-video bg-secondary overflow-hidden">
                      {thumb && <img src={thumb} alt={epTitle} loading="lazy" className="w-full h-full object-cover" />}
                    </div>
                    <div className="p-2 bg-card/60">
                      <div className="text-[10px] uppercase tracking-wider text-primary font-bold flex items-center gap-2">
                        Ep {ep.number}
                        {ep.isFiller && <span className="text-yellow-500 normal-case">filler</span>}
                      </div>
                      <div className="text-xs text-foreground/90 truncate">{epTitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <PlayerComments storageKey={`anicrew-comments-anime-${slug}-ep${episode}`} />

        {recs?.recommendations?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-display font-bold uppercase tracking-tight mb-3">Recommended</h3>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-3">
              {recs.recommendations.map((r: any) => (
                <Link key={r.id} to={`/anime/x/${r.id}`} className="flex-shrink-0 w-32">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden border border-border bg-secondary">
                    {axCover(r) && <img src={axCover(r)} alt={axTitle(r)} loading="lazy" className="w-full h-full object-cover" />}
                  </div>
                  <div className="text-xs mt-1 truncate">{axTitle(r)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimexDetailPage;
