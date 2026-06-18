import { useQuery, useQueries } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import TmdbHeroSlider from "@/components/TmdbHeroSlider";
import TmdbRow from "@/components/TmdbRow";

const SeriesPage = () => {
  const trending = useQuery({ queryKey: ["tmdb", "tv", "trending"], queryFn: () => tmdb.trending("tv") });
  const popular = useQuery({ queryKey: ["tmdb", "tv", "popular"], queryFn: () => tmdb.popular("tv") });
  const topRated = useQuery({ queryKey: ["tmdb", "tv", "top"], queryFn: () => tmdb.topRated("tv") });
  const onAir = useQuery({ queryKey: ["tmdb", "tv", "onair"], queryFn: () => tmdb.onTheAir() });
  const airing = useQuery({ queryKey: ["tmdb", "tv", "airing"], queryFn: () => tmdb.airingToday() });

  const genres = useQuery({ queryKey: ["tmdb", "tv", "genres"], queryFn: () => tmdb.genres("tv") });
  const topGenres = genres.data?.genres.slice(0, 6) ?? [];
  const genreRows = useQueries({
    queries: topGenres.map((g) => ({
      queryKey: ["tmdb", "tv", "genre", g.id],
      queryFn: () => tmdb.discover("tv", { with_genres: g.id, sort_by: "popularity.desc" }),
    })),
  });

  return (
    <div className="pb-24 md:pb-10 min-h-screen">
      {trending.data && <TmdbHeroSlider items={trending.data.results} kind="tv" />}

      <div className="mt-8 flex flex-col gap-2">
        <TmdbRow title="Trending This Week" items={trending.data?.results} kind="tv" isLoading={trending.isLoading} />
        <TmdbRow title="On The Air" items={onAir.data?.results} kind="tv" isLoading={onAir.isLoading} />
        <TmdbRow title="Airing Today" items={airing.data?.results} kind="tv" isLoading={airing.isLoading} />
        <TmdbRow title="Popular Series" items={popular.data?.results} kind="tv" isLoading={popular.isLoading} />
        <TmdbRow title="Top Rated" items={topRated.data?.results} kind="tv" isLoading={topRated.isLoading} />

        <div className="mt-6 px-4 md:px-12 lg:px-16">
          <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight mb-1">Browse by Genre</h2>
          <p className="text-sm text-muted-foreground">Discover series across every genre.</p>
        </div>

        {topGenres.map((g, i) => (
          <TmdbRow key={g.id} title={g.name} items={genreRows[i].data?.results} kind="tv" isLoading={genreRows[i].isLoading} />
        ))}
      </div>
    </div>
  );
};

export default SeriesPage;
