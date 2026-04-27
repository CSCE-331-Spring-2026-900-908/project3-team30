import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function MenuItemShowcase() {
  const [menuItem, setMenuItem] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);

  const fetchRandomItem = async () => {
    try {
      setFadeOut(true);
      // Wait for fade out animation
      setTimeout(async () => {
        const item = await api.getRandomMenuItem();
        setMenuItem(item);
        setFadeOut(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load random menu item:', error);
    }
  };

  useEffect(() => {
    // Load initial item
    fetchRandomItem();

    // Set up interval to change item every 30 seconds
    const interval = setInterval(() => {
      fetchRandomItem();
    }, 15000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  if (!menuItem) {
    return (
      <div className="menu-item-showcase">
        <p className="subtle">Loading...</p>
      </div>
    );
  }

  return (
    <div className={`menu-item-showcase ${fadeOut ? 'fade-out' : 'fade-in'}`}>
      <img 
        src={menuItem.imageURL} 
        alt={menuItem.name}
        className="showcase-image"
      />
      <div className="showcase-overlay">
        <h3 className="showcase-item-name">{menuItem.name}</h3>
      </div>
    </div>
  );
}