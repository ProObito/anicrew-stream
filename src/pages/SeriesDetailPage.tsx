import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Star, Calendar } from "lucide-react";
import { tmdb, tmdbImg, playerUrl } from "@/lib/tmdb";
import PlayerFrame from "@/components/PlayerFrame";
import PlayerComments from "@/components/PlayerComments";
import EpisodeSlider from "@/components/EpisodeSlider";
import TmdbRow from "@/components/TmdbRow";

const SeriesDetailPage = () => {
  const { slug = "" } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["tmdb", "tv", "detail", slug],
    queryFn: () => tmdb.detail("tv", slug),
    enabled: !!slug,
  });

  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  const { data: seasonData } = useQuery({
    queryKey: ["tmdb", "tv", "season", slug, season],
    queryFn: () => tmdb.season(slug, season),
    enabled: !!slug && !!season,
  });

  if (isLoading) return <div className="pt-20 pb-24 md:pb-10 px-4 md:px-16 text-muted-foreground">Loading...</div>;
  if (!data) return <div className="pt-20 pb-24 md:pb-10 px-4 md:px-16 text-muted-foreground">Not found.</div>;

  const title = data.name || data.title;
  const backdrop = data.backdrop_path ? tmdbImg(data.backdrop_path, "original") : "";
  const seasons = (data.seasons || []).filter((s: any) => s.season_number > 0);
  const episodes = seasonData?.episodes || [];
  const similar = data.similar?.results || [];
  const recs = data.recommendations?.results || [];

  return (
    <div className="pb-24 md:pb-10 min-h-screen">
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
              {data.first_air_date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {data.first_air_date.slice(0, 4)}</span>}
              <span>{data.number_of_seasons} Season{data.number_of_seasons === 1 ? "" : "s"}</span>
            </div>
            {data.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.genres.map((g: any) => (
                  <span key={g.id} className="px-2.5 py-0.5 rounded-full bg-secondary border border-border text-xs">{g.name}</span>
                ))}
              </div>
            )}
            {data.overview && <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl line-clamp-4">{data.overview}</p>}
          </div>
        </div>

        <PlayerFrame
          src={playerUrl.tv(data.id, season, episode)}
          title={`${title} S${season}E${episode}`}
        />

        {/* Season picker */}
        {seasons.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {seasons.map((s: any) => (
              <button
                key={s.season_number}
                onClick={() => { setSeason(s.season_number); setEpisode(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  season === s.season_number
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground border border-border hover:text-foreground"
                }`}
              >
                Season {s.season_number}
              </button>
            ))}
          </div>
        )}

        {/* Episodes slider */}
        <div className="mt-5">
          <EpisodeSlider
            episodes={episodes}
            active={episode}
            onPick={(n) => setEpisode(n)}
            fallbackBackdrop={data.backdrop_path}
          />
        </div>

        <PlayerComments storageKey={`anicrew-comments-tv-${data.id}-s${season}e${episode}`} />

        <div className="mt-8 -mx-4 md:-mx-12 lg:-mx-24">
          <TmdbRow title="Similar Shows" items={similar} kind="tv" />
          <TmdbRow title="You May Also Like" items={recs} kind="tv" />
        </div>
      </div>
    </div>
  );
};

export default SeriesDetailPage;
