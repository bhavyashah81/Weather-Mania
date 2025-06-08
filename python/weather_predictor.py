import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from datetime import datetime, timedelta
import json

app = Flask(__name__)
CORS(app)

class WeatherPredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def create_features(self, weather_data):
        """Create features from weather data for ML model"""
        features = []
        
        # Extract temporal features
        dt = datetime.now()
        features.extend([
            dt.hour,
            dt.day,
            dt.month,
            dt.weekday()
        ])
        
        # Extract weather features
        if 'main' in weather_data:
            features.extend([
                weather_data['main'].get('temp', 0),
                weather_data['main'].get('humidity', 0),
                weather_data['main'].get('pressure', 0),
                weather_data['main'].get('feels_like', 0)
            ])
        
        if 'wind' in weather_data:
            features.extend([
                weather_data['wind'].get('speed', 0),
                weather_data['wind'].get('deg', 0)
            ])
        
        if 'clouds' in weather_data:
            features.append(weather_data['clouds'].get('all', 0))
        
        # Add visibility
        features.append(weather_data.get('visibility', 10000))
        
        return np.array(features).reshape(1, -1)
    
    def generate_synthetic_data(self):
        """Generate synthetic weather data for training"""
        np.random.seed(42)
        n_samples = 1000
        
        # Generate synthetic features
        hours = np.random.randint(0, 24, n_samples)
        days = np.random.randint(1, 32, n_samples)
        months = np.random.randint(1, 13, n_samples)
        weekdays = np.random.randint(0, 7, n_samples)
        temps = np.random.normal(20, 10, n_samples)
        humidity = np.random.randint(30, 100, n_samples)
        pressure = np.random.normal(1013, 20, n_samples)
        feels_like = temps + np.random.normal(0, 2, n_samples)
        wind_speed = np.random.exponential(3, n_samples)
        wind_deg = np.random.randint(0, 360, n_samples)
        clouds = np.random.randint(0, 101, n_samples)
        visibility = np.random.normal(10000, 2000, n_samples)
        
        X = np.column_stack([
            hours, days, months, weekdays, temps, humidity, 
            pressure, feels_like, wind_speed, wind_deg, clouds, visibility
        ])
        
        # Generate target (future temperature)
        # Simple model: future temp depends on current temp, time trends, and seasonal patterns
        seasonal_effect = 5 * np.sin(2 * np.pi * months / 12)
        daily_effect = 3 * np.sin(2 * np.pi * hours / 24)
        y = temps + seasonal_effect + daily_effect + np.random.normal(0, 2, n_samples)
        
        return X, y
    
    def train_model(self):
        """Train the prediction model with synthetic data"""
        try:
            X, y = self.generate_synthetic_data()
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model.fit(X_train_scaled, y_train)
            
            # Calculate accuracy
            train_score = self.model.score(X_train_scaled, y_train)
            test_score = self.model.score(X_test_scaled, y_test)
            
            self.is_trained = True
            
            print(f"✅ Model trained successfully!")
            print(f"📊 Train Score: {train_score:.3f}")
            print(f"📊 Test Score: {test_score:.3f}")
            
            return True
        except Exception as e:
            print(f"❌ Error training model: {e}")
            return False
    
    def predict_weather(self, current_weather, hours_ahead=24):
        """Predict weather for specified hours ahead"""
        if not self.is_trained:
            if not self.train_model():
                return None
        
        try:
            features = self.create_features(current_weather)
            features_scaled = self.scaler.transform(features)
            
            # Predict future temperature
            predicted_temp = self.model.predict(features_scaled)[0]
            
            # Add some uncertainty bounds
            uncertainty = 2.0  # ±2°C uncertainty
            
            prediction = {
                'predicted_temperature': round(predicted_temp, 1),
                'confidence_min': round(predicted_temp - uncertainty, 1),
                'confidence_max': round(predicted_temp + uncertainty, 1),
                'hours_ahead': hours_ahead,
                'prediction_time': datetime.now().isoformat(),
                'model_confidence': 'medium'  # Could be calculated based on model uncertainty
            }
            
            return prediction
        except Exception as e:
            print(f"❌ Error making prediction: {e}")
            return None

# Initialize predictor
predictor = WeatherPredictor()

@app.route('/api/predict', methods=['POST'])
def predict_weather():
    """Endpoint for weather predictions"""
    try:
        data = request.get_json()
        
        if not data or 'weather_data' not in data:
            return jsonify({'error': 'weather_data is required'}), 400
        
        hours_ahead = data.get('hours_ahead', 24)
        weather_data = data['weather_data']
        
        prediction = predictor.predict_weather(weather_data, hours_ahead)
        
        if prediction is None:
            return jsonify({'error': 'Failed to generate prediction'}), 500
        
        return jsonify(prediction)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/model/retrain', methods=['POST'])
def retrain_model():
    """Endpoint to retrain the model"""
    try:
        success = predictor.train_model()
        if success:
            return jsonify({'message': 'Model retrained successfully'})
        else:
            return jsonify({'error': 'Failed to retrain model'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/model/status', methods=['GET'])
def model_status():
    """Get model status"""
    return jsonify({
        'is_trained': predictor.is_trained,
        'model_type': 'RandomForestRegressor',
        'features': 12,
        'last_updated': datetime.now().isoformat()
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'service': 'Weather Prediction Service',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🤖 Starting Weather Prediction Service...")
    predictor.train_model()  # Train on startup
    app.run(debug=True, port=5001, host='0.0.0.0') 
