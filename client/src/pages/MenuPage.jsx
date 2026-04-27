import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import FormField from '../components/FormField';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { currency } from '../utils/format';
import { useAuth } from '../context/AuthContext';

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

function getDisplayDrinkName(name) {
  return name
    .replace(/^(Small|Large)\s+/i, '')
    .trim();
}

function isSmallDrink(item) {
  return /^Small\s+/i.test(item.name);
}

function getPercent(option) {
  return parseInt(option.name.match(/\d+/)?.[0] ?? 0);
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [alterations, setAlterations] = useState({ default: [], sweetness: [], ice: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const [toppingCounts, setToppingCounts] = useState({});
  const [selectedSize, setSelectedSize] = useState({ name: 'Small', label: 'Small (Default)', price: 0 });
  const [selectedSweetness, setSelectedSweetness] = useState(null);
  const [selectedIce, setSelectedIce] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeHappyHour, setActiveHappyHour] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const sizeOptions = [
    { name: 'Small', label: 'Small (Default)', price: 0 },
    { name: 'Large', label: 'Large (+$1.50)', price: 1.5 },
  ];

  const { addItem, items } = useCart();
  const pollRef = useRef(null);

  const {user} = useAuth();

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

  useEffect(() => {
    setToppingCounts({});
    setSelectedSize(sizeOptions[0]);
    setSelectedSweetness(alterations.sweetness?.[0] ?? null);
    setSelectedIce(alterations.ice?.[0] ?? null);
  }, [selectedItem, alterations]);

  const getItemPrice = (item) =>
    applyDiscount(item.price, activeHappyHour?.percentOff);

  const toppingMods = useMemo(() => {
    return Object.entries(toppingCounts).flatMap(([name, count]) => {
      const topping = alterations.default.find((toppingOption) => toppingOption.name === name);
      if (!topping) return [];

      return Array.from({ length: count }, () => ({
        name: topping.name,
        price: topping.price,
      }));
    });
  }, [toppingCounts, alterations.default]);

  const runningTotal = useMemo(() => {
    if (!selectedItem) return 0;

    const mods = [
      ...(selectedSize ? [selectedSize] : []),
      ...toppingMods,
      ...(selectedSweetness ? [selectedSweetness] : []),
      ...(selectedIce ? [selectedIce] : []),
    ];

    return getItemPrice(selectedItem) + mods.reduce((sum, mod) => sum + Number(mod.price || 0), 0);
  }, [selectedItem, selectedSize, toppingMods, selectedSweetness, selectedIce, activeHappyHour]);

  const increaseTopping = (topping) => {
    setToppingCounts((prev) => ({
      ...prev,
      [topping.name]: (prev[topping.name] || 0) + 1,
    }));
  };

  const decreaseTopping = (topping) => {
    setToppingCounts((prev) => {
      const current = prev[topping.name] || 0;

      if (current <= 1) {
        const { [topping.name]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [topping.name]: current - 1,
      };
    });
  };

  const addToOrder = () => {
    if (!selectedItem) return;

    const mods = [
      ...(selectedSize ? [selectedSize] : []),
      ...toppingMods,
      ...(selectedSweetness ? [selectedSweetness] : []),
      ...(selectedIce ? [selectedIce] : []),
    ];

    const discountedBase = getItemPrice(selectedItem);

    addItem({
      name: selectedItem.name,
      basePrice: discountedBase,
      image: selectedItem.image,
      modifications: mods,
      totalPrice: discountedBase + mods.reduce((sum, mod) => sum + Number(mod.price || 0), 0),
    });

    setToppingCounts({});
    setSelectedSize(sizeOptions[0]);
    setSelectedSweetness(alterations.sweetness?.[0] ?? null);
    setSelectedIce(alterations.ice?.[0] ?? null);
  };

  const categories = useMemo(() => {
    const categoryOrder = ['All', 'Milk Teas', 'Brewed Teas', 'Fruit Teas', 'Seasonal'];

    return categoryOrder.filter(
      (category) =>
        category === 'All' || menuItems.some((item) => item.category === category)
    );
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    const smallDrinks = menuItems.filter(isSmallDrink);

    if (selectedCategory === 'All') return smallDrinks;
    return smallDrinks.filter((item) => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  return (
    <PageShell
      title="Drinks in the Dreamhouse"
      subtitle={
        user?.firstName && user.lastName
          ? `Current Employee: ${user.firstName} ${user.lastName}`
          : "Cashier"
      }
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
    className="happy-hour-banner"
  >
    <div>
      <p className="happy-hour-title">Happy Hour</p>
      <p className="happy-hour-time">
        {formatTime(activeHappyHour.startTime)} – {formatTime(activeHappyHour.endTime)}
      </p>
    </div>
    <p className="happy-hour-discount">
      {Math.round(activeHappyHour.percentOff * 100)}% off
    </p>
  </div>
)}

      {!loading && !error && (
        <div className="cashier-menu">
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
                    aria-label={`${getDisplayDrinkName(item.name)}. ${currency(getItemPrice(item))}. ${item.available === false ? 'Unavailable' : 'Select to customize'}`}
                    onClick={() => {
                      if (item.available === false) return;
                      setSelectedItem(item);
                    }}
                  >
                    <span>{getDisplayDrinkName(item.name)}</span>
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
                    <strong>{getDisplayDrinkName(selectedItem.name)}</strong> · {currency(getItemPrice(selectedItem))}
                    {activeHappyHour && (
                      <span className="subtle" style={{ marginLeft: '0.5rem', textDecoration: 'line-through' }}>
                        {currency(selectedItem.price)}
                      </span>
                    )}
                  </p>

                  <FormField label="Size">
                    <select
                      aria-label="Select drink size"
                      value={selectedSize?.name ?? ''}
                      onChange={(e) =>
                        setSelectedSize(
                          sizeOptions.find((option) => option.name === e.target.value) ?? sizeOptions[0]
                        )
                      }
                    >
                      {sizeOptions.map((option) => (
                        <option key={option.name} value={option.name}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

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
                      {[...(alterations.sweetness ?? [])]
                        .sort((a, b) => getPercent(a) - getPercent(b))
                        .map((option) => (
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
                      {[...(alterations.ice ?? [])]
                        .sort((a, b) => getPercent(a) - getPercent(b))
                        .map((option) => (
                          <option key={option.name} value={option.name}>
                            {option.name}
                          </option>
                        ))}
                    </select>
                  </FormField>

                  <div className="customize-section">
                    <h3>Toppings</h3>
                    <div className="topping-list">
                      {alterations.default.map((topping) => {
                        const count = toppingCounts[topping.name] || 0;

                        return (
                          <div key={topping.name} className="topping-row">
                            <div className="topping-info">
                              <span className="topping-name">{topping.name}</span>
                              <span className="topping-price">{currency(topping.price)} ea.</span>
                            </div>

                            <div className="topping-controls">
                              <button type="button" onClick={() => decreaseTopping(topping)}>-</button>
                              <span>{count}</span>
                              <button type="button" onClick={() => increaseTopping(topping)}>+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="customize-popup-footer">
                    <strong>Total: {currency(runningTotal)}</strong>

                    <div className="button-group">
                      <button
                        className="secondary-button inline"
                        type="button"
                        onClick={() => setSelectedItem(null)}
                        aria-label="Cancel drink customization"
                      >
                        Cancel
                      </button>

                      <button
                        className="primary-button inline"
                        type="button"
                        onClick={addToOrder}
                      >
                        Add to order
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}