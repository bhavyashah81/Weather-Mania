# Weather-Mania Setup Guide 🌤️

A comprehensive weather application with real-time data, interactive maps, and beautiful UI.

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Python 3.7+ (for ML predictions - optional)

### 1. Install Dependencies

```bash
# Install all dependencies (client, server, and root)
npm run install-all

# Or install manually:
npm install                    # Root dependencies
cd server && npm install      # Server dependencies  
cd ../client && npm install   # Client dependencies
```

### 2. API Key Setup

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Create `server/.env` file:
```env
OPENWEATHER_API_KEY=your_api_key_here
PORT=8000
NODE_ENV=development
```

3. Create `client/.env` file:
```env
REACT_APP_API_URL=http://localhost:8000
```

### 3. Run the Application

```bash
# Start both client and server
npm run dev

# Or start individually:
npm run server    # Starts backend on port 8000
npm run client    # Starts frontend on port 3000
```

### 4. Access the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Health Check**: http://localhost:8000/api/health

## Features

✅ **Real-time Weather Data**
- Current weather conditions
- 5-day forecast with charts
- Location-based weather

✅ **Interactive Maps**
- Temperature overlay maps
- Custom weather markers
- Click for detailed info

✅ **Air Quality Monitoring**
- AQI (Air Quality Index)
- Pollutant breakdown
- Health recommendations

✅ **Beautiful UI/UX**
- Glassmorphism design
- Smooth animations
- Responsive layout
- Dark/light themes

✅ **Advanced Features**
- Geolocation support
- Search by city
- Weather metrics dashboard
- PWA capabilities

## API Endpoints

- `GET /api/weather/current` - Current weather
- `GET /api/weather/forecast` - 5-day forecast
- `GET /api/weather/pollution` - Air quality data
- `GET /api/geocoding` - Location search
- `GET /api/health` - Health check

## Troubleshooting

### Common Issues

1. **"API key not found" error**
   - Make sure you have a valid OpenWeatherMap API key
   - Check that `.env` files are created with correct keys

2. **CORS errors**
   - Ensure server is running on port 8000
   - Check that client is configured to use correct API URL

3. **Map not loading**
   - Check internet connection
   - Verify Leaflet CSS is properly loaded

4. **Location not working**
   - Enable location permissions in browser
   - Use HTTPS for production (geolocation requires secure context)

### Development Tips

- Use browser dev tools to check network requests
- Check console for any JavaScript errors
- Verify API responses in Network tab
- Use React Developer Tools for debugging

## Production Deployment

1. Build the client:
```bash
cd client && npm run build
```

2. Set production environment variables
3. Use a process manager like PM2 for the server
4. Configure reverse proxy (nginx) if needed
5. Enable HTTPS for secure geolocation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning and development!

---

**Need help?** Check the GitHub issues or create a new one!
