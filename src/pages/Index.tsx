import { useHomeData } from "@/hooks/useAnimeData";
import HeroCarousel from "@/components/HeroCarousel";
import AnimeGrid from "@/components/AnimeGrid";
import ScheduleSection from "@/components/ScheduleSection";
import ErrorFallback from "@/components/ErrorFallback";

const Index = () => {
  const { data, isLoading, isError, refetch } = useHomeData();

  if (isError) return <ErrorFallback message="Failed to load anime data" onRetry={() => refetch()} />;

  const spotlight = data?.spotlightAnimes ?? [];

  return (
    <div className="pb-10">
      {/* HERO CAROUSEL - Pic 2 style sliding banner */}
      {isLoading ? (
        <div className="w-full h-[85vh] skeleton-pulse" />
      ) : spotlight.length > 0 ? (
        <HeroCarousel animes={spotlight} />
      ) : (
        <div className="h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-7xl md:text-9xl font-display font-black uppercase tracking-tighter text-foreground mb-3">
              Ani<span className="text-primary">Crew</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Your ultimate anime & donghua streaming hub
            </p>
          </div>
        </div>
      )}

      {/* CONTENT SECTIONS - Pic 3 style rows */}
      <div className="relative z-20 mt-8 flex flex-col gap-4">
        <AnimeGrid title="🔥 Trending Now" animes={data?.trending} isLoading={isLoading} count={15} />
        <AnimeGrid title="⚡ Top Airing" animes={data?.topAiring} isLoading={isLoading} count={15} />
        <AnimeGrid title="📺 Recently Added" animes={data?.latestEpisode} isLoading={isLoading} count={15} variant="landscape" />
        <AnimeGrid title="🌟 Most Popular" animes={data?.mostPopular} isLoading={isLoading} count={15} />
        <AnimeGrid title="⭐ Top Rated" animes={data?.mostFavorite} isLoading={isLoading} count={15} />
        <AnimeGrid title="✅ Recently Finished" animes={data?.latestCompleted} isLoading={isLoading} count={15} />
        <AnimeGrid title="🎯 Top Upcoming" animes={data?.topUpcoming} isLoading={isLoading} count={15} />
      </div>

      {/* SCHEDULE SECTION - AniList API */}
      <div className="mt-8">
        <ScheduleSection />
      </div>
    </div>
  );
};

export default Index;
