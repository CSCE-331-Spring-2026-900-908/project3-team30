import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardChartCard from '../components/DashboardChartCard';
import ManagerLayout from '../components/ManagerLayout';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { currency } from '../utils/format';
import { formatOrderDate, getBrowserTimeZone } from '../utils/time';

export default function ManagerDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState({ hourlySales: [], categorySales: [], topItems: [] });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('Loading manager dashboard...');
  const hasLoadedDashboard = useRef(false);
  const { user, setManagerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauth = params.get('oauth');

    if (oauth === 'success') {
      setManagerUser();
      if (!hasLoadedDashboard.current) {
        hasLoadedDashboard.current = true;
        loadDashboard();
      }

      navigate('/manager', { replace: true });
      return;
    }

    if (!user || user.role !== 'manager') {
      navigate('/', { replace: true });
      return;
    }

    if (!hasLoadedDashboard.current) {
      hasLoadedDashboard.current = true;
      loadDashboard();
    }
  }, [location.search, user, setManagerUser, navigate]);

  async function loadDashboard() {
    setLoading(true);
    setFeedback('Loading manager dashboard...');
    try {
      const timeZone = getBrowserTimeZone();
      const [summaryData, insightData, orderData] = await Promise.all([
        api.getManagerSummary(timeZone),
        api.getManagerInsights(timeZone),
        api.getManagerOrders({ status: 'all', sort: 'newest', timeZone })
      ]);
      setSummary(summaryData);
      setInsights({
        hourlySales: insightData.hourlySales ?? [],
        categorySales: insightData.categorySales ?? [],
        topItems: insightData.topItems ?? []
      });
      setRecentOrders(orderData.slice(0, 5));
      setFeedback('Dashboard updated successfully.');
    } catch (err) {
      console.log('manager dashboard failed', err);
      setFeedback(`Could not refresh dashboard: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ManagerLayout
      title="Manager Dashboard"
      subtitle="Today's store performance at a glance."
      actions={
        <button className="secondary-button" onClick={loadDashboard} disabled={loading}>Refresh dashboard</button>
      }
    >
      <div className="manager-page-stack">
        <div className="feedback-banner" role="status" aria-live="polite">
          {feedback || 'Ready.'}
        </div>

        <section className="stat-grid manager-stat-grid" aria-label="Manager summary metrics">
          <StatCard label="Orders Today" value={summary?.ordersToday ?? '—'} />
          <StatCard label="Revenue Today" value={summary ? currency(summary.revenueToday) : '—'} />
          <StatCard label="Top Item" value={summary?.topItem ?? '—'} />
          <StatCard label="Active Employees" value={summary?.activeEmployees ?? '—'} />
        </section>

        <section className="dashboard-graph-grid" aria-label="Manager dashboard charts">
          <DashboardChartCard
            title="Revenue by Hour"
            data={insights.hourlySales}
            valueKey="revenue"
            labelFormatter={(hour) => `${hour}:00`}
          />
          <DashboardChartCard title="Sales by Category" data={insights.categorySales} valueKey="revenue" />
          <DashboardChartCard title="Top Items" data={insights.topItems} valueKey="orders" />
        </section>

        <section className="manager-dashboard-grid">
          <article className="card recent-orders-card manager-full-width-panel">
            <div className="dashboard-card-heading">
              <div>
                <h2>Recent Orders</h2>
                {/* <p className="subtle">Newest orders from the order system.</p> */}
              </div>
              <Link className="ghost-link" to="/manager/orders">View all</Link>
            </div>

            <div className="recent-order-list">
              {recentOrders.length === 0 ? (
                <p className="subtle">No recent orders to show.</p>
              ) : recentOrders.map((order) => (
                <div className="recent-order-row" key={order.orderNum}>
                  <div>
                    <strong>Order #{order.orderNum}</strong>
                    <span>{formatOrderDate(order.orderTime)}</span>
                  </div>
                  <span className={`pill ${order.complete ? 'status-completed' : 'status-active'}`}>
                    {order.complete ? 'Completed' : 'Active'}
                  </span>
                  <strong>{currency(order.totalCost || 0)}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </ManagerLayout>
  );
}
