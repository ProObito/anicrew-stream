import { useHomeData } from "@/hooks/useAnimeData";
import HeroCarousel from "@/components/HeroCarousel";
import AnimeGrid from "@/components/AnimeGrid";
import ScheduleSection from "@/components/ScheduleSection";
import CommentSection from "@/components/CommentSection";
import ErrorFallback from "@/components/ErrorFallback";

const Index = () => {
  const { data, isLoading, isError, refetch } = useHomeData();

  if (isError) return <ErrorFallback message="Failed to load anime data" onRetry={() => refetch()} />;

  const spotlight = data?.spotlightAnimes ?? [];

  return (
    <div className="pb-10 min-h-screen">
      {isLoading ? (
        <div className="w-full h-[70vh] skeleton-pulse" />
      ) : spotlight.length > 0 ? (
        <HeroCarousel animes={spotlight} />
      ) : null}

      <div className="relative z-20 mt-10 flex flex-col gap-2">
        <AnimeGrid title="Trending Now" animes={data?.trending} isLoading={isLoading} count={15} />
        <AnimeGrid title="Top Airing" animes={data?.topAiring} isLoading={isLoading} count={15} />
        <AnimeGrid title="Latest Episodes" animes={data?.latestEpisode} isLoading={isLoading} count={15} />
        <AnimeGrid title="Most Popular" animes={data?.mostPopular} isLoading={isLoading} count={15} />
        <AnimeGrid title="Most Favorite" animes={data?.mostFavorite} isLoading={isLoading} count={15} />
        <AnimeGrid title="Recently Completed" animes={data?.latestCompleted} isLoading={isLoading} count={15} />
        <AnimeGrid title="Top Upcoming" animes={data?.topUpcoming} isLoading={isLoading} count={15} />
      </div>

      <div className="mt-8">
        <ScheduleSection />
      </div>

      <CommentSection />
    </div>
  );
};

export default Index;
