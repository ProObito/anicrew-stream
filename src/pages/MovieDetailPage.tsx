import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, Calendar, Clock } from "lucide-react";
import { tmdb, tmdbImg, playerUrl } from "@/lib/tmdb";
import PlayerFrame from "@/components/PlayerFrame";
import PlayerComments from "@/components/PlayerComments";
import TmdbRow from "@/components/TmdbRow";

const MovieDetailPage = () => {
  const { slug = "" } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["tmdb", "movie", "detail", slug],
    queryFn: () => tmdb.detail("movie", slug),
    enabled: !!slug,
  });

  if (isLoading) return <div className="pt-20 pb-24 md:pb-10 px-4 md:px-16 text-muted-foreground">Loading...</div>;
  if (!data) return <div className="pt-20 pb-24 md:pb-10 px-4 md:px-16 text-muted-foreground">Not found.</div>;

  const title = data.title || data.name;
  const backdrop = data.backdrop_path ? tmdbImg(data.backdrop_path, "original") : "";
  const similar = data.similar?.results || [];
  const recs = data.recommendations?.results || [];

  return (
    <div className="pb-24 md:pb-10 min-h-screen">
      {/* Hero backdrop */}
      <div className="relative h-[40vh] md:h-[55vh] w-full overflow-hidden">
        {backdrop && <img src={backdrop} alt={title} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
      </div>

      <div className="-mt-32 md:-mt-48 relative z-10 px-4 md:px-12 lg:px-24">
        <div className="grid md:grid-cols-[200px_1fr] gap-6 mb-6">
          {data.poster_path && (
            <img src={tmdbImg(data.poster_path, "w500")} alt={title} className="w-40 md:w-[200px] rounded-xl border border-border shadow-2xl" />
          )}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight">{title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {data.vote_average ? <span className="flex items-center gap-1 text-primary"><Star className="w-4 h-4 fill-current" /> {data.vote_average.toFixed(1)}</span> : null}
              {data.release_date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {data.release_date.slice(0, 4)}</span>}
              {data.runtime && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {data.runtime}m</span>}
            </div>
            {data.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.genres.map((g: any) => (
                  <span key={g.id} className="px-2.5 py-0.5 rounded-full bg-secondary border border-border text-xs">{g.name}</span>
                ))}
              </div>
            )}
            {data.overview && <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl">{data.overview}</p>}
          </div>
        </div>

        <PlayerFrame src={playerUrl.movie(data.id)} title={title} />

        <PlayerComments storageKey={`anicrew-comments-movie-${data.id}`} />

        <div className="mt-8 -mx-4 md:-mx-12 lg:-mx-24">
          <TmdbRow title="Similar Movies" items={similar} kind="movie" />
          <TmdbRow title="You May Also Like" items={recs} kind="movie" />
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
