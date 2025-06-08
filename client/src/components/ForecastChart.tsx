import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Calendar, Thermometer } from 'lucide-react';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ForecastChartProps {
  forecastData: {
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
  };
}

const ForecastChart: React.FC<ForecastChartProps> = ({ forecastData }) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Process forecast data for charts
  const processData = () => {
    // Take next 24 hours (8 data points, every 3 hours)
    const next24Hours = forecastData.list.slice(0, 8);
    
    const labels = next24Hours.map(item => 
      format(new Date(item.dt * 1000), 'HH:mm')
    );
    
    const temperatures = next24Hours.map(item => Math.round(item.main.temp));
    const feelsLike = next24Hours.map(item => Math.round(item.main.feels_like));
    const humidity = next24Hours.map(item => item.main.humidity);
    const windSpeed = next24Hours.map(item => Math.round(item.wind.speed * 3.6)); // Convert m/s to km/h

    return { labels, temperatures, feelsLike, humidity, windSpeed, rawData: next24Hours };
  };

  const { labels, temperatures, feelsLike, humidity, windSpeed, rawData } = processData();

  // Chart configuration
  const temperatureChartData = {
    labels,
    datasets: [
      {
        label: 'Temperature',
        data: temperatures,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Feels Like',
        data: feelsLike,
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [5, 5],
      }
    ]
  };

  const humidityChartData = {
    labels,
    datasets: [
      {
        label: 'Humidity (%)',
        data: humidity,
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          afterLabel: function(context: any) {
            const index = context.dataIndex;
            const weather = rawData[index].weather[0].description;
            return `Weather: ${weather}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    }
  };

  // Get min and max temperatures for summary
  const minTemp = Math.min(...temperatures);
  const maxTemp = Math.max(...temperatures);
  const avgTemp = Math.round(temperatures.reduce((a, b) => a + b, 0) / temperatures.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="weather-card max-w-6xl mx-auto"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <TrendingUp className="w-7 h-7" />
          24-Hour Forecast
        </h3>
        <p className="text-white/70">Temperature trends and weather conditions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div 
          className="glass-effect p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Thermometer className="w-5 h-5 text-blue-400" />
            <span className="text-white/80 text-sm">Temperature Range</span>
          </div>
          <div className="text-xl font-bold text-white">
            {minTemp}° - {maxTemp}°C
          </div>
        </motion.div>

        <motion.div 
          className="glass-effect p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-green-400" />
            <span className="text-white/80 text-sm">Average Temp</span>
          </div>
          <div className="text-xl font-bold text-white">
            {avgTemp}°C
          </div>
        </motion.div>

        <motion.div 
          className="glass-effect p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-white/80 text-sm">Trend</span>
          </div>
          <div className="text-xl font-bold text-white">
            {temperatures[temperatures.length - 1] > temperatures[0] ? '↗️ Rising' : '↘️ Falling'}
          </div>
        </motion.div>
      </div>

      {/* Temperature Chart */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-white mb-4 text-center">
          Temperature & Feels Like
        </h4>
        <div className="h-64 w-full">
          <Line data={temperatureChartData} options={chartOptions} />
        </div>
      </div>

      {/* Humidity Chart */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4 text-center">
          Humidity Levels
        </h4>
        <div className="h-48 w-full">
          <Line data={humidityChartData} options={{
            ...chartOptions,
            scales: {
              ...chartOptions.scales,
              y: {
                ...chartOptions.scales.y,
                min: 0,
                max: 100
              }
            }
          }} />
        </div>
      </div>

      {/* Detailed Forecast Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {rawData.slice(0, 4).map((item, index) => (
          <motion.div
            key={item.dt}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect p-3 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-white/80 text-sm mb-2">
              {format(new Date(item.dt * 1000), 'HH:mm')}
            </div>
            <div className="text-lg font-bold text-white mb-1">
              {Math.round(item.main.temp)}°C
            </div>
            <div className="text-white/60 text-xs capitalize mb-2">
              {item.weather[0].description}
            </div>
            <div className="flex justify-between text-xs text-white/70">
              <span>💧 {item.main.humidity}%</span>
              <span>💨 {Math.round(item.wind.speed * 3.6)}km/h</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-white/60 text-sm">
          Forecast updates every 3 hours • Based on OpenWeather data
        </p>
      </div>
    </motion.div>
  );
};

export default ForecastChart; 
