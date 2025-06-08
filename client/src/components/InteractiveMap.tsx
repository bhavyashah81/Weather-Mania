import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  lat: number;
  lon: number;
  weatherData: {
    name: string;
    main: {
      temp: number;
    };
    weather: Array<{
      description: string;
    }>;
  };
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ lat, lon, weatherData }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([lat, lon], 10);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add weather tile layer (OpenWeatherMap)
    const weatherLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=demo_key`,
      {
        attribution: '© OpenWeatherMap',
        opacity: 0.6
      }
    );
    weatherLayer.addTo(map);

    // Custom marker icon
    const customIcon = L.divIcon({
      html: `
        <div style="
          background: rgba(59, 130, 246, 0.9);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">
          ${Math.round(weatherData.main.temp)}°
        </div>
      `,
      className: 'custom-weather-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Add marker with popup
    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
    
    marker.bindPopup(`
      <div style="text-align: center; padding: 10px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937;">${weatherData.name}</h3>
        <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: bold; color: #3b82f6;">
          ${Math.round(weatherData.main.temp)}°C
        </p>
        <p style="margin: 0; color: #6b7280; text-transform: capitalize;">
          ${weatherData.weather[0].description}
        </p>
      </div>
    `);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 10);
      
      // Clear existing markers
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstanceRef.current!.removeLayer(layer);
        }
      });

      // Add new marker
      const customIcon = L.divIcon({
        html: `
          <div style="
            background: rgba(59, 130, 246, 0.9);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          ">
            ${Math.round(weatherData.main.temp)}°
          </div>
        `,
        className: 'custom-weather-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(mapInstanceRef.current);
      
      marker.bindPopup(`
        <div style="text-align: center; padding: 10px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937;">${weatherData.name}</h3>
          <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: bold; color: #3b82f6;">
            ${Math.round(weatherData.main.temp)}°C
          </p>
          <p style="margin: 0; color: #6b7280; text-transform: capitalize;">
            ${weatherData.weather[0].description}
          </p>
        </div>
      `);
    }
  }, [lat, lon, weatherData]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="weather-card max-w-4xl mx-auto"
    >
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-white text-center">
          Interactive Weather Map 🗺️
        </h3>
        <p className="text-white/70 text-center mt-2">
          Explore weather conditions with temperature overlay
        </p>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-2xl overflow-hidden shadow-xl border border-white/20"
        style={{ minHeight: '400px' }}
      />
      
      <div className="mt-4 text-center">
        <p className="text-white/70 text-sm">
          Blue overlay shows temperature patterns • Click marker for details
        </p>
      </div>
    </motion.div>
  );
};

export default InteractiveMap; 
