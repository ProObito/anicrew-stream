import React, { useEffect, useState } from 'react';
import { Play, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const HeroCarousel = ({ spotlight }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!spotlight || spotlight.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % spotlight.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [spotlight]);

  if (!spotlight || spotlight.length === 0) return null;

  const currentAnime = spotlight[currentIndex];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % spotlight.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + spotlight.length) % spotlight.length);

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0 transition-opacity duration-1000">
        <img
          src={currentAnime?.poster}
          alt={currentAnime?.title}
          className="w-full h-full object-cover animate-fade-in"
        />
      </div>

      {/* Dark Gradient Overlay (Bottom to Top) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-2/3 flex flex-col justify-end animate-slide-up">
        {currentAnime?.rank && (
          <div className="flex items-center gap-2 text-yellow-400 font-bold mb-3 text-sm md:text-base tracking-widest uppercase">
            <Star className="w-5 h-5 fill-current" />
            <span>Spotlight #{currentAnime.rank}</span>
          </div>
        )}
        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 drop-shadow-lg line-clamp-2">
          {currentAnime?.title}
        </h2>
        <p className="text-gray-300 text-sm md:text-lg mb-8 line-clamp-3 md:line-clamp-4 max-w-2xl drop-shadow-md">
          {currentAnime?.description || "Experience the thrill of this amazing anime, currently in the spotlight. Don't miss out on the action, drama, and adventure!"}
        </p>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <Play className="w-5 h-5 fill-current" />
            <span className="text-sm md:text-base uppercase tracking-wider">Watch Now</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
        <button onClick={prevSlide} className="bg-black/50 hover:bg-red-600/90 backdrop-blur text-white p-3 rounded-full transition-all border border-white/20">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
        <button onClick={nextSlide} className="bg-black/50 hover:bg-red-600/90 backdrop-blur text-white p-3 rounded-full transition-all border border-white/20">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 md:bottom-12 right-8 md:right-16 flex gap-2">
         {spotlight.map((_, idx) => (
           <div
             key={idx}
             className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-red-600' : 'w-2 bg-white/30'}`}
           />
         ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
