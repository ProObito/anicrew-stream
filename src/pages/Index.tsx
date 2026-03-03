import { useAnilistHome } from "@/hooks/useAnilistHome";
import HeroCarousel from "@/components/HeroCarousel";
import AnimeGrid from "@/components/AnimeGrid";
import ScheduleSection from "@/components/ScheduleSection";
import CommentSection from "@/components/CommentSection";
import ErrorFallback from "@/components/ErrorFallback";

const Index = () => {
  const { data, isLoading, isError, refetch } = useAnilistHome();

  if (isError) return <ErrorFallback message="Failed to load anime data" onRetry={() => refetch()} />;

  const spotlight = data?.spotlight ?? [];

  return (
    <div className="pb-10 min-h-screen">
      {/* HERO - Full width banner */}
      {isLoading ? (
        <div className="w-full h-[70vh] skeleton-pulse" />
      ) : spotlight.length > 0 ? (
        <HeroCarousel animes={spotlight} />
      ) : null}

      {/* CONTENT SECTIONS */}
      <div className="relative z-20 mt-10 flex flex-col gap-2">
        <AnimeGrid title="Trending Now" animes={data?.trending} isLoading={isLoading} count={15} isAnilist />
        <AnimeGrid title="Top Airing" animes={data?.topAiring} isLoading={isLoading} count={15} isAnilist />
        <AnimeGrid title="Recently Updated" animes={data?.recentlyUpdated} isLoading={isLoading} count={15} isAnilist />
        <AnimeGrid title="Most Popular" animes={data?.mostPopular} isLoading={isLoading} count={15} isAnilist />
        <AnimeGrid title="Top Rated" animes={data?.topRated} isLoading={isLoading} count={15} isAnilist />
        <AnimeGrid title="Recently Completed" animes={data?.completed} isLoading={isLoading} count={15} isAnilist />
        <AnimeGrid title="Top Upcoming" animes={data?.upcoming} isLoading={isLoading} count={15} isAnilist />
      </div>

      {/* SCHEDULE */}
      <div className="mt-8">
        <ScheduleSection />
      </div>

      {/* COMMUNITY */}
      <CommentSection />
    </div>
  );
};

export default Index;
