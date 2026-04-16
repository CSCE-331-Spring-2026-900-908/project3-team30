import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import FormField from '../components/FormField';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { currency } from '../utils/format';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [alterations, setAlterations] = useState({ default: [], sweetness: [], ice: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMods, setSelectedMods] = useState([]);
  const [selectedSweetness, setSelectedSweetness] = useState(null);
  const [selectedIce, setSelectedIce] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const { addItem, items } = useCart();

  // useEffect(() => {
  //   api.getMenuItems().then(setMenuItems);
  //   api.getAlterations().then(setAlterations);
  // }, []);
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const menuData = await api.getMenuItems();
        const alterationData = await api.getAlterations();

        console.log('menuData:', menuData);
        console.log('alterationData:', alterationData);

        setMenuItems(menuData);
        setAlterations(alterationData);
        setSelectedSweetness(alterationData.sweetness?.[0] ?? null);
        setSelectedIce(alterationData.ice?.[0] ?? null);
      } catch (err) {
        console.error('Failed to load menu page data:', err);
        setError(err.message || 'Failed to load menu data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const runningTotal = useMemo(() => {
    if (!selectedItem) return 0;

    return (
      selectedItem.price +
      selectedMods.reduce((sum, mod) => sum + mod.price, 0) +
      (selectedSweetness?.price ?? 0) +
      (selectedIce?.price ?? 0)
    );
  }, [selectedItem, selectedMods, selectedSweetness, selectedIce]);

  const toggleMod = (mod) => {
    setSelectedMods((prev) =>
      prev.some((entry) => entry.name === mod.name)
        ? prev.filter((entry) => entry.name !== mod.name)
        : [...prev, mod]
    );
  };

  const addToOrder = () => {
    if (!selectedItem) return;

    const mods = [
      ...selectedMods,
      ...(selectedSweetness ? [selectedSweetness] : []),
      ...(selectedIce ? [selectedIce] : []),
    ];

    addItem({
      name: selectedItem.name,
      basePrice: selectedItem.price,
      image: selectedItem.image,
      modifications: mods,
      image: selectedItem.image,
      totalPrice: selectedItem.price + mods.reduce((sum, mod) => sum + mod.price, 0),
    });

    setSelectedMods([]);
    setSelectedSweetness(alterations.sweetness?.[0] ?? null);
    setSelectedIce(alterations.ice?.[0] ?? null);
  };

  return (
    <PageShell
      title="Menu"
      subtitle="Cashier ordering menu"
      actions={
        <Link className="primary-button inline" to="/cashier/checkout">
          Checkout ({items.length})
        </Link>
      }
    >
      {loading && <p>Loading menu...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="split-layout">
          <div className="card">
            <h2>Menu Items</h2>
            <div className="menu-grid">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  className={`menu-item ${selectedItem?.name === item.name ? 'selected' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <span>{item.name}</span>
                  <strong>{currency(item.price)}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>Customize Drink</h2>
            {!selectedItem ? (
              <p className="subtle">Select a menu item to add modifications.</p>
            ) : (
              <>
                <p>
                  <strong>{selectedItem.name}</strong> · {currency(selectedItem.price)}
                </p>

                <div className="checkbox-list">
                  {alterations.default.map((mod) => (
                    <label key={mod.name} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={selectedMods.some((entry) => entry.name === mod.name)}
                        onChange={() => toggleMod(mod)}
                      />
                      <span>{mod.name}</span>
                      <span>{currency(mod.price)}</span>
                    </label>
                  ))}
                </div>

                <FormField label="Sweetness">
                  <select
                    value={selectedSweetness?.name ?? ''}
                    onChange={(e) =>
                      setSelectedSweetness(
                        alterations.sweetness.find((option) => option.name === e.target.value) ?? null
                      )
                    }
                  >
                    {alterations.sweetness.map((option) => (
                      <option key={option.name} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Ice">
                  <select
                    value={selectedIce?.name ?? ''}
                    onChange={(e) =>
                      setSelectedIce(
                        alterations.ice.find((option) => option.name === e.target.value) ?? null
                      )
                    }
                  >
                    {alterations.ice.map((option) => (
                      <option key={option.name} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <div className="inline-actions">
                  <span className="pill">Current total: {currency(runningTotal)}</span>
                  <button className="primary-button inline" onClick={addToOrder}>
                    Add to order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}