const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Cache for 10 minutes
const cache = new NodeCache({ stdTTL: 600 });

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:8000"],
      fontSrc: ["'self'", "https:"],
    },
  },
}));
app.use(compression());
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Weather API configuration
// You can get a free API key from: https://openweathermap.org/api
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '6d055e39ee237af35ca066f35474e9df';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Helper function to get cache key
const getCacheKey = (endpoint, params) => {
  return `${endpoint}_${JSON.stringify(params)}`;
};

// Current weather endpoint
app.get('/api/weather/current', async (req, res) => {
  try {
    const { lat, lon, q } = req.query;
    const cacheKey = getCacheKey('current', { lat, lon, q });
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    let url = `${OPENWEATHER_BASE_URL}/weather?appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else if (q) {
      url += `&q=${q}`;
    } else {
      return res.status(400).json({ error: 'Either coordinates (lat, lon) or city name (q) is required' });
    }

    const response = await axios.get(url);
    const data = response.data;
    
    // Cache the response
    cache.set(cacheKey, data);
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching current weather:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Weather forecast endpoint
app.get('/api/weather/forecast', async (req, res) => {
  try {
    const { lat, lon, q } = req.query;
    const cacheKey = getCacheKey('forecast', { lat, lon, q });
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    let url = `${OPENWEATHER_BASE_URL}/forecast?appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else if (q) {
      url += `&q=${q}`;
    } else {
      return res.status(400).json({ error: 'Either coordinates (lat, lon) or city name (q) is required' });
    }

    const response = await axios.get(url);
    const data = response.data;
    
    // Cache the response
    cache.set(cacheKey, data);
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching weather forecast:', error.message);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// Geocoding endpoint
app.get('/api/geocoding', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const cacheKey = getCacheKey('geocoding', { q });
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=5&appid=${OPENWEATHER_API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;
    
    // Cache the response
    cache.set(cacheKey, data);
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching geocoding data:', error.message);
    res.status(500).json({ error: 'Failed to fetch geocoding data' });
  }
});

// Air pollution endpoint
app.get('/api/weather/pollution', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const cacheKey = getCacheKey('pollution', { lat, lon });
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const url = `${OPENWEATHER_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;
    
    // Cache the response
    cache.set(cacheKey, data);
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching air pollution data:', error.message);
    res.status(500).json({ error: 'Failed to fetch air pollution data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Cache stats endpoint
app.get('/api/cache/stats', (req, res) => {
  const stats = cache.getStats();
  res.json(stats);
});

app.listen(port, () => {
  console.log(`🌤️  Weather API server running on port ${port}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 Open your browser and go to: http://localhost:${port}`);
  
  // Auto-open browser (optional)
  const open = (url) => {
    const start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
    require('child_process').exec(start + ' ' + url);
  };
  
  // Auto-open browser
  setTimeout(() => {
    open(`http://localhost:${port}`);
  }, 1000); // Wait 1 second for server to fully start
}); 
