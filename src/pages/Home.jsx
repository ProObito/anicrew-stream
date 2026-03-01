import React, { useEffect, useState } from 'react';

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

  if (loading) return <div style={{ color: 'white', padding: '50px' }}><h1>Summoning Anime... Please Wait.</h1></div>;
  if (error) return <div style={{ color: 'red', padding: '50px' }}><h1>Error: {error}</h1></div>;

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#121212', minHeight: '100vh' }}>
      <h1>AniCrew - Live Data Test</h1>
      <h2>Spotlight Anime</h2>
      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
        {spotlight.length > 0 ? spotlight.map((anime, index) => (
          <div key={index} style={{ minWidth: '150px' }}>
            <img src={anime.poster} alt={anime.title} style={{ width: '150px', height: '220px', objectFit: 'cover', borderRadius: '8px' }} />
            <p style={{ fontSize: '14px', marginTop: '10px' }}>{anime.title}</p>
          </div>
        )) : <p>No Spotlight Data</p>}
      </div>

      <h2 style={{ marginTop: '40px' }}>Trending Now</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {trending.length > 0 ? trending.map((anime, index) => (
          <div key={index} style={{ width: '150px' }}>
            <img src={anime.poster} alt={anime.title} style={{ width: '150px', height: '220px', objectFit: 'cover', borderRadius: '8px' }} />
            <p style={{ fontSize: '14px', marginTop: '10px' }}>{anime.title}</p>
          </div>
        )) : <p>No Trending Data</p>}
      </div>
    </div>
  );
};

export default Home;
