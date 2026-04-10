import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { useAuth } from '../context/AuthContext';

// Hardcoded orders for MVP
const initialOrders = [
  {
    id: 1,
    timestamp: '09:15 AM',
    completed: false,
    items: [
      { name: 'Classic Milk Tea', quantity: 2, alterations: ['No Ice', 'Extra Boba'] },
      { name: 'Taro Slush', quantity: 1, alterations: ['50% Sugar'] },
    ],
  },
  {
    id: 2,
    timestamp: '09:22 AM',
    completed: false,
    items: [
      { name: 'Mango Green Tea', quantity: 1, alterations: ['Less Ice'] },
      { name: 'Thai Tea', quantity: 2, alterations: ['No Ice', 'Extra Creamer'] },
    ],
  },
  {
    id: 3,
    timestamp: '09:30 AM',
    completed: false,
    items: [
      { name: 'Classic Milk Tea', quantity: 1, alterations: ['Extra Boba'] },
      { name: 'Mango Green Tea', quantity: 1, alterations: [] },
      { name: 'Taro Slush', quantity: 1, alterations: ['0% Sugar'] },
    ],
  },
];

export default function KitchenDashboardPage() {
  const [orders, setOrders] = useState(initialOrders);

  // NEW: tab state
  const [view, setView] = useState('active'); // 'active' or 'completed'

  const [page, setPage] = useState(0);
  const ORDERS_PER_PAGE = 2;

  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleCompleted = (id) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, completed: !order.completed } : order
      )
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  // NEW: filter + sort
  const filteredOrders = orders
    .filter((order) => (view === 'active' ? !order.completed : order.completed))
    .sort((a, b) => a.id - b.id); // oldest first (based on id)

  // UPDATED: pagination uses filteredOrders
  const paginatedOrders = filteredOrders.slice(
    page * ORDERS_PER_PAGE,
    (page + 1) * ORDERS_PER_PAGE
  );

  // NEW: reset page when switching tabs
  const switchView = (newView) => {
    setView(newView);
    setPage(0);
  };

  const nextPage = () => {
    if ((page + 1) * ORDERS_PER_PAGE < filteredOrders.length) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <PageShell
      title="Kitchen Dashboard"
      subtitle="Check off orders as you prepare them"
      actions={
        <button className="secondary-button" onClick={handleLogout}>
          Log out
        </button>
      }
    >
      {/* NEW: Tabs */}
      <div className="tabs">
        <button
          className={view === 'active' ? 'active-tab' : ''}
          onClick={() => switchView('active')}
        >
          Active Orders
        </button>
        <button
          className={view === 'completed' ? 'active-tab' : ''}
          onClick={() => switchView('completed')}
        >
          Completed Orders
        </button>
      </div>

      <section className="orders-section">
        {paginatedOrders.length === 0 ? (
          <p>No orders</p>
        ) : (
          <ul className="order-list">
            {paginatedOrders.map((order) => (
              <li
                key={order.id}
                className={`order-card ${order.completed ? 'completed' : ''}`}
              >
                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <strong>{item.name}</strong> × {item.quantity}
                      {item.alterations.length > 0 && (
                        <div className="alterations">
                          {item.alterations.map((alt, i) => (
                            <span key={i} className="alteration">
                              {alt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="footer">
                  <span className="timestamp">{order.timestamp}</span>
                  <button onClick={() => toggleCompleted(order.id)}>
                    {order.completed ? 'Uncomplete' : 'Done'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* UPDATED: pagination uses filteredOrders */}
      <div className="pagination">
        <button onClick={prevPage} disabled={page === 0}>
          Previous
        </button>
        <span>
          Page {page + 1} of{' '}
          {Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE))}
        </span>
        <button
          onClick={nextPage}
          disabled={(page + 1) * ORDERS_PER_PAGE >= filteredOrders.length}
        >
          Next
        </button>
      </div>

      <style>{`
        .tabs {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .tabs button {
          padding: 8px 16px;
          border: 1px solid #ccc;
          background: #f5f5f5;
          border-radius: 6px;
          cursor: pointer;
        }

        .tabs .active-tab {
          background: #333;
          color: white;
          border-color: #333;
        }

        .order-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .order-card {
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          background-color: #fff;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .order-card.completed {
          opacity: 0.5;
          text-decoration: line-through;
        }

        .order-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .alterations {
          font-size: 0.8rem;
          color: #555;
          margin-left: 8px;
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .alteration {
          background-color: #eee;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .timestamp {
          font-size: 0.8rem;
          color: #666;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
          gap: 12px;
        }

        button {
          cursor: pointer;
        }
      `}</style>
    </PageShell>
  );
}