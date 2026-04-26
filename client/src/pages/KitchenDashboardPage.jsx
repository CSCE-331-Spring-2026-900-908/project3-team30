import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function KitchenDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState('active');

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders('active');
  }, []);

  const loadOrders = async (v) => {
    try {
      const data = v === 'active'
        ? await api.getActiveOrders()
        : await api.getCompletedOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const switchView = async (newView) => {
    try {
      const data = newView === 'active'
        ? await api.getActiveOrders()
        : await api.getCompletedOrders();
      setOrders(data);
      setView(newView);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCompleted = async (transactionNumber) => {
    try {
      await api.markComplete(transactionNumber);
      loadOrders(view);
    } catch (err) {
      console.error(err);
    }
  };

  const getElapsed = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

  return (
    <div className="board-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">

        <button
          className={`view-btn ${view === 'active' ? 'view-btn--active' : ''}`}
          onClick={() => switchView('active')}
        >
          Active
        </button>
        <button
          className={`view-btn ${view === 'completed' ? 'view-btn--done' : ''}`}
          onClick={() => switchView('completed')}
        >
          Done
        </button>
      </aside>

      {/* TICKET RAIL */}
      <div className="rail-wrapper">
        <div className="rail-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{view === 'active' ? 'Active Orders' : 'Completed Orders'}</span>
          <span className="ticket-count">{orders.length} tickets</span>
      </div>

        <div className="ticket-rail">
          {orders.length === 0 ? (
            <p className="empty">no orders</p>
          ) : (
            orders.map((order) => (
              <div key={order.orderNum} className={`ticket ${view === 'completed' ? 'ticket--done' : ''}`}>

                <div className="ticket-header">
                <span className="order-num">#{order.orderNum%600}</span>
                <span className="elapsed">{getElapsed(order.orderTime)}</span>
              </div>

              {view === 'completed' && order.completeTime && (
                <div className="ticket-times">
                  <div className="ticket-time-row">
                    <span className="time-label">ordered</span>
                    <span className="time-value">{new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              )}

                {view === 'completed' && order.completeTime && (
                <div className="complete-time">
                done at {new Date(order.completeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}

                <div className="ticket-items">
                  {order.drinks.map((item, idx) => (
                    <div key={idx} className="ticket-item">
                      <span className="item-name">{item.name}</span>
                      {item.modifications?.length > 0 && (
                        <div className="mods">
                          {item.modifications.map((mod, i) => (
                            <span key={i} className="mod-tag">{mod.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="ticket-footer">
                  <button
                    className={`action-btn ${view === 'active' ? 'action-btn--done' : 'action-btn--undo'}`}
                    onClick={() => toggleCompleted(order.orderNum)}
                  >
                    {view === 'active' ? 'done' : 'undo'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}