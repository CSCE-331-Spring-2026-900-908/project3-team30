import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { currency } from '../utils/format';

export default function CustomizePage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [item, setItem] = useState(null);
  const [alterations, setAlterations] = useState({ default: [], sweetness: [] });
  const [mods, setMods] = useState([]);
  const [sweetness, setSweetness] = useState("100% Sugar");

  useEffect(() => {
    api.getMenuItems().then((items) => {
      const found = items.find(i => i.name === decodeURIComponent(name));
      setItem(found);
    });

    api.getAlterations().then(setAlterations);
  }, [name]);

  const toggleMod = (mod) => {
    setMods(prev =>
      prev.some(m => m.name === mod.name)
        ? prev.filter(m => m.name !== mod.name)
        : [...prev, mod]
    );
  };

  const addToCart = () => {
    const allMods = [...mods, { name: sweetness, price: 0 }];

    addItem({
      name: item.name,
      basePrice: item.price,
      modifications: allMods,
      totalPrice: item.price + allMods.reduce((s, m) => s + m.price, 0)
    });

    navigate("/menu"); // go back
  };

  if (!item) return <p>Loading...</p>;

  return (
    <div className="card">
      <h2>{item.name}</h2>
      <p>{currency(item.price)}</p>

      {alterations.default.map(mod => (
        <label key={mod.name}>
          <input
            type="checkbox"
            onChange={() => toggleMod(mod)}
          />
          {mod.name} (+{currency(mod.price)})
        </label>
      ))}

      <select value={sweetness} onChange={e => setSweetness(e.target.value)}>
        {alterations.sweetness.map(opt => (
          <option key={opt.name}>{opt.name}</option>
        ))}
      </select>

      <button onClick={addToCart}>Add to Cart</button>
      <button onClick={() => navigate("/menu")}>Cancel</button>
    </div>
  );
}