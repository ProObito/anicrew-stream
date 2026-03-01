import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [spotlight, setSpotlight] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        // Wapas Tera Heroku Backend Laga Diya!
        const res = await fetch('https://obitoapi-3ef566a3b4f6.herokuapp.com/api/anime/home');
        const result = await res.json();

        // Data mapping
        const data = result.data || {};
        setSpotlight(data.spotlight || []);
        setTrending(data.trending || []);
        setLatest(data.latestEpisodes || []);
      } catch (err) {
        console.error("API Error:", err);
      }
    };
    fetchAnime();
  }, []);

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-10 font-sans">

      {/* 🔮 NAVBAR */}
      <nav className="fixed top-0 w-full px-6 py-4 flex items-center justify-between bg-[#0a0a0a]/90 backdrop-blur-md z-50 border-b border-gray-800">
        <h1 className="text-3xl font-black italic tracking-tighter">
          <span className="text-red-600">Ani</span>Crew
        </h1>
        <button className="text-gray-300 hover:text-white font-bold">🔍 Search</button>
      </nav>

      {/* 🎬 HERO SPOTLIGHT (Loads Instantly) */}
      {spotlight.length > 0 ? (
        <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden pt-16">
          <img src={spotlight[0].poster} alt={spotlight[0].title} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>

          <div className="absolute bottom-10 left-4 md:left-16 max-w-2xl z-10">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">#1 SPOTLIGHT</span>
            <h2 className="text-4xl md:text-5xl font-black mb-3 drop-shadow-lg">{spotlight[0].title}</h2>
            <p className="text-gray-300 text-sm md:text-base mb-5 line-clamp-3">{spotlight[0].synopsis}</p>
            <Link to={`/anime/${spotlight[0].id}`} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-bold text-lg shadow-lg flex w-max">
              ▶ Watch Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full h-[60vh] pt-16 flex justify-center items-center"><p className="text-gray-500">Loading Spotlight...</p></div>
      )}

      {/* 🚀 TRENDING GRID */}
      <div className="px-4 md:px-16 mt-10">
        <h2 className="text-2xl font-bold mb-4 border-l-4 border-red-600 pl-3">Trending Now</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {trending.map((anime, i) => (
            <Link to={`/anime/${anime.id}`} key={i} className="group relative block cursor-pointer">
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">#{anime.rank || i + 1}</div>
              <div className="aspect-[2/3] overflow-hidden rounded-lg border border-gray-800">
                <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-gray-300 group-hover:text-red-500 line-clamp-2">{anime.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
