import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const artRef = useRef(null);

  const [showNextTimer, setShowNextTimer] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isLandscape, setIsLandscape] = useState(false);

  // Initialize Artplayer with HLS support
  useEffect(() => {
    if (videoRef.current) {
      const art = new Artplayer({
        container: videoRef.current,
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Fallback/Test stream
        customType: {
          m3u8: function playM3u8(video, url, art) {
            if (Hls.isSupported()) {
              if (art.hls) art.hls.destroy();
              const hls = new Hls();
              hls.loadSource(url);
              hls.attachMedia(video);
              art.hls = hls;
              art.on('destroy', () => hls.destroy());
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = url;
            } else {
              art.notice.show = 'Does not support playback of m3u8';
            }
          }
        },
        title: id?.replace(/-/g, ' ').toUpperCase() || 'Playing Anime',
        poster: 'https://i.pinimg.com/originals/30/8a/a6/308aa6c7f8a7ab45b04db29f0ce6471e.jpg',
        volume: 0.5,
        isLive: false,
        muted: false,
        autoplay: false,
        pip: true,
        autoSize: true,
        autoMini: true,
        screenshot: true,
        setting: true,
        loop: false,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        subtitleOffset: true,
        miniProgressBar: true,
        mutex: true,
        backdrop: true,
        playsInline: true,
        autoPlayback: true,
        airplay: true,
        theme: '#dc2626',
        lang: navigator.language.toLowerCase(),
        moreVideoAttr: {
          crossOrigin: 'anonymous',
        },
      });

      art.on('video:ended', () => {
        handleVideoEnd();
      });

      artRef.current = art;

      return () => {
        if (artRef.current && artRef.current.destroy) {
          artRef.current.destroy(false);
        }
      };
    }
  }, [id]);

  // 🔄 Screen Rotation Logic (Mobile Only)
  const toggleRotation = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        if (window.screen.orientation && window.screen.orientation.lock) {
          await window.screen.orientation.lock('landscape');
          setIsLandscape(true);
        }
      } catch (err) {
        console.error("Rotation lock failed:", err);
      }
    } else {
      document.exitFullscreen();
      if (window.screen.orientation && window.screen.orientation.unlock) {
        window.screen.orientation.unlock();
        setIsLandscape(false);
      }
    }
  };

  // ⏱️ YouTube Style Next Episode Timer Logic
  const handleVideoEnd = () => {
    setShowNextTimer(true);
    let timer = 5;
    const interval = setInterval(() => {
      timer -= 1;
      setCountdown(timer);
      if (timer <= 0) {
        clearInterval(interval);
        playNextEpisode();
      }
    }, 1000);
  };

  const playNextEpisode = () => {
    setShowNextTimer(false);
    setCountdown(5);
    // Placeholder navigation for now
    alert("Navigating to Next Episode! 🚀");
    // navigate(`/anime/${nextEpisodeId}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20 px-4 md:px-16 pb-10">
      <h1 className="text-2xl font-bold mb-4 text-red-500 uppercase tracking-wide">
        Now Playing: {id?.replace(/-/g, ' ')}
      </h1>

      {/* 🎬 VIDEO PLAYER CONTAINER */}
      <div className="relative w-full max-w-5xl mx-auto aspect-video bg-black rounded-xl border border-gray-800 overflow-hidden shadow-2xl group">

        {/* ARTPLAYER CONTAINER */}
        <div
          ref={videoRef}
          className="w-full h-full"
        ></div>

        {/* ⚙️ CUSTOM PLAYER CONTROLS (Overlay - Outside player frame) */}
        <div className="absolute top-4 right-4 flex gap-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={toggleRotation} className="bg-black/70 hover:bg-red-600 text-white p-2 rounded-md backdrop-blur-sm transition-colors text-sm font-bold flex items-center gap-2 shadow-lg" title="Rotate Screen">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
            <span className="hidden md:inline">{isLandscape ? 'Portrait' : 'Landscape'}</span>
          </button>
        </div>

        {/* ⏭️ YOUTUBE STYLE 'UP NEXT' OVERLAY */}
        {showNextTimer && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 animate-fade-in backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-2">Up Next</h2>
            <p className="text-gray-400 mb-6 font-medium">Episode 2 starting in...</p>
            <div className="text-7xl font-black text-red-600 mb-8 animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">{countdown}</div>
            <div className="flex gap-4">
              <button onClick={playNextEpisode} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors transform hover:scale-105 shadow-lg">
                Play Now
              </button>
              <button onClick={() => setShowNextTimer(false)} className="bg-transparent border-2 border-gray-500 text-gray-300 px-8 py-3 rounded-full font-bold hover:border-white hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 💬 COMMENTS SECTION */}
      <div className="max-w-5xl mx-auto mt-12 bg-[#141414] p-6 rounded-xl border border-gray-800 shadow-xl">
        <h2 className="text-xl font-bold mb-4 border-l-4 border-red-600 pl-3 uppercase tracking-wider text-gray-200">Discussion</h2>
        <textarea
          className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-red-500 resize-none transition-colors"
          rows="3" placeholder="Drop your thoughts about this episode..."
        ></textarea>
        <button className="mt-4 bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded font-bold transition-all transform hover:-translate-y-1 shadow-md">
          Post Comment
        </button>
      </div>

    </div>
  );
};

export default Player;
