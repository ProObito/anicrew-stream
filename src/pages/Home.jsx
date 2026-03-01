import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// ✨ Animated Loader CSS
const loaderCSS = `
  @keyframes spin-pulse {
    0% { transform: scale(1) rotate(0deg); opacity: 1; }
    50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; }
    100% { transform: scale(1) rotate(360deg); opacity: 1; }
  }
  .magic-emoji {
    animation: spin-pulse 1.5s infinite ease-in-out;
    display: inline-block;
    font-size: 5rem;
    text-shadow: 0 0 20px rgba(255, 49, 49, 0.8);
  }
`;

const Home = () => {
  const [spotlight, setSpotlight] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('anicrew_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    const fetchAnime = async () => {
      try {
        // Naya Vercel API Link
        const res = await fetch('https://hianime-api-seven-teal.vercel.app/api/v1/home');
        const result = await res.json();
        const data = result.data || result;

        setSpotlight(data.spotlightAnimes || data.spotlight || []);
        setTrending(data.trendingAnimes || data.trending || []);
        setLatest(data.latestEpisodeAnimes || data.latestEpisodes || []);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setTimeout(() => setLoading(false), 1000); // Thoda animation enjoy karne ke liye delay
      }
    };
    fetchAnime();
  }, []);

  // 🌟 LOADING STATE
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
      <style>{loaderCSS}</style>
      <div className="magic-emoji mb-6">✨</div>
      <h1 className="text-3xl font-extrabold tracking-widest text-red-600 animate-pulse">SUMMONING ANICREW</h1>
      <p className="text-gray-400 mt-2 font-medium">Entering the Anime Realm...</p>
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-10 font-sans">

      {/* 🎬 HERO SPOTLIGHT BANNER */}
      {spotlight.length > 0 && (
        <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
          <img src={spotlight[0].poster} alt={spotlight[0].title || spotlight[0].name} className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent"></div>

          <div className="absolute bottom-10 left-4 md:left-16 max-w-3xl z-10 animate-fade-in">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block shadow-[0_0_10px_rgba(255,0,0,0.8)]">
              #1 SPOTLIGHT
            </span>
            <h2 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-2xl leading-tight line-clamp-2">
              {spotlight[0].title || spotlight[0].name}
            </h2>
            <p className="text-gray-300 text-sm md:text-base mb-6 line-clamp-3 md:line-clamp-4 font-medium max-w-2xl drop-shadow-md">
              {spotlight[0].description || spotlight[0].synopsis || "Dive into the most anticipated anime of the season. Stream in HD, only on AniCrew."}
            </p>
            <div className="flex gap-4">
              {/* CLICKABLE BUTTON */}
              <Link to={`/anime/${spotlight[0].id}`} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-bold text-lg transition-all shadow-[0_0_15px_rgba(255,49,49,0.5)] flex items-center gap-2 transform hover:scale-105">
                ▶ Watch Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 CONTENT SECTIONS */}
      <div className="px-4 md:px-16 mt-8 space-y-12 max-w-[1600px] mx-auto">

        {/* CONTINUE WATCHING (History) */}
        {history.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-gray-200">
              <span className="w-1.5 h-6 bg-red-600 rounded-full"></span> Continue Watching
            </h2>
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-hide">
              {history.map((anime, i) => (
                <Link to={`/anime/${anime.id}`} key={i} className="group relative shrink-0 w-40 md:w-48 block cursor-pointer transition-transform duration-300 hover:-translate-y-2">
                  <div className="aspect-video w-full overflow-hidden rounded-xl border border-gray-800 group-hover:border-red-500 transition-colors shadow-lg">
                    <img src={anime.poster} alt={anime.title || anime.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-red-600 p-3 rounded-full text-white shadow-[0_0_15px_rgba(255,0,0,0.8)] transform scale-0 group-hover:scale-100 transition-transform duration-300">▶</div>
                    </div>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-gray-200 group-hover:text-white line-clamp-1">{anime.title || anime.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">Ep {anime.episode || 1}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* RECENTLY UPDATED */}
        {latest.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-gray-200">
              <span className="w-1.5 h-6 bg-red-600 rounded-full"></span> Recently Updated
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {latest.slice(0, 10).map((anime, i) => (
                <Link to={`/anime/${anime.id}`} key={i} className="group relative block cursor-pointer transition-transform duration-300 hover:-translate-y-2">
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded z-10 border border-white/10">
                    Ep {anime.episodes?.sub || anime.episode || "?"}
                  </div>
                  <div className="aspect-[2/3] overflow-hidden rounded-xl border border-gray-800 group-hover:border-red-500 transition-colors shadow-lg">
                    <img src={anime.poster} alt={anime.title || anime.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-red-600 p-3 rounded-full text-white shadow-[0_0_15px_rgba(255,0,0,0.8)] transform scale-0 group-hover:scale-100 transition-transform duration-300">▶</div>
                    </div>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-gray-200 group-hover:text-white line-clamp-2">{anime.title || anime.name}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* TRENDING NOW (Responsive Grid) */}
        {trending.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-gray-200">
              <span className="w-1.5 h-6 bg-red-600 rounded-full"></span> Trending Now
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {trending.map((anime, i) => (
                <Link to={`/anime/${anime.id}`} key={i} className="group relative block cursor-pointer transition-transform duration-300 hover:-translate-y-2">
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10 shadow-md">
                    #{anime.rank || i + 1}
                  </div>
                  <div className="aspect-[2/3] overflow-hidden rounded-xl border border-gray-800 group-hover:border-red-500 transition-colors shadow-lg">
                    <img src={anime.poster} alt={anime.title || anime.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-red-600 p-3 rounded-full text-white shadow-[0_0_15px_rgba(255,0,0,0.8)] transform scale-0 group-hover:scale-100 transition-transform duration-300">▶</div>
                    </div>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-gray-200 group-hover:text-white line-clamp-2">{anime.title || anime.name}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* 📖 WHY ANICREW (Footer Section) */}
      <div className="mt-20 bg-[#111] border-t border-gray-900 px-6 md:px-16 py-12 text-center md:text-left">
        <h2 className="text-3xl font-black mb-4"><span className="text-red-600">Why</span> AniCrew?</h2>
        <p className="text-gray-400 text-sm md:text-base max-w-4xl leading-relaxed">
          Welcome to AniCrew, built by an Otaku, for the Otakus. We deliver blazing fast anime streaming directly from the best servers. No intrusive pop-up ads, pure premium UI, and a dedicated community. Whether it's the newest seasonal banger or a classic masterpiece, your watch starts here.
        </p>
      </div>

    </div>
  );
};

export default Home;
