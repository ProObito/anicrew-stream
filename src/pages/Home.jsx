import React, { useEffect, useState } from 'react';
import HeroCarousel from '../components/HeroCarousel';

const Home = () => {
  const [spotlight, setSpotlight] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        console.log("Fetching from Heroku API...");
        const response = await fetch('https://obitoapi-3ef566a3b4f6.herokuapp.com/api/anime/home');
        const result = await response.json();
        console.log("API Response:", result);

        if (result.success && result.data) {
          setSpotlight(result.data.spotlight || []);
          setTrending(result.data.trending || []);
        } else {
          setError("API returned success: false");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch data from API");
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold tracking-widest uppercase text-red-500">Summoning Anime...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
      <p className="text-xl font-bold text-red-500">{error}</p>
    </div>
  );

  return (
    <div className="bg-[#0f0f0f] min-h-screen font-sans">
      <HeroCarousel spotlight={spotlight} />

      <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-16">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white mb-8 flex items-center gap-4">
          <span className="w-2 h-8 bg-red-600 rounded-full inline-block"></span>
          Trending Now
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {trending.length > 0 ? (
            trending.map((anime, index) => (
              <div
                key={index}
                className="group relative flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-800 shadow-lg group-hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)]">
                  <img
                    src={anime.poster}
                    alt={anime.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-red-600 text-white rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-col flex-1">
                  <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2 group-hover:text-red-400 transition-colors">
                    {anime.title}
                  </h3>
                  {anime.rank && (
                    <span className="text-gray-400 text-xs mt-1">Trending #{anime.rank}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-lg col-span-full text-center py-20">No Trending Data Available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
