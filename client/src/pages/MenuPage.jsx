import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { currency } from '../utils/format';

/** Returns the discounted price given a base price and a percentOff decimal (e.g. 0.25) */
function applyDiscount(basePrice, percentOff) {
  if (!percentOff) return basePrice;
  return Math.round(basePrice * (1 - percentOff) * 100) / 100;
}

function formatTime(localTime) {
  if (!localTime) return '';
  let h, m;
  if (Array.isArray(localTime)) {
    [h, m] = localTime;
  } else {
    [h, m] = localTime.split(':').map(Number);
  }
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  const minute = m > 0 ? `:${String(m).padStart(2, '0')}` : '';
  return `${hour}${minute} ${period}`;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [alterations, setAlterations] = useState({ default: [], sweetness: [], ice: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMods, setSelectedMods] = useState([]);
  const [selectedSweetness, setSelectedSweetness] = useState(null);
  const [selectedIce, setSelectedIce] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const [activeHappyHour, setActiveHappyHour] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const pollRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const [menuData, alterationData, happyHourData] = await Promise.all([
          api.getMenuItems(),
          api.getAlterations(),
          api.getActiveHappyHour().catch(() => null), // ← won't crash if endpoint missing

        ]);

        setMenuItems(menuData);
        if (selectedItem) {
        const refreshedSelected = menuData.find((item) => item.name === selectedItem.name);
        if (!refreshedSelected || refreshedSelected.available === false) {
          setSelectedItem(null);
        } else {
          setSelectedItem(refreshedSelected);
        }
      }
        setAlterations(alterationData);
        setSelectedSweetness(alterationData.sweetness?.[0] ?? null);
        setSelectedIce(alterationData.ice?.[0] ?? null);
        setActiveHappyHour(happyHourData); // null if none active
      } catch (err) {
        console.error('Failed to load menu page data:', err);
        setError(err.message || 'Failed to load menu data');
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Poll every 60 seconds so prices update if happy hour starts/ends mid-shift
    pollRef.current = setInterval(async () => {
      try {
        const happyHourData = await api.getActiveHappyHour();
        setActiveHappyHour(happyHourData);
      } catch {
        // Silently ignore poll errors
      }
    }, 60_000);

    return () => clearInterval(pollRef.current);
  }, []);

  const getItemPrice = (item) =>
    applyDiscount(item.price, activeHappyHour?.percentOff);

  const runningTotal = useMemo(() => {
    if (!selectedItem) return 0;
    return (
      getItemPrice(selectedItem) +
      selectedMods.reduce((sum, mod) => sum + mod.price, 0) +
      (selectedSweetness?.price ?? 0) +
      (selectedIce?.price ?? 0)
    );
  }, [selectedItem, selectedMods, selectedSweetness, selectedIce, activeHappyHour]);

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

    const discountedBase = getItemPrice(selectedItem);

    addItem({
      name: selectedItem.name,
      basePrice: discountedBase,
      image: selectedItem.image,
      modifications: mods,
      totalPrice: discountedBase + mods.reduce((sum, mod) => sum + mod.price, 0),
    });
    setAddedItemName(selectedItem.name);
    setShowModal(true);
    setSelectedMods([]);
    setSelectedSweetness(alterations.sweetness?.[0] ?? null);
    setSelectedIce(alterations.ice?.[0] ?? null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleViewCart = () => {
    setShowModal(false);
    navigate('/cashier/checkout');
  };
  const categories = useMemo(() => {
    const categoryOrder = ['All', 'Milk Teas', 'Brewed Teas', 'Fruit Teas', 'seasonal'];

    return categoryOrder.filter(
      (category) =>
        category === 'All' || menuItems.some((item) => item.category === category)
    );
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    if (selectedCategory === 'All') return menuItems;
    return menuItems.filter((item) => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  return (
    <PageShell
      title="Menu"
      subtitle="Cashier ordering menu"
      actions={
        <Link className="primary-button inline" to="/cashier/checkout" aria-label={`Go to checkout. Cart has ${items.length} item${items.length === 1 ? '' : 's'}`}>
          Checkout ({items.length})
        </Link>
      }
    >
      {loading && <p>Loading menu...</p>}
      {error && <p className="error-text">{error}</p>}

      {activeHappyHour && (
      <div
        role="status"
        aria-label={`Happy Hour active. ${Math.round(activeHappyHour.percentOff * 100)} percent off all drinks from ${formatTime(activeHappyHour.startTime)} to ${formatTime(activeHappyHour.endTime)}`}
        style={{
        background: 'linear-gradient(135deg, #f9e4e8 0%, #fdf0f2 100%)',
        border: '1px solid #e8c4cc',
        borderRadius: '18px',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 4px 16px rgba(211, 106, 106, 0.12)',
        marginBottom: '0.5rem',
      }}>
        <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🧋</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#7d4a55', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Happy Hour
          </p>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#9b5d6e' }}>
            {Math.round(activeHappyHour.percentOff * 100)}% off all drinks  |  {formatTime(activeHappyHour.startTime)} – {formatTime(activeHappyHour.endTime)}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#d36a6a',
            boxShadow: '0 0 0 3px rgba(211,106,106,0.25)',
            display: 'inline-block',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#d36a6a', letterSpacing: '0.03em' }}>
            Active Now
          </span>
        </div>
      </div>
    )}

      {!loading && !error && (
        <div className="split-layout">
          <div className="card">
            <h2>Menu Items</h2>
            <div className="category-tabs">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="menu-grid">
              {filteredMenuItems.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={`menu-item ${selectedItem?.name === item.name ? 'selected' : ''} ${item.available === false ? 'unavailable' : ''}`}
                  disabled={item.available === false}
                  aria-pressed={selectedItem?.name === item.name}
                  aria-label={`${item.name}. ${currency(getItemPrice(item))}. ${item.available === false ? 'Unavailable' : 'Select to customize'}`}
                  onClick={() => {
                    if (item.available === false) return;
                    setSelectedItem(item);
                  }}
                >
                  <span>{item.name}</span>
                  <strong>{currency(getItemPrice(item))}</strong>
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
                  <strong>{selectedItem.name}</strong> · {currency(getItemPrice(selectedItem))}
                  {activeHappyHour && (
                    <span className="subtle" style={{ marginLeft: '0.5rem', textDecoration: 'line-through' }}>
                      {currency(selectedItem.price)}
                    </span>
                  )}
                </p>
                <div className="checkbox-list">
                  {alterations.default.map((mod) => (
                    <label key={mod.name} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={selectedMods.some((entry) => entry.name === mod.name)}
                        onChange={() => toggleMod(mod)}
                        aria-label={`${mod.name} topping. Adds ${currency(mod.price)}`}
                      />
                      <span>{mod.name}</span>
                      <span>{currency(mod.price)}</span>
                    </label>
                  ))}
                </div>
                <FormField label="Sweetness">
                  <select
                    aria-label="Select sweetness level"
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
                    aria-label="Select ice level"
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
                  <span className="pill" role="status" aria-live="polite">Current total: {currency(runningTotal)}</span>
                  <button
                    className="primary-button inline"
                    onClick={addToOrder}
                    disabled={!selectedItem || selectedItem.available === false}
                    aria-label={selectedItem ? `Add ${selectedItem.name} to order. Current total ${currency(runningTotal)}` : 'Add selected drink to order'}
                  >
                    Add to order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <p className="modal-message">{addedItemName} added to cart</p>
        <div className="modal-actions">
          <button className="secondary-button" onClick={handleCloseModal}>
            Back to menu
          </button>
          <button className="primary-button" onClick={handleViewCart}>
            View cart
          </button>
        </div>
      </Modal>
    </PageShell>
  );
}