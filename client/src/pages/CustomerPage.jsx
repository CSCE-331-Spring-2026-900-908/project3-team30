import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import FormField from '../components/FormField';
import ChatAssistant from '../components/ChatAssistant';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { currency } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import CustomizePopUp from '../components/CustomizePopUp';
import WeatherWidget from '../components/WeatherWidget';
import HappyHourBanner from '../components/HappyHourBanner';


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

export default function CustomerPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [alterations, setAlterations] = useState({
    defaults: [],
    sweetness: [],
    ice: []
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMods, setSelectedMods] = useState([]);
  const [selectedSweetness, setSelectedSweetness] = useState('100% Sugar');
  const [selectedIce, setSelectedIce] = useState('100% Ice');
  const [activeHappyHour, setActiveHappyHour] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const pollRef = useRef(null);

  useEffect(() => {
    api.getMenuItems().then(setMenuItems).catch(console.error);
    api.getAlterations().then(setAlterations).catch(console.error);
    api.getActiveHappyHour().then(setActiveHappyHour).catch(() => null);

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

  const runningTotal = useMemo(() => {
    if (!selectedItem) return 0;
    const discountedBase = applyDiscount(selectedItem.price, activeHappyHour?.percentOff);
    return discountedBase + selectedMods.reduce((sum, mod) => sum + Number(mod.price || 0), 0);
  }, [selectedItem, selectedMods, activeHappyHour]);

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
      { name: selectedSweetness, price: 0 },
      { name: selectedIce, price: 0 }
    ];

    const discountedBase = applyDiscount(selectedItem.price, activeHappyHour?.percentOff);

    addItem({
      name: selectedItem.name,
      basePrice: discountedBase,
      modifications: mods,
      totalPrice: discountedBase + mods.reduce((sum, mod) => sum + Number(mod.price || 0), 0)
    });

    setSelectedMods([]);
    setSelectedSweetness('100% Sugar');
    setSelectedIce('100% Ice');
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
    <section className="customer-page">
      <PageShell
        title="Drinks in the Dreamhouse"
        // subtitle="Sip something fabulous."
        subtitle={
          <WeatherWidget
            latitude={30.62}
            longitude={-96.34}
            locationName="College Station, TX"
          />}
        actions={
          <Link
            className="primary-button inline"
            to="/customer/checkout"
            aria-label={`View cart with ${items.length} item${items.length === 1 ? '' : 's'}`}
          >
            View Cart ({items.length})
          </Link>
        }
      >
      
<HappyHourBanner activeHappyHour={activeHappyHour} />


      <div className="card customer-menu-card">
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
                key={getDisplayDrinkName(item.name)}
                type="button"
                className={`menu-item ${selectedItem?.name === item.name ? 'selected' : ''
                  } ${item.available === false ? 'unavailable' : ''}`}
                disabled={item.available === false}
                aria-label={`${getDisplayDrinkName(item.name)}. ${activeHappyHour ? currency(applyDiscount(item.price, activeHappyHour.percentOff)) : currency(item.price)}. ${item.available === false ? 'Unavailable' : 'Customize this drink'}`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="menu-item-content">
                  <img
                    src={item.image}
                    alt={`${getDisplayDrinkName(item.name)} drink`}
                    className="menu-item-image"
                  />

                  <div className="menu-item-details">
                    <div>
                      <h3>{getDisplayDrinkName(item.name)}</h3>
                      {/* <p>Customize sweetness, ice, and toppings.</p> */}
                    </div>

                    <div className="menu-item-footer">
                      {activeHappyHour ? (
                        <div className="price-stack">
                          <span className="original-price">
                            {currency(item.price)}
                          </span>

                          <strong className="sale-price">
                            {currency(
                              applyDiscount(
                                item.price,
                                activeHappyHour.percentOff
                              )
                            )}
                          </strong>
                        </div>
                      ) : (
                        <strong>{currency(item.price)}</strong>
                      )}

                      <span className="customize-label">Customize</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
          {selectedItem && (
            <CustomizePopUp
              item={selectedItem}
              toppings={alterations.default ?? []}
              alterations={alterations}
              activeHappyHour={activeHappyHour}
              onClose={() => setSelectedItem(null)}
              onAddToCart={(cartItem) => {
                addItem(cartItem);
                setSelectedItem(null);
              }}
            />
          )}
          <ChatAssistant
            menuItems={menuItems}
            alterations={alterations}
            selectedItem={selectedItem}
            selectedMods={selectedMods}
            selectedSweetness={selectedSweetness}
            cart={items}
          />
      </PageShell>
    </section>
  );
}