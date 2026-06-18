import { useQuery, useQueries } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import TmdbHeroSlider from "@/components/TmdbHeroSlider";
import TmdbRow from "@/components/TmdbRow";

const MoviesPage = () => {
  const trending = useQuery({ queryKey: ["tmdb", "movie", "trending"], queryFn: () => tmdb.trending("movie") });
  const popular = useQuery({ queryKey: ["tmdb", "movie", "popular"], queryFn: () => tmdb.popular("movie") });
  const topRated = useQuery({ queryKey: ["tmdb", "movie", "top"], queryFn: () => tmdb.topRated("movie") });
  const nowPlaying = useQuery({ queryKey: ["tmdb", "movie", "now"], queryFn: () => tmdb.nowPlaying() });
  const upcoming = useQuery({ queryKey: ["tmdb", "movie", "upcoming"], queryFn: () => tmdb.upcoming() });

  const genres = useQuery({ queryKey: ["tmdb", "movie", "genres"], queryFn: () => tmdb.genres("movie") });
  const topGenres = genres.data?.genres.slice(0, 5) ?? [];
  const genreRows = useQueries({
    queries: topGenres.map((g) => ({
      queryKey: ["tmdb", "movie", "genre", g.id],
      queryFn: () => tmdb.discover("movie", { with_genres: g.id, sort_by: "popularity.desc" }),
    })),
  });

  return (
    <div className="pb-24 md:pb-10 min-h-screen">
      {trending.data && <TmdbHeroSlider items={trending.data.results} kind="movie" />}

      <div className="mt-8 flex flex-col gap-2">
        <TmdbRow title="Trending This Week" items={trending.data?.results} kind="movie" isLoading={trending.isLoading} />
        <TmdbRow title="Now Playing" items={nowPlaying.data?.results} kind="movie" isLoading={nowPlaying.isLoading} />
        <TmdbRow title="Popular Movies" items={popular.data?.results} kind="movie" isLoading={popular.isLoading} />
        <TmdbRow title="Top Rated" items={topRated.data?.results} kind="movie" isLoading={topRated.isLoading} />
        <TmdbRow title="Upcoming" items={upcoming.data?.results} kind="movie" isLoading={upcoming.isLoading} />

        {topGenres.map((g, i) => (
          <TmdbRow key={g.id} title={g.name} items={genreRows[i].data?.results} kind="movie" isLoading={genreRows[i].isLoading} />
        ))}
      </div>
    </div>
  );
};

export default MoviesPage;
