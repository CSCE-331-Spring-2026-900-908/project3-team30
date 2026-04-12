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
        <span className="sidebar-label">Kitchen</span>

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
        <div className="rail-header">
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
                <span className="order-num">#{order.orderNum}</span>
                <span className="elapsed">{getElapsed(order.orderTime)}</span>
              </div>

              {view === 'completed' && order.completeTime && (
                <div className="ticket-times">
                  <div className="ticket-time-row">
                    <span className="time-label">ordered</span>
                    <span className="time-value">{new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="ticket-time-row">
                    <span className="time-label">done</span>
                    <span className="time-value" style={{color: '#3b6d11'}}>{new Date(order.completeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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

      <style>{`
        .board-shell {
          display: flex;
          height: 100vh;
          overflow: hidden;    
          background: #f5f4f0;
        }

        /* SIDEBAR */
        .sidebar {
          width: 52px;
          flex-shrink: 0;
          background: #fff;
          border-right: 0.5px solid #e0dfd8;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 0;
          gap: 8px;
        }
        .sidebar-label {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 11px;
          color: #999;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        .view-btn {
          width: 36px;
          height: 64px;
          border-radius: 8px;
          border: 0.5px solid #ddd;
          background: transparent;
          cursor: pointer;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 11px;
          color: #999;
        }
        .view-btn--active {
          background: #e6f1fb;
          border-color: #378add;
          color: #185fa5;
          font-weight: 500;
        }
        .view-btn--done {
          background: #eaf3de;
          border-color: #639922;
          color: #3b6d11;
          font-weight: 500;
        }

        /* RAIL */
        .rail-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0; 
        }
        .rail-header {
          padding: 12px 16px 8px;
          background: #fff;
          border-bottom: 0.5px solid #e0dfd8;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          font-weight: 500;
        }
        .ticket-count {
          font-weight: 400;
          color: #999;
        }
        .ticket-rail {
          flex: 1;
          min-height: 0;         
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 200px));
          grid-template-rows: repeat(2, 1fr);
          grid-auto-flow: column;
          gap: 12px;
          padding: 16px;
          overflow-x: auto;
          overflow-y: hidden;
          align-content: start;
        }
        .empty {
          font-size: 13px;
          color: #bbb;
        }

        /* TICKETS */
        .ticket {
          min-width: 160px;
          max-width: 200px;
          background: #fff;
          border-radius: 12px;
          border: 0.5px solid #e0dfd8;
          border-top: 3px solid #378add;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 0;      
          overflow: hidden;  
        }
        .ticket--done {
          border-top-color: #639922;
        }
        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .order-num {
          font-size: 13px;
          font-weight: 500;
        }
        .elapsed {
          font-size: 11px;
          color: #bbb;
        }
        .ticket-items {
          display: flex;
          flex-direction: column;
          gap: 0;
          overflow-y: auto;    
          min-height: 0;      
        }
        .ticket-item {
          border-top: 0.5px solid #e0dfd8;
          padding-top: 8px;
          padding-bottom: 2px;
        }
        .item-name {
          font-size: 13px;
        }
        .mods {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 4px;
        }
        .mod-tag {
          font-size: 10px;
          background: #f1efe8;
          color: #666;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .ticket-footer {
          margin-top: auto;
          padding-top: 8px;
          border-top: 0.5px solid #e0dfd8;
        }
        .action-btn {
          width: 100%;
          padding: 6px;
          font-size: 12px;
          border-radius: 8px;
          cursor: pointer;
          border: 0.5px solid #ddd;
        }
        .action-btn--done {
          background: #fcebeb;
          color: #a32d2d;
          border-color: #f09595;
        }
        .action-btn--undo {
          background: #f5f4f0;
          color: #888;
        }
        .complete-time {
          font-size: 11px;
          color: #3b6d11;
          margin-top: -6px;
        }
        .ticket-times {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-top: -4px;
        }
        .ticket-time-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .time-label {
          font-size: 11px;
          color: #bbb;
        }
        .time-value {
          font-size: 11px;
          color: #888;
        }
      `}</style>
    </div>
  );
}