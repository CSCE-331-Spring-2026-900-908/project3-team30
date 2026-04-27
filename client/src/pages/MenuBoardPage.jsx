import { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/app.css';
import WomanCard from '../components/WomanCard';
import MenuItemShowcase from '../components/MenuItemShowcase';

export default function MenuBoardPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextHappyHour, setNextHappyHour] = useState(null);
  const [countdown, setCountdown] = useState(null);

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

      try {
        const next = await api.getNextHappyHour();
        setNextHappyHour(next);
      } catch {
        // no next happy hour
      }
    }
    
    loadData();
  }, []);

  useEffect(() => {
    if (!nextHappyHour) return;
    const tick = () => setCountdown(getTimeToHappyHour(nextHappyHour));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextHappyHour]);

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

  function formatTime(localTime) {
    if (!localTime) return '';
    let h, m;
    if (Array.isArray(localTime)) { [h, m] = localTime; }
    else { [h, m] = localTime.split(':').map(Number); }
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    const minute = m > 0 ? `:${String(m).padStart(2, '0')}` : '';
    return `${hour}${minute} ${period}`;
  }

  function getTimeToHappyHour(hh) {
    if (!hh) return null;
    const now = new Date();
    const parseTime = (t) => {
      let h, m;
      if (Array.isArray(t)) { [h, m] = t; }
      else { [h, m] = t.split(':').map(Number); }
      return { h, m };
    };
    const { h: startH, m: startM } = parseTime(hh.startTime);
    const { h: endH, m: endM } = parseTime(hh.endTime);
    const start = new Date(); start.setHours(startH, startM, 0, 0);
    const end = new Date(); end.setHours(endH, endM, 0, 0);

    if (now >= start && now < end) {
      const mins = Math.floor((end - now) / 60000);
      return { type: 'active', hours: Math.floor(mins / 60), mins: mins % 60 };
    } else if (now < start) {
      const mins = Math.floor((start - now) / 60000);
      return { type: 'upcoming_today', hours: Math.floor(mins / 60), mins: mins % 60 };
    } else {
      return { type: 'next_day' };
    }
  }

  return (
    <div className="menu-board-wrapper">
      <div className="menu-board-container">
        <div className="menu-board-left-center">
          <h1 className="menu-board-title">Menu</h1>
          
          <div className="menu-board-columns">
            <div className="menu-board-column menu-board-left">
              {Object.entries(groupedItems)
                .filter(([category]) => category !== 'Seasonal')
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
                .filter(([category]) => category === 'Seasonal')
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
              

{countdown && (
  <div className="happy-hour-widget">
    <p className="hhw-header">
      {countdown.type === 'active' ? '✦ Happy Hour ✦' :
       countdown.type === 'upcoming_today' ? '✦ Happy Hour ✦' :
       '✦ next happy hour ✦'}
    </p>

    {countdown.type === 'active' && (
      <div className="hhw-main-row">
        <div className="hhw-cell">
          <p className="hhw-cell-label">remaining</p>
          <p className="hhw-cell-value">
            {countdown.hours > 0
              ? `${countdown.hours}h ${String(countdown.mins).padStart(2, '0')}m`
              : `${countdown.mins}m`}
          </p>
        </div>
        <div className="hhw-separator" />
        <div className="hhw-cell">
          <p className="hhw-cell-pill">{Math.round(nextHappyHour.percentOff * 100)}% off</p>
        </div>
        <div className="hhw-separator" />
        <div className="hhw-cell">
          <p className="hhw-cell-value-light">{formatTime(nextHappyHour.startTime)}</p>
          <p className="hhw-cell-value-light">{formatTime(nextHappyHour.endTime)}</p>
        </div>
      </div>
    )}

    {countdown.type === 'upcoming_today' && (
      <div className="hhw-main-row">
        <div className="hhw-cell">
          <p className="hhw-cell-label">starts in</p>
          <p className="hhw-cell-value">
            {countdown.hours > 0
              ? `${countdown.hours}h ${String(countdown.mins).padStart(2, '0')}m`
              : `${countdown.mins}m`}
          </p>
        </div>
        <div className="hhw-separator" />
        <div className="hhw-cell">
          <p className="hhw-cell-pill">{Math.round(nextHappyHour.percentOff * 100)}% off</p>
        </div>
        <div className="hhw-separator" />
        <div className="hhw-cell">
          <p className="hhw-cell-value-light">{formatTime(nextHappyHour.startTime)}</p>
          <p className="hhw-cell-value-light">{formatTime(nextHappyHour.endTime)}</p>
        </div>
      </div>
    )}

    {countdown.type === 'next_day' && (
      <div className="hhw-main-row">
        <div className="hhw-cell">
          <p className="hhw-cell-label">next day</p>
          <p className="hhw-cell-value">
            {nextHappyHour.day.charAt(0).toUpperCase() + nextHappyHour.day.slice(1)}
          </p>
        </div>
        <div className="hhw-separator" />
        <div className="hhw-cell">
          <p className="hhw-cell-pill">{Math.round(nextHappyHour.percentOff * 100)}% off</p>
        </div>
        <div className="hhw-separator" />
        <div className="hhw-cell">
          <p className="hhw-cell-value-light">{formatTime(nextHappyHour.startTime)}</p>
          <p className="hhw-cell-value-light">{formatTime(nextHappyHour.endTime)}</p>
        </div>
      </div>
    )}
  </div>
)}

              <MenuItemShowcase />
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