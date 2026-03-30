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
        const [items, inv] = await Promise.all([
          api.getMenuItems(),
          api.getInventory()
        ]);
        setMenuItems(items);
        setInventory(inv);
      } catch (error) {
        console.error('Failed to load menu data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Group menu items by category (excluding toppings)
  const groupedItems = menuItems
    .filter(item => item.category !== 'topping')
    .reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

  // Get toppings from inventory
  const toppings = inventory.filter(item => item.category === 'topping');

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
                <div key={item.id} className="menu-board-row">
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
              <div key={topping.sku} className="menu-board-row">
                <span className="menu-board-item-name">{topping.name}</span>
                <span className="menu-board-dots"></span>
                <span className="menu-board-price">${topping.retailPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}