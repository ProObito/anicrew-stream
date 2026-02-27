import { useHomeData } from "@/hooks/useAnimeData";
import AnimeGrid from "@/components/AnimeGrid";
import HeroCarousel from "@/components/HeroCarousel";
import ErrorFallback from "@/components/ErrorFallback";

const Index = () => {
  const { data, isLoading, isError, refetch } = useHomeData();

  if (isError) return <ErrorFallback message="Failed to load anime data" onRetry={() => refetch()} />;

  return (
    <div className="pb-10">
      {/* Hero Carousel - full bleed */}
      {isLoading ? (
        <div className="w-full h-[90vh] skeleton-pulse mb-8" />
      ) : data?.spotlightAnimes?.length > 0 ? (
        <HeroCarousel animes={data.spotlightAnimes} />
      ) : data?.trending?.length > 0 ? (
        <HeroCarousel animes={data.trending} />
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

      {/* Content Rows - overlapping hero slightly */}
      <div className="relative z-20 -mt-16 flex flex-col gap-4">
        <AnimeGrid title="🔥 Trending Now" animes={data?.trending} isLoading={isLoading} count={15} />
        <AnimeGrid title="⚡ Top Airing" animes={data?.topAiring} isLoading={isLoading} count={15} />
        <AnimeGrid title="🌟 Most Popular" animes={data?.mostPopular} isLoading={isLoading} count={15} />
        <AnimeGrid title="📺 Latest Episodes" animes={data?.latestEpisode} isLoading={isLoading} count={15} variant="landscape" />
        <AnimeGrid title="🎯 Top Upcoming" animes={data?.topUpcoming} isLoading={isLoading} count={15} />
        <AnimeGrid title="✅ Recently Completed" animes={data?.latestCompleted} isLoading={isLoading} count={15} />
      </div>
    </div>
  );
};

export default Index;
