import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function KitchenDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState('active');
  const [page, setPage] = useState(0);

  const ORDERS_PER_PAGE = 2;

  const { logout } = useAuth();
  const navigate = useNavigate();

  // LOAD DATA FROM BACKEND
  useEffect(() => {
    loadOrders();
  }, [view]);

  const loadOrders = async () => {
    try {
      if (view === 'active') {
        const data = await api.getActiveOrders();
        setOrders(data);
        console.log(data); 
      } else {
        const data = await api.getCompletedOrders();
        console.log(data); 
        setOrders(data);
      }
      setPage(0);
    } catch (err) {
      console.error(err);
    }
  };

  // MARK COMPLETE 
  const toggleCompleted = async (transactionNumber) => {
    try {
      await api.markComplete(transactionNumber);

      // refresh after update
      loadOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders; // backend already filters
  const paginatedOrders = filteredOrders.slice(
    page * ORDERS_PER_PAGE,
    (page + 1) * ORDERS_PER_PAGE
  );

  const switchView = (newView) => {
    setView(newView);
  };

  const nextPage = () => {
    if ((page + 1) * ORDERS_PER_PAGE < filteredOrders.length) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleLogout = () => {
    logout();
    navigate('/home');
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
      {/* TABS */}
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
              <li key={order.orderNum} className="order-card">
                <div className="order-items">
                  {order.drinks.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <strong>{item.name}</strong>

                      {item.modifications?.length > 0 && (
                        <div className="alterations">
                          {item.modifications.map((mod, i) => (
                            <span key={i} className="alteration">
                              {mod.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="footer">
                  <span className="timestamp">
                    {new Date(order.orderTime).toLocaleTimeString()}
                  </span>

                  {view === 'active' ? (
                    <button
                      onClick={() => toggleCompleted(order.orderNum)}
                    >
                      Done
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleCompleted(order.orderNum)}
                    >
                      Uncomplete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* PAGINATION */}
      <div className="pagination">
        <button onClick={prevPage} disabled={page === 0}>
          Previous
        </button>

        <span>
          Page {page + 1} of {Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE))}
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
          background: #fff;
        }

        .order-item {
          margin-bottom: 6px;
        }

        .alterations {
          font-size: 0.8rem;
          color: #666;
          display: flex;
          gap: 6px;
        }

        .alteration {
          background: #eee;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }

        .timestamp {
          font-size: 0.8rem;
          color: #666;
        }

        .pagination {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 20px;
        }
      `}</style>
    </PageShell>
  );
}