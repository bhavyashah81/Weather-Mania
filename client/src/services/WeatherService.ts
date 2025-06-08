import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export class WeatherService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });
  }

  async getCurrentWeather(lat: number, lon: number) {
    try {
      const response = await this.api.get('/api/weather/current', {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  }

  async getCurrentWeatherByCity(city: string) {
    try {
      const response = await this.api.get('/api/weather/current', {
        params: { q: city }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weather by city:', error);
      throw error;
    }
  }

  async getForecast(lat: number, lon: number) {
    try {
      const response = await this.api.get('/api/weather/forecast', {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  }

  async getForecastByCity(city: string) {
    try {
      const response = await this.api.get('/api/weather/forecast', {
        params: { q: city }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast by city:', error);
      throw error;
    }
  }

  async getAirQuality(lat: number, lon: number) {
    try {
      const response = await this.api.get('/api/weather/pollution', {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching air quality:', error);
      throw error;
    }
  }

  async geocodeLocation(query: string) {
    try {
      const response = await this.api.get('/api/geocoding', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error geocoding location:', error);
      throw error;
    }
  }

  async getPrediction(weatherData: any, hoursAhead: number = 24) {
    try {
      const response = await axios.post('http://localhost:5001/api/predict', {
        weather_data: weatherData,
        hours_ahead: hoursAhead
      });
      return response.data;
    } catch (error) {
      console.error('Error getting weather prediction:', error);
      throw error;
    }
  }

  async getHealthCheck() {
    try {
      const response = await this.api.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  }
} 
