import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Modal from '../components/Modal';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { currency } from '../utils/format';

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
  const { items, clearCart, removeItem, subtotal } = useCart();
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

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

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/customer');
  };

  return (
    <PageShell
      title="Checkout"
      actions={<Link className="ghost-link" to="/cashier/menu" aria-label="Back to cashier menu">Back to menu</Link>}
    >
      <div className="card">
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
                <div className="inline-actions">
                  <span>{currency(item.totalPrice)}</span>
                  <button
                    className="secondary-button inline"
                    onClick={() => removeItem(index)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="page-actions">
        <span className="pill" role="status" aria-live="polite">Subtotal: {currency(subtotal)}</span>
        <button className="secondary-button" disabled={!items.length} onClick={cancelOrder} aria-label="Cancel current order">
          Cancel Order
        </button>
        <button
          className="primary-button inline"
          disabled={!items.length}
          onClick={() => processOrder('Cash')}
          aria-label={`Process cash payment for ${currency(subtotal)}`}
        >
          Cash
        </button>
        <button
          className="primary-button inline"
          disabled={!items.length}
          onClick={() => processOrder('Card')}
          aria-label={`Process card payment for ${currency(subtotal)}`}
        >
          Process Card Payment
        </button>
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <p className="modal-message">{message}</p>
        <button className="primary-button" onClick={handleCloseModal}>
          Back to menu
        </button>
      </Modal>
    </PageShell>
  );
}