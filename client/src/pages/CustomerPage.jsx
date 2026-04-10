import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import FormField from '../components/FormField';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { currency } from '../utils/format';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [alterations, setAlterations] = useState({ default: [], sweetness: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMods, setSelectedMods] = useState([]);
  const [selectedSweetness, setSelectedSweetness] = useState('100% Sugar');
  const { addItem, items } = useCart();

  useEffect(() => {
    api.getMenuItems().then(setMenuItems);
    api.getAlterations().then(setAlterations);
  }, []);

  const runningTotal = useMemo(() => {
    if (!selectedItem) return 0;
    return selectedItem.price + selectedMods.reduce((sum, mod) => sum + mod.price, 0);
  }, [selectedItem, selectedMods]);

  const toggleMod = (mod) => {
    setSelectedMods((prev) => prev.some((entry) => entry.name === mod.name)
      ? prev.filter((entry) => entry.name !== mod.name)
      : [...prev, mod]);
  };

  const addToOrder = () => {
    if (!selectedItem) return;
    const mods = [...selectedMods, { name: selectedSweetness, price: 0 }];
    addItem({
      name: selectedItem.name,
      basePrice: selectedItem.price,
      modifications: mods,
      totalPrice: selectedItem.price + mods.reduce((sum, mod) => sum + mod.price, 0),
    });
    setSelectedMods([]);
    setSelectedSweetness('100% Sugar');
  };

  return (
    <PageShell
      title="Boba Shop"
      subtitle="Place your order"
      actions={<Link className="primary-button inline" to="/customer/checkout">Checkout ({items.length})</Link>}
    >
      <div className="split-layout">
        <div className="card">
          <h2>Menu Items</h2>
          <div className="menu-grid">
            {menuItems.map((item) => (
              <button key={item.id} className={`menu-item ${selectedItem?.id === item.id ? 'selected' : ''}`} onClick={() => setSelectedItem(item)}>
                {/* <span>{item.name}</span>
                <strong>{currency(item.price)}</strong> */}

                {/* set images */}
                <div className="menu-item-content">
                    <img 
                        src={item.image} 
                        alt={item.name} 
                        className="menu-item-image"
                    />

                    <span>{item.name}</span>
                    <strong>{currency(item.price)}</strong>
                </div>
              </button>
            ))}
          </div>
        </div>
{/* TODO: make this a separate page?? */}
        <div className="card"> 
          <h2>Customize Drink</h2>
          {!selectedItem ? <p className="subtle">Select a menu item to add modifications.</p> : (
            <>
              <p><strong>{selectedItem.name}</strong> · {currency(selectedItem.price)}</p>
              <div className="checkbox-list">
                {alterations.default.map((mod) => (
                  <label key={mod.name} className="checkbox-row">
                    <input type="checkbox" checked={selectedMods.some((entry) => entry.name === mod.name)} onChange={() => toggleMod(mod)} />
                    <span>{mod.name}</span>
                    <span>{currency(mod.price)}</span>
                  </label>
                ))}
              </div>
              <FormField label="Sweetness">
                <select value={selectedSweetness} onChange={(e) => setSelectedSweetness(e.target.value)}>
                  {alterations.sweetness.map((option) => (
                    <option key={option.name} value={option.name}>{option.name}</option>
                  ))}
                </select>
              </FormField>
              <div className="inline-actions">
                <span className="pill">Current total: {currency(runningTotal)}</span>
                <button className="primary-button inline" onClick={addToOrder}>Add to order</button>
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}