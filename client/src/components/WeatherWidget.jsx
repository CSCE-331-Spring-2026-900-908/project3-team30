import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function WeatherWidget({ latitude, longitude, locationName }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    async function loadWeather() {
      try {
        const weatherData = await api.getWeather(latitude, longitude);
        setWeather(weatherData);
      } catch (error) {
        console.error('Failed to load weather data:', error);
      }
    }
    loadWeather();
  }, [latitude, longitude]);

  // Map weather codes to icon paths and descriptions
  const getWeatherInfo = (code) => {
    // WMO Weather interpretation codes
    // https://open-meteo.com/en/docs
    if (code === 0) return { icon: '/images/sunny.png', description: 'Clear' };
    if (code <= 2) return { icon: '/images/partly-cloudy.png', description: 'Partly Cloudy' };
    if (code === 3) return { icon: '/images/cloudy.png', description: 'Cloudy'};
    if (code <= 48) return { icon: '/images/fog.png', description: 'Foggy' };
    if (code <= 67) return { icon: '/images/rain.png', description: 'Rainy' };
    if (code <= 77) return { icon: '/images/snow.png', description: 'Snowy' };
    if (code <= 82) return { icon: '/images/rain.png', description: 'Showers' };
    if (code <= 86) return { icon: '/images/snow.png', description: 'Snow Showers' };
    if (code <= 99) return { icon: '/images/storm.png', description: 'Thunderstorm' };
    return { icon: '/images/unknown.png', description: 'Unknown' };
  };

  return (
    <div className="menu-board-weather">
      {weather ? (
        <>
          <div className="weather-icon-container">
            <img 
              src={getWeatherInfo(weather.current.weather_code).icon} 
              alt="weather icon" 
              className="weather-icon"
            />
          </div>
          <div className="weather-info">
            <p className="weather-temp">{Math.round(weather.current.temperature_2m)}°F</p>
            <p className="weather-condition">{getWeatherInfo(weather.current.weather_code).description}</p>
            <p className="weather-location">{locationName}</p>
          </div>
        </>
      ) : (
        <p className="subtle">Loading weather...</p>
      )}
    </div>
  );
}