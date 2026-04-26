import { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/app.css';
import WomanCard from '../components/WomanCard';

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
    <div className="menu-board-wrapper">
      <div className="menu-board-container">
        <div className="menu-board-left-center">
          <h1 className="menu-board-title">Menu</h1>
          
          <div className="menu-board-columns">
            <div className="menu-board-column menu-board-left">
              {Object.entries(groupedItems)
                .filter(([category]) => category !== 'seasonal')
                .map(([category, items]) => (
                  <div key={category} className="menu-board-section">
                    <h2 className="menu-board-category">{category}</h2>
                    <div className="menu-board-items">
                      {items.map(item => (
                        <div key={item.baseName || item.name} className="menu-board-row">
                          <span className="menu-board-item-name">{item.name}</span>
                          <span className="menu-board-dots"></span>
                          <span className="menu-board-price">
                            {item.smallPrice && item.largePrice ? (
                              <>S: ${item.smallPrice.toFixed(2)} | L: ${item.largePrice.toFixed(2)}</>
                            ) : item.smallPrice ? (
                              <>S: ${item.smallPrice.toFixed(2)}</>
                            ) : item.largePrice ? (
                              <>L: ${item.largePrice.toFixed(2)}</>
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

            <div className="menu-board-column menu-board-center">
              {Object.entries(groupedItems)
                .filter(([category]) => category === 'seasonal')
                .map(([category, items]) => (
                  <div key={category} className="menu-board-section">
                    <h2 className="menu-board-category">{category}</h2>
                    <div className="menu-board-items">
                      {items.map(item => (
                        <div key={item.baseName || item.name} className="menu-board-row">
                          <span className="menu-board-item-name">{item.name}</span>
                          <span className="menu-board-dots"></span>
                          <span className="menu-board-price">
                            {item.smallPrice && item.largePrice ? (
                              <>S: ${item.smallPrice.toFixed(2)} | L: ${item.largePrice.toFixed(2)}</>
                            ) : item.smallPrice ? (
                              <>S: ${item.smallPrice.toFixed(2)}</>
                            ) : item.largePrice ? (
                              <>L: ${item.largePrice.toFixed(2)}</>
                            ) : (
                              <>${item.price.toFixed(2)}</>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              
              <div className="menu-board-placeholder">
                <p>Happy Hour Placeholder</p>
              </div>

              <div className="menu-board-placeholder">
                <p>Image Placeholder</p>
              </div>
            </div>
          </div>
        </div>

        <div className="menu-board-column menu-board-right">
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

          <WomanCard />
        </div>
      </div>
    </div>
  );
}