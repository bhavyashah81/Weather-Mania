import React, { useState, useEffect } from 'react';
// import './App.css'; // Removed to avoid PostCSS issues

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
  name: string;
}

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get user's location and weather on component mount
  useEffect(() => {
    getUserLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          fetchWeatherData(coords.lat, coords.lon);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to New York if location fails
          fetchWeatherData(40.7128, -74.0060);
        }
      );
    } else {
      // Default to New York if geolocation not supported
      fetchWeatherData(40.7128, -74.0060);
    }
  };

  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8000/api/weather/current?lat=${lat}&lon=${lon}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // First geocode the search query
      const geoResponse = await fetch(`http://localhost:8000/api/geocoding?q=${encodeURIComponent(searchQuery)}`);
      
      if (!geoResponse.ok) {
        throw new Error('Failed to find location');
      }
      
      const geoData = await geoResponse.json();
      
      if (geoData && geoData.length > 0) {
        await fetchWeatherData(geoData[0].lat, geoData[0].lon);
      } else {
        setError('Location not found. Please try a different search term.');
      }
    } catch (err) {
      setError('Failed to search location. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherEmoji = (weatherMain: string) => {
    const weatherMap: { [key: string]: string } = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️'
    };
    
    return weatherMap[weatherMain] || '🌤️';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '0.5rem', 
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Weather-Mania 🌤️
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)' }}>
            Your comprehensive weather companion
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleSearch} style={{ 
            display: 'flex', 
            maxWidth: '400px', 
            margin: '0 auto',
            gap: '0.5rem'
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a city..."
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '15px',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '1rem',
                backdropFilter: 'blur(10px)'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '1rem 1.5rem',
                borderRadius: '15px',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                backdropFilter: 'blur(10px)',
                fontSize: '1rem'
              }}
            >
              🔍
            </button>
          </form>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={getUserLocation}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              backdropFilter: 'blur(10px)',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📍 Use My Location
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            maxWidth: '400px',
            margin: '0 auto 2rem',
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(252, 165, 165, 0.3)',
            color: 'white',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid rgba(255,255,255,0.3)',
              borderTop: '3px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: 'white', fontSize: '1.1rem' }}>
              Fetching latest weather data...
            </p>
          </div>
        )}

        {/* Weather Card */}
        {weatherData && !loading && (
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '2rem',
            borderRadius: '24px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            textAlign: 'center',
            color: 'white'
          }}>
            {/* Location */}
            <h2 style={{ 
              fontSize: '2rem', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              📍 {weatherData.name}
            </h2>

            {/* Weather Icon and Temp */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                {getWeatherEmoji(weatherData.weather[0].main)}
              </div>
              <div style={{ 
                fontSize: '4rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {Math.round(weatherData.main.temp)}°C
              </div>
              <p style={{ 
                fontSize: '1.3rem', 
                textTransform: 'capitalize',
                opacity: 0.9
              }}>
                {weatherData.weather[0].description}
              </p>
            </div>

            {/* Feels Like */}
            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              marginBottom: '2rem',
              display: 'inline-block'
            }}>
              🌡️ Feels like {Math.round(weatherData.main.feels_like)}°C
            </div>

            {/* Weather Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <div style={{
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💧</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Humidity</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#60a5fa' }}>
                  {weatherData.main.humidity}%
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Pressure</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4ade80' }}>
                  {weatherData.main.pressure} hPa
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💨</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Wind Speed</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#a78bfa' }}>
                  {Math.round(weatherData.wind.speed * 3.6)} km/h
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👁️</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Visibility</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#facc15' }}>
                  {Math.round(weatherData.visibility / 1000)} km
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '3rem',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.9rem'
        }}>
          <p>Weather data provided by OpenWeatherMap</p>
          <p style={{ marginTop: '0.5rem' }}>
            Backend: http://localhost:8000 | Frontend: http://localhost:3000
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          input::placeholder {
            color: rgba(255, 255, 255, 0.7);
          }
          
          button:hover:not(:disabled) {
            background-color: rgba(255, 255, 255, 0.3) !important;
            transform: translateY(-1px);
          }
          
          @media (max-width: 768px) {
            h1 {
              font-size: 2.5rem !important;
            }
            .temperature-display {
              font-size: 3rem !important;
            }
          }
        `
      }} />
    </div>
  );
}

export default App;