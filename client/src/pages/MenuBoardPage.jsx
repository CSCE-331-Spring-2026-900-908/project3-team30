import { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/app.css';
import WomanCard from '../components/WomanCard';

export default function MenuBoardPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [drinks, toppings] = await Promise.all([
          api.getMenuDrinks(),
          api.getMenuToppings()
        ]);
        setMenuItems(drinks);
        setInventory(toppings);
        const weatherData = await api.getWeather(30.62, -96.34);
        setWeather(weatherData);
      } catch (error) {
        console.error('Failed to load menu data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  // Group menu items by category and combine sizes
const groupedItems = menuItems.reduce((acc, item) => {
  if (!acc[item.category]) {
    acc[item.category] = [];
  }
  
  // Check if item starts with "Small" or "Large"
  const startsWithSize = item.name.startsWith('Small ') || item.name.startsWith('Large ');
  
  if (startsWithSize) {
    const size = item.name.split(' ')[0]; // "Small" or "Large"
    const baseName = item.name.substring(size.length + 1); // Everything after "Small " or "Large "
    
    // Find if we already have this base item
    const existingItem = acc[item.category].find(i => i.baseName === baseName);
    
    if (existingItem) {
      // Add this size to existing item
      if (size === 'Small') {
        existingItem.smallPrice = item.price;
      } else {
        existingItem.largePrice = item.price;
      }
    } else {
      // Create new combined item
      const newItem = {
        baseName: baseName,
        name: baseName,
        smallPrice: size === 'Small' ? item.price : null,
        largePrice: size === 'Large' ? item.price : null
      };
      acc[item.category].push(newItem);
    }
  } else {
    // Item doesn't have size prefix, add as-is
    acc[item.category].push({
      baseName: item.name,
      name: item.name,
      price: item.price
    });
  }
  
  return acc;
}, {});

  // Toppings are already filtered from the backend
  const toppings = inventory;

  if (loading) {
    return (
      <div className="centered-page">
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="menu-board-container">
      <div className="menu-board-left">
        <h1 className="menu-board-title">Menu</h1>
        
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="menu-board-section">
            <h2 className="menu-board-category">{category}</h2>
            <div className="menu-board-items">
              {items.map(item => (
                <div key={item.baseName || item.name} className="menu-board-row">
                  <span className="menu-board-item-name">{item.name}</span>
                  <span className="menu-board-dots"></span>
                  <span className="menu-board-price">
                    {item.smallPrice && item.largePrice ? (
                      <>Small: ${item.smallPrice.toFixed(2)} | Large: ${item.largePrice.toFixed(2)}</>
                    ) : item.smallPrice ? (
                      <>Small: ${item.smallPrice.toFixed(2)}</>
                    ) : item.largePrice ? (
                      <>Large: ${item.largePrice.toFixed(2)}</>
                    ) : (
                      <>${item.price.toFixed(2)}</>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="menu-board-right">
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
                <p className="weather-location">College Station, TX</p>
              </div>
            </>
          ) : (
            <p className="subtle">Loading weather...</p>
          )}
        </div>
        <WomanCard></WomanCard>

        <div className="menu-board-toppings">
          <h2 className="menu-board-category">Toppings</h2>
          <div className="menu-board-items">
            {toppings.map(topping => (
              <div key={topping.name} className="menu-board-row">
                <span className="menu-board-item-name">{topping.name}</span>
                <span className="menu-board-dots"></span>
                <span className="menu-board-price">${topping.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}