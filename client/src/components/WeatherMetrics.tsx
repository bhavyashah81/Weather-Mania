import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Gauge, Wind, Eye } from 'lucide-react';

interface WeatherMetricsProps {
  weatherData: {
    main: {
      humidity: number;
      pressure: number;
    };
    wind: {
      speed: number;
      deg: number;
    };
    visibility: number;
  };
}

const WeatherMetrics: React.FC<WeatherMetricsProps> = ({ weatherData }) => {
  const metrics = [
    {
      icon: <Droplets className="w-8 h-8 text-blue-400" />,
      label: 'Humidity',
      value: `${weatherData.main.humidity}%`,
      color: 'text-blue-400'
    },
    {
      icon: <Gauge className="w-8 h-8 text-green-400" />,
      label: 'Pressure',
      value: `${weatherData.main.pressure} hPa`,
      color: 'text-green-400'
    },
    {
      icon: <Wind className="w-8 h-8 text-purple-400" />,
      label: 'Wind Speed',
      value: `${Math.round(weatherData.wind.speed * 3.6)} km/h`,
      color: 'text-purple-400'
    },
    {
      icon: <Eye className="w-8 h-8 text-yellow-400" />,
      label: 'Visibility',
      value: `${Math.round(weatherData.visibility / 1000)} km`,
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="weather-metric"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex flex-col items-center space-y-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
            >
              {metric.icon}
            </motion.div>
            <div className="text-center">
              <p className="text-white/70 text-sm font-medium">{metric.label}</p>
              <p className={`text-lg font-bold ${metric.color}`}>
                {metric.value}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default WeatherMetrics; 
