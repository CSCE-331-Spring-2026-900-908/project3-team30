import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import FormField from '../components/FormField';
import ChatAssistant from '../components/ChatAssistant';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { currency } from '../utils/format';
import { useNavigate } from 'react-router-dom';

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
  const { addItem, items } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.getMenuItems().then(setMenuItems).catch(console.error);
    api.getAlterations().then(setAlterations).catch(console.error);
  }, []);

  const runningTotal = useMemo(() => {
    if (!selectedItem) return 0;
    return selectedItem.price + selectedMods.reduce((sum, mod) => sum + Number(mod.price || 0), 0);
  }, [selectedItem, selectedMods]);

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

    addItem({
      name: selectedItem.name,
      basePrice: selectedItem.price,
      modifications: mods,
      totalPrice: selectedItem.price + mods.reduce((sum, mod) => sum + Number(mod.price || 0), 0)
    });

    setSelectedMods([]);
    setSelectedSweetness('100% Sugar');
    setSelectedIce('100% Ice');
  };

  return (
    <PageShell
      title="Boba Shop"
      subtitle="Place your order"
      actions={
        <Link className="primary-button inline" to="/customer/checkout">
          Checkout ({items.length})
        </Link>
      }
    >
      <div className="split-layout">
        <div className="card">
          <h2>Menu Items</h2>
          <div className="menu-grid">
            {menuItems.map((item) => (
              <button
                key={item.name}
                className={`menu-item ${selectedItem?.name === item.name ? 'selected' : ''}`}
                //onClick={() => setSelectedItem(item)}
                //onClick={() => navigate(`/customize/${encodeURIComponent(item.name)}`)}
              onClick={() =>
                        navigate(`/customize/${encodeURIComponent(item.name)}`, {
                          state: { item }
                        })
                      }
              >
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

        <ChatAssistant
            menuItems={menuItems}
            alterations={alterations}
            selectedItem={selectedItem}
            selectedMods={selectedMods}
            selectedSweetness={selectedSweetness}
            cart={items}
          />
      </div>
    </PageShell>
  );
}