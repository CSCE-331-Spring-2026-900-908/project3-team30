import { useEffect, useMemo, useState } from 'react';
import ManagerLayout from '../components/ManagerLayout';
import { api } from '../services/api';
import { currency } from '../utils/format';
import { formatOrderDate, getBrowserTimeZone } from '../utils/time';

export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'all', sort: 'newest' });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('Ready to search orders.');

  useEffect(() => {
    loadOrders();
  }, [filters.status, filters.sort]);

  async function loadOrders(event) {
    event?.preventDefault();
    setLoading(true);
    setFeedback('Loading orders...');
    try {
      const orderData = await api.getManagerOrders({ ...filters, timeZone: getBrowserTimeZone() });
      setOrders(orderData);
      setFeedback(`Showing ${orderData.length} matching order${orderData.length === 1 ? '' : 's'}.`);
    } catch (err) {
      console.log('manager orders failed', err);
      setFeedback(`Could not load orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const totals = useMemo(() => {
    const active = orders.filter((order) => !order.complete).length;
    const completed = orders.filter((order) => order.complete).length;
    const revenue = orders.reduce((sum, order) => sum + Number(order.totalCost || 0), 0);

    return { active, completed, revenue };
  }, [orders]);

  return (
    <ManagerLayout
      title="Orders"
      subtitle="Search, filter, and review recent store orders."
      actions={
        <button className="secondary-button" onClick={loadOrders} disabled={loading}>Refresh orders</button>
      }
    >
      <div className="manager-page-stack">
        <div className="feedback-banner" role="status" aria-live="polite">
          {feedback}
        </div>

        <section className="manager-summary-strip" aria-label="Order summary">
          <article className="card compact-stat-card">
            <span>Orders Shown</span>
            <strong>{orders.length}</strong>
          </article>
          <article className="card compact-stat-card">
            <span>Active</span>
            <strong>{totals.active}</strong>
          </article>
          <article className="card compact-stat-card">
            <span>Completed</span>
            <strong>{totals.completed}</strong>
          </article>
          <article className="card compact-stat-card">
            <span>Visible Revenue</span>
            <strong>{currency(totals.revenue)}</strong>
          </article>
        </section>

        <section className="card manager-orders-card">
          <div className="dashboard-card-heading">
            <div>
              <h2>Order Lookup</h2>
              <p className="subtle">Use the search bar for an order number, drink, topping, or note.</p>
            </div>
          </div>

          <form className="manager-order-controls" onSubmit={loadOrders}>
            <input
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Search by order number, item, or note"
              aria-label="Search orders"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              aria-label="Filter order status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filters.sort}
              onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
              aria-label="Sort orders"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="totalHigh">Highest total</option>
              <option value="totalLow">Lowest total</option>
              <option value="status">Active first</option>
            </select>
            <button className="primary-button inline" type="submit" disabled={loading}>Search</button>
          </form>

          <div className="table-wrap manager-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Notes</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td className="empty-cell" colSpan="6">{loading ? 'Loading orders...' : 'No matching orders.'}</td></tr>
                ) : orders.map((order) => (
                  <tr key={order.orderNum}>
                    <td>{order.orderNum}</td>
                    <td>{formatOrderDate(order.orderTime)}</td>
                    <td><span className={`pill ${order.complete ? 'status-completed' : 'status-active'}`}>{order.complete ? 'Completed' : 'Active'}</span></td>
                    <td>{order.items || '—'}</td>
                    <td>{order.notes || '—'}</td>
                    <td>{currency(order.totalCost || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ManagerLayout>
  );
}
