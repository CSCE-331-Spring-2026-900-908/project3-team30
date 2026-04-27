import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { currency } from '../utils/format';

function applyDiscount(basePrice, percentOff) {
  if (!percentOff) return basePrice;
  return Math.round(basePrice * (1 - percentOff) * 100) / 100;
}

export default function CustomizePage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCart();

  const activeHappyHour = location.state?.activeHappyHour ?? null;

  const [item, setItem] = useState(location.state?.item ?? null);
  const [alterations, setAlterations] = useState({ default: [], sweetness: [] });
  const [mods, setMods] = useState([]);
  const [sweetness, setSweetness] = useState("100% Sugar");

  useEffect(() => {
    if (!item) {
      api.getMenuItems().then((items) => {
        const found = items.find(i => i.name === decodeURIComponent(name));
        setItem(found);
      });
    }
    api.getAlterations().then(setAlterations);
  }, [name]);

  const toggleMod = (mod) => {
    setMods(prev =>
      prev.some(m => m.name === mod.name)
        ? prev.filter(m => m.name !== mod.name)
        : [...prev, mod]
    );
  };

  const discountedBase = item ? applyDiscount(item.price, activeHappyHour?.percentOff) : 0;

  const addToCart = () => {
    const allMods = [...mods, { name: sweetness, price: 0 }];

    addItem({
      name: item.name,
      basePrice: discountedBase,
      modifications: allMods,
      totalPrice: discountedBase + allMods.reduce((s, m) => s + m.price, 0)
    });

    navigate("/customer");
  };

  if (!item) return <p>Loading...</p>;

  const allMods = [...mods, { name: sweetness, price: 0 }];
  const runningTotal = discountedBase + allMods.reduce((s, m) => s + m.price, 0);

  return (
    <div className="card" aria-labelledby="customize-title">
      <h2 id="customize-title">{item.name}</h2>

      {/* Price — only change from original */}
      {activeHappyHour ? (
        <p>
          <strong style={{ color: '#d36a6a' }}>{currency(discountedBase)}</strong>
          <span style={{ textDecoration: 'line-through', color: '#9b7880', marginLeft: '0.5rem', fontSize: '0.9rem' }}>
            {currency(item.price)}
          </span>
          <span className="pill" style={{ marginLeft: '0.5rem', fontSize: '0.78rem' }}>
            {Math.round(activeHappyHour.percentOff * 100)}% off
          </span>
        </p>
      ) : (
        <p>{currency(item.price)}</p>
      )}

      {alterations.default.map(mod => (
        <label key={mod.name}>
          <input
            type="checkbox"
            onChange={() => toggleMod(mod)}
            aria-label={`${mod.name} topping. Adds ${currency(mod.price)}`}
          />
          {mod.name} (+{currency(mod.price)})
        </label>
      ))}

      <select aria-label="Select sweetness level" value={sweetness} onChange={e => setSweetness(e.target.value)}>
        {alterations.sweetness.map(opt => (
          <option key={opt.name}>{opt.name}</option>
        ))}
      </select>

      {/* Total — only change from original */}
      <p role="status" aria-live="polite">Total: {currency(runningTotal)}</p>

      <button type="button" className="primary-button inline" onClick={addToCart} aria-label={`Add ${item.name} to cart. Total ${currency(runningTotal)}`}>Add to Cart</button>
      <button type="button" className="primary-button inline" onClick={() => navigate("/customer")} aria-label="Cancel customization and return to customer menu">Cancel</button>
    </div>
  );
}