import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Player = () => {
  const { id } = useParams();
  const [episodes, setEpisodes] = useState([]);
  const [currentEp, setCurrentEp] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Episodes from API
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        // HiAnime API se is anime ke saare episodes nikal rahe hain
        const res = await fetch(`https://hianime-api-seven-teal.vercel.app/api/v1/episodes/${id}`);
        const result = await res.json();

        if (result.success && result.data) {
          setEpisodes(result.data.episodes || []);
          if (result.data.episodes.length > 0) {
            setCurrentEp(result.data.episodes[0]); // Pela episode default select
          }
        }
      } catch (err) {
        console.error("Failed to fetch episodes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEpisodes();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 px-4 md:px-16 pb-10">

      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">

        {/* LEFT SIDE: VIDEO PLAYER CONTAINER */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4 text-gray-200">
            Now Playing: <span className="text-red-500">{currentEp ? currentEp.title : id?.replace(/-/g, ' ')}</span>
          </h1>

          <div className="w-full aspect-video bg-black rounded-xl border border-gray-800 flex items-center justify-center shadow-2xl relative">
            {loading ? (
              <p className="text-gray-500 font-bold">Loading Player...</p>
            ) : currentEp ? (
              // ASLI PLAYER: Yahan iFrame ya Vidstack aayega stream link ke sath
              <div className="text-center">
                <p className="text-red-500 font-bold text-xl mb-2">Episode {currentEp.number}</p>
                <p className="text-gray-400 text-sm">To play the video, we need to pass this Episode ID ({currentEp.episodeId}) to the /stream endpoint.</p>
                <button className="mt-4 bg-red-600 px-6 py-2 rounded font-bold">Play Server 1</button>
              </div>
            ) : (
              <p className="text-red-500">No episodes found for this anime.</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: EPISODES LIST */}
        <div className="w-full lg:w-80 bg-[#111] border border-gray-800 rounded-xl p-4 flex flex-col h-[600px]">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Episodes ({episodes.length})</h2>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {loading ? <p className="text-gray-500 text-center mt-10">Loading episodes...</p> : null}

            {episodes.map((ep, index) => (
              <button
                key={index}
                onClick={() => setCurrentEp(ep)}
                className={`w-full text-left p-3 rounded-lg text-sm font-semibold transition-colors flex gap-3 items-center ${
                  currentEp?.episodeId === ep.episodeId
                  ? 'bg-red-600 text-white'
                  : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#222]'
                }`}
              >
                <span className="w-8 text-center bg-black/50 rounded py-1">{ep.number}</span>
                <span className="truncate">{ep.title || `Episode ${ep.number}`}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Player;
