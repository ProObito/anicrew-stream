import React, { useState, useEffect } from 'react';
import { Play, Star, Heart, Search, Bell, User, LayoutDashboard, ChevronRight, ChevronLeft } from 'lucide-react';

const Home = () => {
  // Slider Data (High-Quality TMDB/AniList Images)
  const heroAnimeList = [
    {
      id: 1,
      title: "SOLO LEVELING",
      subtitle: "AWAKENING",
      desc: "In a world of awakened beings called Hunters, Jinwoo Sung must survive the deadliest dungeons.",
      bannerImg: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-tAigENiu3oB8.jpg",
      coverImg: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-m1gX3iqITmI6.png",
      rating: "9.8"
    },
    {
      id: 2,
      title: "JUJUTSU KAISEN",
      subtitle: "CURSED CLASH",
      desc: "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself.",
      bannerImg: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/145064-1v27T8G3X34b.jpg",
      coverImg: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx145064-1jFIfZ1o090x.png",
      rating: "9.5"
    },
    {
      id: 3,
      title: "DEMON SLAYER",
      subtitle: "ENTERTAINMENT DIST",
      desc: "Tanjiro and his friends accompany the Hashira Tengen Uzui to an entertainment district.",
      bannerImg: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-YfZhKBUDDS6L.jpg",
      coverImg: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93DQl.jpg",
      rating: "9.3"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-Slider Logic (Changes every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroAnimeList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroAnimeList.length]);

  const currentAnime = heroAnimeList[currentIndex];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % heroAnimeList.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + heroAnimeList.length) % heroAnimeList.length);

  return (
    <div className="min-h-screen bg-[#e5e7eb] md:bg-[#0d0d0f] text-black md:text-white font-sans pb-20">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 bg-[#e5e7eb] md:bg-transparent">
        <h1 className="text-xl md:text-2xl font-black tracking-widest uppercase">AniCrew</h1>

        <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-400">
          <span className="hover:text-white cursor-pointer transition">Community</span>
          <span className="hover:text-white cursor-pointer transition">Company</span>
          <span className="hover:text-white cursor-pointer transition">Contact</span>
        </div>

        <div className="flex items-center space-x-4">
          <button className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold">Log in</button>
          <button className="border-2 border-black text-black md:border-white md:text-white px-5 py-2 rounded-full text-sm font-bold">Sign up</button>
        </div>
      </nav>

      {/* HERO SECTION (Original Asymmetric Design forced for both Mobile & Desktop) */}
      <div className="px-4 md:px-12 mt-4 max-w-[1400px] mx-auto">

        {/* BIG TEXT */}
        <h2 className="text-5xl md:text-[6rem] font-black uppercase tracking-tighter leading-[0.9] mb-8 text-black md:text-gray-200 transition-all duration-500">
          {currentAnime.title} <br className="hidden md:block"/>
          <span className="text-gray-500 text-4xl md:text-[5rem]">{currentAnime.subtitle}</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 relative">

          {/* Left Big Landscape Image */}
          <div className="lg:col-span-8 relative h-[250px] md:h-[550px] rounded-tl-[3rem] rounded-br-[3rem] md:rounded-tl-[5rem] md:rounded-bl-[2rem] md:rounded-tr-[2rem] md:rounded-br-[5rem] overflow-hidden shadow-2xl group">
            <img
              src={currentAnime.bannerImg}
              alt="Main Banner"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Manual Slider Controls */}
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={prevSlide} className="bg-white/30 backdrop-blur p-2 rounded-full text-black hover:bg-white"><ChevronLeft/></button>
               <button onClick={nextSlide} className="bg-white/30 backdrop-blur p-2 rounded-full text-black hover:bg-white"><ChevronRight/></button>
            </div>
          </div>

          {/* Floating Circular Badge (Now visible on mobile too) */}
          <div className="absolute left-[50%] md:left-[64%] top-[45%] md:top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-20 h-20 md:w-32 md:h-32 bg-[#e5e7eb] md:bg-[#0d0d0f] rounded-full flex items-center justify-center p-2">
            <div className="w-full h-full border border-black md:border-white rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
               <span className="text-[8px] md:text-xs font-bold tracking-widest text-black md:text-white text-center">
                 EXPLORE MORE •
               </span>
            </div>
            <Star className="absolute w-5 h-5 md:w-8 md:h-8 text-black md:text-white" fill="currentColor" />
          </div>

          {/* Right Side Column */}
          <div className="lg:col-span-4 flex flex-col gap-4 md:gap-8 mt-4 md:mt-0">
            {/* Top Right Portrait Image */}
            <div className="flex-1 rounded-tl-[2rem] rounded-br-[2rem] md:rounded-tl-[4rem] md:rounded-tr-[2rem] md:rounded-bl-[2rem] md:rounded-br-[4rem] overflow-hidden h-[200px] md:h-[300px] shadow-2xl">
              <img
                src={currentAnime.coverImg}
                alt="Portrait Cover"
                className="w-full h-full object-cover transition-all duration-700"
              />
            </div>

            {/* Bottom Right Info Card */}
            <div className="bg-white md:bg-[#f3f4f6] text-black p-6 md:p-8 rounded-tl-[2rem] rounded-br-[2rem] md:rounded-tl-[3rem] md:rounded-tr-[2rem] md:rounded-bl-[2rem] md:rounded-br-[4rem] flex flex-col justify-between shadow-xl border border-gray-200">
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Crafting Anime Characters</h3>
                <p className="text-xs md:text-sm text-gray-600 line-clamp-3 md:line-clamp-4">
                  {currentAnime.desc}
                </p>
              </div>
              <div className="flex justify-between items-center mt-6">
                <div className="flex space-x-2">
                  <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#7c3aed] transition"><Heart className="w-4 h-4"/></div>
                  <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center cursor-pointer"><Star className="w-4 h-4 text-yellow-400" fill="currentColor"/></div>
                </div>
                <button className="flex items-center space-x-2 bg-transparent border border-black hover:bg-[#7c3aed] hover:border-[#7c3aed] hover:text-white px-4 md:px-6 py-2 rounded-full font-bold transition">
                  <span className="text-sm">Watch Now</span>
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;