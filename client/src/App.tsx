import React, { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Search, 
  Sun, 
  Cloud, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Droplets, 
  Eye, 
  Gauge,
  TrendingUp,
  RefreshCw,
  Map as MapIcon
} from 'lucide-react';
import WeatherCard from './components/WeatherCard';
import ForecastChart from './components/ForecastChart';
import InteractiveMap from './components/InteractiveMap';
import AirQualityCard from './components/AirQualityCard';
import WeatherMetrics from './components/WeatherMetrics';
import { WeatherService } from './services/WeatherService';
import './App.css';

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
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
      feels_like: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
    dt_txt: string;
  }>;
}

// ✅ FIXED: Proper TypeScript interface for Air Quality
interface AirQualityData {
  list: Array<{
    main: {
      aqi: number;
    };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
  }>;
}

const App: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  // ✅ FIXED: Replaced 'any' with proper type
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [backgroundClass, setBackgroundClass] = useState('weather-background');

  const weatherService = new WeatherService();

  // Get user's location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Update background based on weather
  useEffect(() => {
    if (weatherData) {
      const weatherMain = weatherData.weather[0]?.main.toLowerCase();
      switch (weatherMain) {
        case 'clear':
          setBackgroundClass('sunny-background');
          break;
        case 'rain':
        case 'drizzle':
          setBackgroundClass('rainy-background');
          break;
        case 'clouds':
          setBackgroundClass('cloudy-background');
          break;
        case 'snow':
          setBackgroundClass('snowy-background');
          break;
        default:
          setBackgroundClass('weather-background');
      }
    }
  }, [weatherData]);

  const getUserLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setLocation(coords);
          fetchWeatherData(coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please search for a city.');
          setLoading(false);
          // Default to New York if location fails
          const defaultCoords = { lat: 40.7128, lon: -74.0060 };
          setLocation(defaultCoords);
          fetchWeatherData(defaultCoords);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  const fetchWeatherData = async (coords: { lat: number; lon: number }) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current weather
      const weather = await weatherService.getCurrentWeather(coords.lat, coords.lon);
      setWeatherData(weather);

      // Fetch forecast
      const forecast = await weatherService.getForecast(coords.lat, coords.lon);
      setForecastData(forecast);

      // Fetch air quality
      const airData = await weatherService.getAirQuality(coords.lat, coords.lon);
      setAirQuality(airData);

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
      const geoData = await weatherService.geocodeLocation(searchQuery);
      if (geoData && geoData.length > 0) {
        const coords = {
          lat: geoData[0].lat,
          lon: geoData[0].lon
        };
        setLocation(coords);
        await fetchWeatherData(coords);
      } else {
        setError('Location not found. Please try a different search term.');
      }
    } catch (err) {
      setError('Failed to search location. Please try again.');
      console.error('Search error:', err);
    }
  };

  const refreshWeather = () => {
    if (location) {
      fetchWeatherData(location);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    // Map OpenWeather icons to Lucide icons
    const iconMap: { [key: string]: React.ReactNode } = {
      '01d': <Sun className="weather-icon text-yellow-400" />,
      '01n': <Sun className="weather-icon text-blue-200" />,
      '02d': <Cloud className="weather-icon text-gray-300" />,
      '02n': <Cloud className="weather-icon text-gray-400" />,
      '03d': <Cloud className="weather-icon text-gray-400" />,
      '03n': <Cloud className="weather-icon text-gray-500" />,
      '04d': <Cloud className="weather-icon text-gray-500" />,
      '04n': <Cloud className="weather-icon text-gray-600" />,
      '09d': <CloudRain className="weather-icon text-blue-400" />,
      '09n': <CloudRain className="weather-icon text-blue-500" />,
      '10d': <CloudRain className="weather-icon text-blue-400" />,
      '10n': <CloudRain className="weather-icon text-blue-500" />,
      '11d': <CloudRain className="weather-icon text-purple-400" />,
      '11n': <CloudRain className="weather-icon text-purple-500" />,
    };
    
    return iconMap[iconCode] || <Sun className="weather-icon text-yellow-400" />;
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ${backgroundClass}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4 gradient-text">
            Weather-Mania 🌤️
          </h1>
          <p className="text-white/80 text-lg">Your comprehensive weather companion</p>
        </motion.header>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto mb-8"
        >
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Search for a city..."
              className="w-full px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
            >
              <Search className="w-6 h-6 text-white" />
            </button>
          </form>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center gap-4 mb-8"
        >
          <button
            onClick={getUserLocation}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Use My Location
          </button>
          
          <button
            onClick={refreshWeather}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setShowMap(!showMap)}
            className="btn-primary flex items-center gap-2"
          >
            <MapIcon className="w-5 h-5" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md mx-auto mb-6 p-4 bg-red-500/20 backdrop-blur-md rounded-xl border border-red-300/30 text-white text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center mb-8"
            >
              <div className="relative">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 border-2 border-white/30"></div>
              </div>
              {/* ✅ IMPROVED: Enhanced loading message with animation */}
              <p className="text-white mt-4 animate-pulse">Fetching latest weather data...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence>
          {weatherData && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6"
            >
              {/* Current Weather Card */}
              <WeatherCard 
                weatherData={weatherData}
                getWeatherIcon={getWeatherIcon}
              />

              {/* Weather Metrics */}
              <WeatherMetrics weatherData={weatherData} />

              {/* Air Quality */}
              {airQuality && (
                <AirQualityCard airQuality={airQuality} />
              )}

              {/* Interactive Map */}
              <AnimatePresence>
                {showMap && location && (
                  <InteractiveMap 
                    lat={location.lat} 
                    lon={location.lon}
                    weatherData={weatherData}
                  />
                )}
              </AnimatePresence>

              {/* Forecast Chart */}
              {forecastData && (
                <ForecastChart forecastData={forecastData} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
