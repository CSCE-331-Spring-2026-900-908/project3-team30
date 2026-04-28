import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Modal from '../components/Modal';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { currency } from '../utils/format';
import CustomizePopUp from '../components/CustomizePopUp';
import { useNavigate } from 'react-router-dom';

function summarizeModifications(modifications = []) {
  const counts = modifications.reduce((acc, mod) => {
    const key = mod.name;
    acc[key] = acc[key]
      ? { ...acc[key], count: acc[key].count + 1 }
      : { ...mod, count: 1 };

    return acc;
  }, {});

  return Object.values(counts);
}

export default function CheckoutPage() {
  const { items, clearCart, removeItem, updateItem, increaseQuantity, decreaseQuantity, subtotal } = useCart();
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeHappyHour, setActiveHappyHour] = useState(null);

  const processOrder = async (paymentMethod) => {
    const response = await api.processOrder({
      paymentMethod,
      total: subtotal,
      items,
    });

    setMessage(`Processed ${paymentMethod} payment · confirmation #${response.confirmationNumber%600}`);
    clearCart();
    setShowModal(true);
  };

  const cancelOrder = async () => {
    const response = await api.cancelOrder({
      total: subtotal,
      items,
      orderNotes: 'Cancelled from checkout page',
    });

    setMessage(`Order cancelled · confirmation #${response.confirmationNumber%600}`);
    clearCart();
    setShowModal(true);
  };



  const [alterations, setAlterations] = useState({
    default: [],
    sweetness: [],
    ice: [],
    toppings: []
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    api.getAlterations()
      .then((alterationData) => {
        setAlterations({
          ...alterationData,
          toppings: alterationData.default ?? []
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    api.getActiveHappyHour()
      .then(setActiveHappyHour)
      .catch(console.error);
  }, []);

  const toppingOptions = alterations.toppings?.length
    ? alterations.toppings
    : alterations.default ?? [];

  const navigate = useNavigate();
  const handleCloseModal = () => {
  setShowModal(false);
  navigate('/cashier/menu');
};

  return (
    <PageShell
      title="Checkout"
      actions={<Link className="ghost-link" to="/cashier/menu" aria-label="Back to cashier menu">Back to menu</Link>}
    >
      <div className="card checkout-cart-card">
        <h2>Current Cart</h2>
        {items.length === 0 ? (
          <p className="subtle">No items in cart.</p>
        ) : (
          <div className="cart-list" role="list" aria-label="Current cart items">
            {items.map((item, index) => (
              <div className="cart-item" key={`${item.name}-${index}`} role="listitem">
                <div>
                  <strong>{item.name}</strong>
                  <p className="subtle">
                    {summarizeModifications(item.modifications)
                    .map((mod) => `${mod.name}${mod.count > 1 ? ` ×${mod.count}` : ''}`)
                    .join(', ') || 'No modifications'}
                  </p>
                </div>
                <div className="checkout-item-actions">
                  <span className="checkout-item-price">
                    {currency(item.totalPrice * (item.quantity || 1))}
                  </span>

                  <div className="topping-controls">
                    <button onClick={() => decreaseQuantity(index)}>-</button>
                    <span>{item.quantity || 1}</span>
                    <button onClick={() => increaseQuantity(index)}>+</button>
                  </div>

                  <button
                    className="secondary-button inline"
                    onClick={() => {
                      setEditingIndex(index);
                      setEditingItem(item);
                    }}
                  >
                    Edit
                  </button>

                  <button className="secondary-button inline" onClick={() => removeItem(index)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="checkout-actions">
        <div className="checkout-subtotal">
          <span>Subtotal</span>
          <strong>{currency(subtotal)}</strong>
        </div>

        <div className="checkout-buttons">
          <button className="secondary-button" disabled={!items.length} onClick={cancelOrder}>
            Cancel Order
          </button>

          <button
            className="primary-button inline"
            disabled={!items.length}
            onClick={() => processOrder('Cash')}
          >
            Cash
          </button>

          <button
            className="primary-button inline"
            disabled={!items.length}
            onClick={() => processOrder('Card')}
          >
            Process Card Payment
          </button>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <p className="modal-message">{message}</p>
        <button className="primary-button" onClick={handleCloseModal}>
          Back to menu
        </button>
      </Modal>

      {editingItem && (
        <CustomizePopUp
          item={editingItem}
          toppings={toppingOptions}
          alterations={alterations}
          activeHappyHour={activeHappyHour}
          isEdit={true}
          onClose={() => {
            setEditingItem(null);
            setEditingIndex(null);
          }}
          onAddToCart={(updatedCartItem) => {
            updateItem(editingIndex, updatedCartItem);
            setEditingItem(null);
            setEditingIndex(null);
          }}
        />
      )}
    </PageShell>
  );
}