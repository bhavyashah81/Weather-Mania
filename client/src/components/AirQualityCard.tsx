import React from 'react';
import { motion } from 'framer-motion';
import { Wind, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface AirQualityCardProps {
  airQuality: {
    list: Array<{
      main: {
        aqi: number; // Air Quality Index: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
      };
      components: {
        co: number;      // Carbon monoxide
        no: number;      // Nitrogen monoxide
        no2: number;     // Nitrogen dioxide
        o3: number;      // Ozone
        so2: number;     // Sulphur dioxide
        pm2_5: number;   // Fine particles matter
        pm10: number;    // Coarse particulate matter
        nh3: number;     // Ammonia
      };
    }>;
  };
}

const AirQualityCard: React.FC<AirQualityCardProps> = ({ airQuality }) => {
  if (!airQuality || !airQuality.list || airQuality.list.length === 0) {
    return null;
  }

  const data = airQuality.list[0];
  const aqi = data.main.aqi;
  const components = data.components;

  // AQI levels and their descriptions
  const aqiLevels = {
    1: { 
      label: 'Good', 
      color: 'text-green-400', 
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400/30',
      icon: <CheckCircle className="w-6 h-6 text-green-400" />,
      description: 'Air quality is satisfactory and poses little or no risk.',
      recommendation: 'Great day for outdoor activities!'
    },
    2: { 
      label: 'Fair', 
      color: 'text-yellow-400', 
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-400/30',
      icon: <Info className="w-6 h-6 text-yellow-400" />,
      description: 'Air quality is acceptable for most people.',
      recommendation: 'Sensitive individuals should consider limiting outdoor activities.'
    },
    3: { 
      label: 'Moderate', 
      color: 'text-orange-400', 
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-400/30',
      icon: <AlertTriangle className="w-6 h-6 text-orange-400" />,
      description: 'Members of sensitive groups may experience health effects.',
      recommendation: 'Reduce prolonged outdoor exertion if you experience symptoms.'
    },
    4: { 
      label: 'Poor', 
      color: 'text-red-400', 
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-400/30',
      icon: <XCircle className="w-6 h-6 text-red-400" />,
      description: 'Health effects may be experienced by everyone.',
      recommendation: 'Limit outdoor activities and close windows.'
    },
    5: { 
      label: 'Very Poor', 
      color: 'text-purple-400', 
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-400/30',
      icon: <XCircle className="w-6 h-6 text-purple-400" />,
      description: 'Health alert: everyone may experience serious health effects.',
      recommendation: 'Avoid outdoor activities and keep windows closed.'
    }
  };

  const currentLevel = aqiLevels[aqi as keyof typeof aqiLevels] || aqiLevels[3];

  // Pollutant data with thresholds
  const pollutants = [
    { 
      name: 'PM2.5', 
      value: components.pm2_5, 
      unit: 'μg/m³',
      description: 'Fine particles',
      goodThreshold: 15,
      moderateThreshold: 35
    },
    { 
      name: 'PM10', 
      value: components.pm10, 
      unit: 'μg/m³',
      description: 'Coarse particles',
      goodThreshold: 50,
      moderateThreshold: 100
    },
    { 
      name: 'O₃', 
      value: components.o3, 
      unit: 'μg/m³',
      description: 'Ozone',
      goodThreshold: 100,
      moderateThreshold: 180
    },
    { 
      name: 'NO₂', 
      value: components.no2, 
      unit: 'μg/m³',
      description: 'Nitrogen dioxide',
      goodThreshold: 40,
      moderateThreshold: 80
    }
  ];

  const getPollutantColor = (value: number, good: number, moderate: number) => {
    if (value <= good) return 'text-green-400';
    if (value <= moderate) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPollutantLevel = (value: number, good: number, moderate: number) => {
    if (value <= good) return 'Good';
    if (value <= moderate) return 'Moderate';
    return 'Poor';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="weather-card max-w-4xl mx-auto"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Wind className="w-7 h-7" />
          Air Quality Index
        </h3>
        <p className="text-white/70">Current air pollution levels</p>
      </div>

      {/* AQI Main Display */}
      <div className={`${currentLevel.bgColor} ${currentLevel.borderColor} border rounded-2xl p-6 mb-6`}>
        <div className="flex items-center justify-center gap-4 mb-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {currentLevel.icon}
          </motion.div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${currentLevel.color} mb-1`}>
              {aqi}
            </div>
            <div className={`text-lg font-semibold ${currentLevel.color}`}>
              {currentLevel.label}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-white mb-3">{currentLevel.description}</p>
          <p className="text-white/80 text-sm italic">{currentLevel.recommendation}</p>
        </div>
      </div>

      {/* Pollutant Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pollutants.map((pollutant, index) => (
          <motion.div
            key={pollutant.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect p-4 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="mb-2">
              <div className="text-white/80 text-sm font-medium mb-1">
                {pollutant.name}
              </div>
              <div className={`text-lg font-bold ${getPollutantColor(pollutant.value, pollutant.goodThreshold, pollutant.moderateThreshold)}`}>
                {pollutant.value.toFixed(1)}
              </div>
              <div className="text-white/60 text-xs">
                {pollutant.unit}
              </div>
            </div>
            
            <div className={`text-xs px-2 py-1 rounded-full ${
              getPollutantLevel(pollutant.value, pollutant.goodThreshold, pollutant.moderateThreshold) === 'Good' 
                ? 'bg-green-500/20 text-green-400' 
                : getPollutantLevel(pollutant.value, pollutant.goodThreshold, pollutant.moderateThreshold) === 'Moderate'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {getPollutantLevel(pollutant.value, pollutant.goodThreshold, pollutant.moderateThreshold)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-center">
        <p className="text-white/60 text-sm">
          Data from WHO Air Quality Guidelines • Updated in real-time
        </p>
      </div>
    </motion.div>
  );
};

export default AirQualityCard; 
