import { useHomeData } from "@/hooks/useAnimeData";
import AnimeGrid from "@/components/AnimeGrid";
import HeroCarousel from "@/components/HeroCarousel";
import ErrorFallback from "@/components/ErrorFallback";

const Index = () => {
  const { data, isLoading, isError, refetch } = useHomeData();

  if (isError) return <ErrorFallback message="Failed to load anime data" onRetry={() => refetch()} />;

  return (
    <div className="pt-20 pb-10 container mx-auto px-4">
      {/* Hero Carousel */}
      {isLoading ? (
        <div className="w-full h-[50vh] md:h-[65vh] rounded-2xl skeleton-pulse mb-12" />
      ) : data?.spotlightAnimes?.length > 0 ? (
        <HeroCarousel animes={data.spotlightAnimes} />
      ) : data?.trending?.length > 0 ? (
        <HeroCarousel animes={data.trending} />
      ) : (
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold gradient-text mb-3">
            AniCrew
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Your ultimate anime & donghua streaming hub
          </p>
        </div>
      )}

      <AnimeGrid title="🔥 Trending Now" animes={data?.trending} isLoading={isLoading} count={12} />
      <AnimeGrid title="⚡ Top Airing" animes={data?.topAiring} isLoading={isLoading} count={12} />
      <AnimeGrid title="🌟 Most Popular" animes={data?.mostPopular} isLoading={isLoading} count={12} />
      <AnimeGrid title="📺 Latest Episodes" animes={data?.latestEpisode} isLoading={isLoading} count={12} />
      <AnimeGrid title="🎯 Top Upcoming" animes={data?.topUpcoming} isLoading={isLoading} count={12} />
      <AnimeGrid title="✅ Recently Completed" animes={data?.latestCompleted} isLoading={isLoading} count={12} />
    </div>
  );
};

export default Index;
