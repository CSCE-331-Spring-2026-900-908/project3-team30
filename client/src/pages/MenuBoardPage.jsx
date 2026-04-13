import { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/app.css';

export default function MenuBoardPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [drinks, toppings] = await Promise.all([
          api.getMenuDrinks(),
          api.getMenuToppings()
        ]);
        setMenuItems(drinks);
        setInventory(toppings);
      } catch (error) {
        console.error('Failed to load menu data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Group menu items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
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
                <div key={item.name} className="menu-board-row">
                  <span className="menu-board-item-name">{item.name}</span>
                  <span className="menu-board-dots"></span>
                  <span className="menu-board-price">${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="menu-board-right">
        <div className="menu-board-weather">
          <p className="weather-placeholder">Weather Widget</p>
          <p className="subtle">Coming soon...</p>
        </div>

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