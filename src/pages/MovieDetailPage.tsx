import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mm } from "@/lib/multimovies";
import { Star, Calendar, Clock } from "lucide-react";

const MovieDetailPage = () => {
  const { slug = "" } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["mm-movie", slug],
    queryFn: () => mm.movieDetail(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return <div className="pt-20 pb-24 md:pb-10 px-4 md:px-16 text-muted-foreground">Loading...</div>;
  }
  if (!data) {
    return <div className="pt-20 pb-24 md:pb-10 px-4 md:px-16 text-muted-foreground">Not found.</div>;
  }

  const title = data.title || data.name || "Untitled";
  const poster = data.poster || data.thumbnail || data.image;
  const playerSrc = mm.playerUrl(slug, "movie", title);

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
            {data.runtime && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {data.runtime}</span>}
            {data.quality && <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold">{data.quality}</span>}
          </div>
          {data.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.genres.map((g: any, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                  {typeof g === "string" ? g : g.name}
                </span>
              ))}
            </div>
          )}
          {data.description && <p className="text-sm text-foreground/80 leading-relaxed">{data.description}</p>}
        </div>
      </div>

      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border bg-black">
        <iframe
          src={playerSrc}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          title={title}
        />
      </div>
    </div>
  );
};

export default MovieDetailPage;
