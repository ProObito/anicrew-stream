import { useAnilistHome } from "@/hooks/useAnilistHome";
import AnimeGrid from "@/components/AnimeGrid";

const AnimePage = () => {
  const { data, isLoading } = useAnilistHome();

  return (
    <div className="pt-20 pb-24 md:pb-10">
      <div className="px-4 md:px-16 lg:px-24 mb-6">
        <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight">
          Anime
        </h1>
      </div>
      <div className="flex flex-col gap-2">
        <AnimeGrid title="Trending" animes={data?.trending} isLoading={isLoading} count={100} isAnilist />
        <AnimeGrid title="Top Airing" animes={data?.topAiring} isLoading={isLoading} count={100} isAnilist />
        <AnimeGrid title="Most Popular" animes={data?.mostPopular} isLoading={isLoading} count={100} isAnilist />
        <AnimeGrid title="Top Rated" animes={data?.topRated} isLoading={isLoading} count={100} isAnilist />
        <AnimeGrid title="Recently Updated" animes={data?.recentlyUpdated} isLoading={isLoading} count={100} isAnilist />
        <AnimeGrid title="Recently Completed" animes={data?.completed} isLoading={isLoading} count={100} isAnilist />
        <AnimeGrid title="Upcoming" animes={data?.upcoming} isLoading={isLoading} count={100} isAnilist />
      </div>
    </div>
  );
};

export default AnimePage;
