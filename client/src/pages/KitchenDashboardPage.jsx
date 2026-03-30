import { useState } from 'react';
import PageShell from '../components/PageShell';

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
  {
    id: 4,
    timestamp: '09:45 AM',
    completed: false,
    items: [
      { name: 'Thai Tea', quantity: 1, alterations: [] },
      { name: 'Classic Milk Tea', quantity: 1, alterations: ['No Ice'] },
    ],
  },
];

export default function KitchenDashboardPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [page, setPage] = useState(0);
  const ORDERS_PER_PAGE = 2;

  const toggleCompleted = (id) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, completed: !order.completed } : order
      )
    );
  };

  const paginatedOrders = orders.slice(page * ORDERS_PER_PAGE, (page + 1) * ORDERS_PER_PAGE);

  const nextPage = () => {
    if ((page + 1) * ORDERS_PER_PAGE < orders.length) setPage(page + 1);
  };
  const prevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  return (
    <PageShell title="Kitchen Dashboard" subtitle="Check off orders as you prepare them">
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
                    {order.completed ? 'Undo' : 'Done'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="pagination">
        <button onClick={prevPage} disabled={page === 0}>
          Previous
        </button>
        <span>
          Page {page + 1} of {Math.ceil(orders.length / ORDERS_PER_PAGE)}
        </span>
        <button
          onClick={nextPage}
          disabled={(page + 1) * ORDERS_PER_PAGE >= orders.length}
        >
          Next
        </button>
      </div>

      <style>{`
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