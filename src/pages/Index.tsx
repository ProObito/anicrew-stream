import { useHomeData } from "@/hooks/useAnimeData";
import AnimeGrid from "@/components/AnimeGrid";
import ErrorFallback from "@/components/ErrorFallback";

const Index = () => {
  const { data, isLoading, isError, refetch } = useHomeData();

  if (isError) return <ErrorFallback message="Failed to load anime data" onRetry={() => refetch()} />;

  return (
    <div className="pt-20 pb-10 container mx-auto px-4">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-display font-bold gradient-text mb-3">
          AniCrew
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Your ultimate anime & donghua streaming hub
        </p>
      </div>

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
