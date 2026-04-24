import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { currency } from '../utils/format';

export default function CheckoutPage() {
  const { items, clearCart, removeItem, subtotal } = useCart();
  const [message, setMessage] = useState('');

  const processOrder = async (paymentMethod) => {
    const response = await api.processOrder({
      paymentMethod,
      total: subtotal,
      items,
    });

    setMessage(`Processed ${paymentMethod} payment · confirmation #${response.confirmationNumber%600}`);
    clearCart();
  };

  const cancelOrder = async () => {
    const response = await api.cancelOrder({
      total: subtotal,
      items,
      orderNotes: 'Cancelled from checkout page',
    });

    setMessage(`Order cancelled · confirmation #${response.confirmationNumber%600}`);
    clearCart();
  };

  return (
    <PageShell
      title="Checkout"
      subtitle="Web version of checkout.fxml"
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
                    {item.modifications.map((mod) => mod.name).join(', ') || 'No modifications'}
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

      {message ? <p className="success-text" role="status" aria-live="polite">{message}</p> : null}
    </PageShell>
  );
}