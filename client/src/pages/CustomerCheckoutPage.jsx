import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Modal from '../components/Modal';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { currency } from '../utils/format';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const { items, clearCart, removeItem, subtotal } = useCart();
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  
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
      actions={<Link className="ghost-link" to="/customer">Back to menu</Link>}
    >
      <div className="card">
        <h2>Current Cart</h2>
        {items.length === 0 ? (
          <p className="subtle">No items in cart.</p>
        ) : (
          <div className="cart-list">
            {items.map((item, index) => (
              <div className="cart-item" key={`${item.name}-${index}`}>
                <div>
                  <strong>{item.name}</strong>
                  <p className="subtle">
                    {item.modifications.map((mod) => mod.name).join(', ') || 'No modifications'}
                  </p>
                </div>
                <div className="inline-actions">
                  <span>{currency(item.totalPrice)}</span>
                  <button className="secondary-button inline" onClick={() => {
                        const itemToEdit = items[index];
                        removeItem(index);
                        navigate(`/customize/${encodeURIComponent(itemToEdit.name)}`, {
                          state: {
                            item: itemToEdit,
                            index,
                            isEdit: true
                          }
                        });
                      }}>
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
      <div className="page-actions">
        <span className="pill">Subtotal: {currency(subtotal)}</span>
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

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <p className="modal-message">{message}</p>
        <button className="primary-button" onClick={handleCloseModal}>
          Back to menu
        </button>
      </Modal>
    </PageShell>
  );
}