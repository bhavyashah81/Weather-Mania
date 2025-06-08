import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Thermometer } from 'lucide-react';

interface WeatherCardProps {
  weatherData: {
    main: {
      temp: number;
      feels_like: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    name: string;
  };
  getWeatherIcon: (iconCode: string) => React.ReactNode;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weatherData, getWeatherIcon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="weather-card max-w-lg mx-auto text-center"
    >
      {/* Location */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-white/80" />
        <h2 className="text-2xl font-semibold text-white">{weatherData.name}</h2>
      </div>

      {/* Weather Icon */}
      <motion.div 
        className="mb-6"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {getWeatherIcon(weatherData.weather[0].icon)}
      </motion.div>

      {/* Temperature */}
      <div className="mb-6">
        <motion.div 
          className="temperature-display mb-2"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {Math.round(weatherData.main.temp)}°C
        </motion.div>
        <p className="text-white/80 text-lg capitalize">
          {weatherData.weather[0].description}
        </p>
      </div>

      {/* Feels Like */}
      <div className="glass-effect p-4 mx-auto max-w-xs">
        <div className="flex items-center justify-center gap-2">
          <Thermometer className="w-5 h-5 text-white/80" />
          <span className="text-white">
            Feels like {Math.round(weatherData.main.feels_like)}°C
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherCard; 
