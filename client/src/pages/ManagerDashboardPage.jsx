import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { currency } from '../utils/format';
import { useAuth } from '../context/AuthContext';

function formatOrderDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function BarChartCard({ title, data, valueKey, labelFormatter = (label) => label }) {
  const max = Math.max(...data.map((row) => Number(row[valueKey] || 0)), 1);

  return (
    <article className="card dashboard-chart-card">
      <div className="dashboard-card-heading">
        <h2>{title}</h2>
        <span className="pill">Live data</span>
      </div>

      {data.length === 0 ? (
        <p className="subtle">No data available yet.</p>
      ) : (
        <div className="mini-chart" aria-label={title}>
          {data.map((row) => {
            const value = Number(row[valueKey] || 0);
            return (
              <div className="mini-chart-row" key={`${row.label}-${valueKey}`}>
                <span className="mini-chart-label">{labelFormatter(row.label)}</span>
                <div className="mini-chart-track">
                  <div className="mini-chart-bar" style={{ width: `${Math.max((value / max) * 100, 4)}%` }} />
                </div>
                <strong className="mini-chart-value">
                  {valueKey.toLowerCase().includes('revenue') ? currency(value) : value}
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export default function ManagerDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState({ hourlySales: [], categorySales: [], topItems: [] });
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [orderFilters, setOrderFilters] = useState({ search: '', status: 'all', sort: 'newest' });
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { user, setManagerUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauth = params.get('oauth');

    if (oauth === 'success') {
      setManagerUser();
      navigate('/manager', { replace: true });
      return;
    }

    if (!user || user.role !== 'manager') {
      navigate('/', { replace: true });
      return;
    }

    loadDashboard();
  }, [location.search, user, setManagerUser, navigate]);

  useEffect(() => {
    if (!showOrders) return;
    loadOrders();
  }, [showOrders, orderFilters.status, orderFilters.sort]);

  async function loadDashboard() {
    setLoading(true);
    setFeedback('Loading manager dashboard...');
    try {
      const [summaryData, insightData] = await Promise.all([
        api.getManagerSummary(),
        api.getManagerInsights()
      ]);
      setSummary(summaryData);
      setInsights({
        hourlySales: insightData.hourlySales ?? [],
        categorySales: insightData.categorySales ?? [],
        topItems: insightData.topItems ?? []
      });
      setFeedback('Dashboard updated successfully.');
    } catch (err) {
      console.log('manager dashboard failed', err);
      setFeedback(`Could not refresh dashboard: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    setOrdersLoading(true);
    setFeedback('Loading orders...');
    try {
      const orderData = await api.getManagerOrders(orderFilters);
      setOrders(orderData);
      setFeedback(`Showing ${orderData.length} matching order${orderData.length === 1 ? '' : 's'}.`);
    } catch (err) {
      console.log('manager orders failed', err);
      setFeedback(`Could not load orders: ${err.message}`);
    } finally {
      setOrdersLoading(false);
    }
  }

  const handleLogout = () => {
    logout();
  };

  const categories = useMemo(() => [
    { label: 'Overview', href: '#overview' },
    { label: 'Orders', href: '#orders' },
    { label: 'Reports', href: '#graphs' },
    { label: 'Employees', to: '/manager/employees' },
    { label: 'Menu', to: '/manager/menu' },
    { label: 'Inventory', to: '/manager/inventory' }
  ], []);

  return (
    <PageShell
      title="Manager Dashboard"
      actions={
        <div className="inline-actions">
          <button className="secondary-button" onClick={loadDashboard} disabled={loading}>Refresh dashboard</button>
          <button className="secondary-button" onClick={handleLogout}>Log out</button>
        </div>
      }
    >
      <div className="manager-dashboard-layout">
        <aside className="card manager-sidebar" aria-label="Manager dashboard categories">
          <p className="eyebrow">Categories</p>
          {categories.map((category) => (
            category.to ? (
              <Link key={category.label} to={category.to}>{category.label}</Link>
            ) : (
              <a key={category.label} href={category.href}>{category.label}</a>
            )
          ))}
        </aside>

        <main className="manager-dashboard-main">
          <div className="feedback-banner" role="status" aria-live="polite">
            {feedback || 'Ready.'}
          </div>

          <section id="overview" className="stat-grid">
            <StatCard label="Orders Today" value={summary?.ordersToday ?? '—'} />
            <StatCard label="Revenue Today" value={summary ? currency(summary.revenueToday) : '—'} />
            <StatCard label="Top Item" value={summary?.topItem ?? '—'} />
            <StatCard label="Active Employees" value={summary?.activeEmployees ?? '—'} />
          </section>

          <section className="quick-grid manager-action-grid">
            <Link className="quick-link card" to="/manager/employees">Manage Employees</Link>
            <Link className="quick-link card" to="/manager/menu">Manage Menu and Happy Hour</Link>
            <Link className="quick-link card" to="/manager/inventory">Inventory</Link>
            <Link className="quick-link card" to="/manager/reports">Sales & Trends</Link>
          </section>

          <section id="graphs" className="dashboard-graph-grid">
            <BarChartCard
              title="Revenue by Hour"
              data={insights.hourlySales}
              valueKey="revenue"
              labelFormatter={(hour) => `${hour}:00`}
            />
            <BarChartCard title="Sales by Category" data={insights.categorySales} valueKey="revenue" />
            <BarChartCard title="Top Items" data={insights.topItems} valueKey="orders" />
          </section>

          <section id="orders" className="card manager-orders-card">
            <div className="dashboard-card-heading">
              <div>
                <h2>Orders</h2>
                <p className="subtle">Look up, filter, and sort recent orders from the manager dashboard.</p>
              </div>
              <button
                className="primary-button inline"
                onClick={() => setShowOrders((current) => !current)}
              >
                {showOrders ? 'Hide Orders' : 'View Orders'}
              </button>
            </div>

            {showOrders && (
              <>
                <div className="manager-order-controls">
                  <input
                    value={orderFilters.search}
                    onChange={(e) => setOrderFilters((prev) => ({ ...prev, search: e.target.value }))}
                    placeholder="Search by order number or item"
                    aria-label="Search orders"
                  />
                  <select
                    value={orderFilters.status}
                    onChange={(e) => setOrderFilters((prev) => ({ ...prev, status: e.target.value }))}
                    aria-label="Filter order status"
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select
                    value={orderFilters.sort}
                    onChange={(e) => setOrderFilters((prev) => ({ ...prev, sort: e.target.value }))}
                    aria-label="Sort orders"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="totalHigh">Highest total</option>
                    <option value="totalLow">Lowest total</option>
                    <option value="status">Active first</option>
                  </select>
                  <button className="secondary-button inline" onClick={loadOrders} disabled={ordersLoading}>
                    Search Orders
                  </button>
                </div>

                <div className="table-wrap">
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
                        <tr><td className="empty-cell" colSpan="6">{ordersLoading ? 'Loading orders...' : 'No matching orders.'}</td></tr>
                      ) : orders.map((order) => (
                        <tr key={order.orderNum}>
                          <td>{order.orderNum}</td>
                          <td>{formatOrderDate(order.orderTime)}</td>
                          <td><span className="pill">{order.complete ? 'Completed' : 'Active'}</span></td>
                          <td>{order.items || '—'}</td>
                          <td>{order.notes || '—'}</td>
                          <td>{currency(order.totalCost || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </PageShell>
  );
}
