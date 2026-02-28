import { useHomeData } from "@/hooks/useAnimeData";
import { Link } from "react-router-dom";
import { Play, Star, Heart } from "lucide-react";
import { motion } from "framer-motion";
import AnimeGrid from "@/components/AnimeGrid";
import ErrorFallback from "@/components/ErrorFallback";
import { useState } from "react";

const genres = ["Action", "Adventure", "Animation", "Biography", "Crime", "Comedy", "Drama"];

const Index = () => {
  const { data, isLoading, isError, refetch } = useHomeData();
  const [activeGenre, setActiveGenre] = useState("Action");

  if (isError) return <ErrorFallback message="Failed to load anime data" onRetry={() => refetch()} />;

  // Pick hero from spotlight or trending
  const spotlight = data?.spotlightAnimes ?? [];
  const heroAnime = spotlight[0] ?? data?.trending?.[0];
  const heroAnime2 = spotlight[1] ?? data?.trending?.[1];

  return (
    <div className="pb-10">
      {/* HERO: Asymmetric Curved Layout */}
      {isLoading ? (
        <div className="px-8 md:px-16 lg:px-24 pt-24 max-w-[1400px] mx-auto">
          <div className="h-16 w-3/4 skeleton-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-[500px] skeleton-pulse rounded-[2.5rem]" />
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex-1 h-[250px] skeleton-pulse rounded-[2.5rem]" />
              <div className="h-[220px] skeleton-pulse rounded-[2.5rem]" />
            </div>
          </div>
        </div>
      ) : heroAnime ? (
        <div className="px-8 md:px-16 lg:px-24 pt-24 max-w-[1400px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-[4rem] md:text-[6rem] lg:text-[7rem] font-display font-black uppercase tracking-tighter leading-[0.85] mb-8 text-foreground"
          >
            CREATION OF <br /> ANIME CHARACTERS
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
            {/* Left Big Landscape Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-8 relative h-[300px] md:h-[500px] rounded-tl-[4rem] rounded-bl-3xl rounded-tr-3xl rounded-br-[4rem] overflow-hidden group"
            >
              <Link to={`/anime/${heroAnime.id}`}>
                <img
                  src={heroAnime.poster}
                  alt={heroAnime.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground drop-shadow-lg">
                    {heroAnime.name}
                  </h3>
                  {(heroAnime as any).description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 max-w-lg">
                      {(heroAnime as any).description}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>

            {/* Circular Floating Badge */}
            <div className="absolute left-[62%] top-1/2 -translate-y-1/2 z-10 w-28 h-28 bg-foreground text-background rounded-full flex items-center justify-center border-4 border-background shadow-2xl hidden lg:flex">
              <div className="text-[10px] font-black uppercase text-center tracking-widest p-2">
                Let's Explore More
                <Star className="w-6 h-6 mx-auto mt-1" />
              </div>
            </div>

            {/* Right Side Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-4 flex flex-col gap-6"
            >
              {/* Top Right Portrait Image */}
              {heroAnime2 && (
                <Link
                  to={`/anime/${heroAnime2.id}`}
                  className="flex-1 rounded-tl-[3rem] rounded-tr-3xl rounded-br-[3rem] rounded-bl-3xl overflow-hidden h-[250px] relative group"
                >
                  <img
                    src={heroAnime2.poster}
                    alt={heroAnime2.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <p className="absolute bottom-4 left-4 font-display font-bold text-foreground text-lg">
                    {heroAnime2.name}
                  </p>
                </Link>
              )}

              {/* Bottom Right Info Card */}
              <div className="bg-foreground/95 text-background p-6 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-[3rem] h-[220px] flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-display font-bold mb-2">
                    {heroAnime.name}
                  </h3>
                  <p className="text-sm text-background/70 line-clamp-3">
                    {(heroAnime as any).description || "Watch the latest and most trending anime episodes right now in HD quality."}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex space-x-3">
                    <Heart className="w-8 h-8 p-1.5 bg-background text-foreground rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition" />
                    <Star className="w-8 h-8 p-1.5 bg-background text-yellow-400 rounded-full cursor-pointer" />
                  </div>
                  <Link
                    to={`/anime/${heroAnime.id}`}
                    className="flex items-center space-x-2 border-2 border-background hover:bg-background hover:text-foreground px-6 py-2 rounded-full font-bold transition text-background"
                  >
                    <span>Watch Now</span>
                    <Play className="w-4 h-4 fill-current" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
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

      {/* TRENDS NOW SECTION */}
      <div className="px-8 md:px-16 lg:px-24 mt-24 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
          <div className="flex items-center space-x-2">
            <span className="text-primary font-bold">📈</span>
            <h2 className="section-title">Trends Now</h2>
          </div>
          <div className="hidden md:flex space-x-6 text-sm font-medium text-muted-foreground">
            <span className="text-foreground flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-2" /> Popular
            </span>
            <span className="hover:text-foreground cursor-pointer transition">★ Premieres</span>
            <span className="hover:text-foreground cursor-pointer transition">+ Recently Added</span>
          </div>
        </div>

        {/* Genre Pills */}
        <div className="flex space-x-3 overflow-x-auto hide-scrollbar pb-4 mb-6">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-6 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeGenre === genre
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground border border-border hover:bg-secondary"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Trending Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {(data?.trending ?? []).slice(0, 12).map((anime) => (
            <Link key={anime.id} to={`/anime/${anime.id}`} className="group cursor-pointer">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-transparent hover:border-border transition">
                <img
                  src={anime.poster}
                  alt={anime.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-bold text-sm truncate text-foreground">{anime.name}</h3>
              <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                <span>{anime.type || "TV"}</span>
                {anime.rating && (
                  <div className="flex items-center text-amber-400 font-bold">
                    <Star className="w-3 h-3 fill-current mr-1" /> {anime.rating}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Content Rows */}
      <div className="relative z-20 mt-16 flex flex-col gap-4">
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
