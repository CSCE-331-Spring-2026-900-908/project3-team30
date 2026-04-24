import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import FormField from '../components/FormField';
import ChatAssistant from '../components/ChatAssistant';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { currency } from '../utils/format';
import { useNavigate } from 'react-router-dom';

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

  return (
    <PageShell
      title="Drinks in the Dreamhouse"
      subtitle="Sip something fabulous."
      actions={
        <Link className="primary-button inline" to="/customer/checkout">
          View Cart ({items.length})
        </Link>
      }
    >
      {activeHappyHour && (
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f9c5d1 0%, #fde8ec 50%, #f9c5d1 100%)',
          borderRadius: '20px',
          marginBottom: '1.25rem',
          padding: '0',
          border: '1.5px solid #f0a8b8',
          boxShadow: '0 4px 24px rgba(210, 100, 130, 0.15)',
        }}>

          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: '-28px', right: '-28px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-40px', right: '80px',
            width: '90px', height: '90px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '-20px', left: '200px',
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            pointerEvents: 'none',
          }} />

          <div style={{
            position: 'relative',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 28px',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>

            {/* Left: title + time */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '22px',
                fontWeight: 800,
                color: '#b5365a',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                Happy Hour
              </span>
              <span style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                color: '#c26080',
                letterSpacing: '0.01em',
              }}>
                {formatTime(activeHappyHour.startTime)} – {formatTime(activeHappyHour.endTime)}
              </span>
            </div>

            {/* Center: big discount */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '1px',
            }}>
              <span style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '42px',
                fontWeight: 900,
                color: '#b5365a',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}>
                {Math.round(activeHappyHour.percentOff * 100)}% off
              </span>
              <span style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                color: '#c26080',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                all drinks
              </span>
            </div>

            {/* Right: time remaining */}
              {(() => {
                const now = new Date();
                const end = activeHappyHour.endTime;
                let endH, endM;
                if (Array.isArray(end)) {
                  [endH, endM] = end;
                } else {
                  [endH, endM] = end.split(':').map(Number);
                }
                const endDate = new Date();
                endDate.setHours(endH, endM, 0, 0);
                const diffMs = endDate - now;
                const diffMins = Math.max(0, Math.floor(diffMs / 60000));
                const hours = Math.floor(diffMins / 60);
                const mins = diffMins % 60;

                return (
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '2px',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '28px',
                      fontWeight: 900,
                      color: '#b5365a',
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                    }}>
                      {hours > 0 ? `${hours}h ${String(mins).padStart(2, '0')}m` : `${mins}m`}
                    </span>
                    <span style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#c26080',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}>
                      remaining
                    </span>
                  </div>
                );
              })()}

          </div>
        </div>
      )}

      <div className="split-layout">
        <div className="card">
          <h2>Menu Items</h2>

          <div className="menu-grid">
            {menuItems.map((item) => (
              <button
                key={item.name}
                type="button"
                className={`menu-item ${selectedItem?.name === item.name ? 'selected' : ''
                  } ${item.available === false ? 'unavailable' : ''}`}
                disabled={item.available === false}
                onClick={() =>
                  navigate(`/customize/${encodeURIComponent(item.name)}`, {
                    state: { item, activeHappyHour }
                  })
                }
              >
                <div className="menu-item-content">
                  <img
                    src={item.image}
                    alt={`${item.name} drink`}
                    className="menu-item-image"
                  />

                  <div className="menu-item-details">
                    <div>
                      <h3>{item.name}</h3>
                      <p>Customize sweetness, ice, and toppings.</p>
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

        <div className="card">
          <ChatAssistant
            menuItems={menuItems}
            alterations={alterations}
            selectedItem={selectedItem}
            selectedMods={selectedMods}
            selectedSweetness={selectedSweetness}
            cart={items}
          />
        </div>
      </div>
    </PageShell>
  );
}