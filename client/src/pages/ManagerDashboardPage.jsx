import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { currency } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function ManagerDashboardPage() {
  const [summary, setSummary] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getManagerSummary().then(setSummary);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <PageShell
      title="Manager Dashboard"
      actions={<button className="secondary-button" onClick={handleLogout}>Log out</button>}
    >
      <section className="stat-grid">
        <StatCard label="Orders Today" value={summary?.ordersToday ?? '—'} />
        <StatCard label="Revenue Today" value={summary ? currency(summary.revenueToday) : '—'} />
        <StatCard label="Top Item" value={summary?.topItem ?? '—'} />
        <StatCard label="Active Employees" value={summary?.activeEmployees ?? '—'} />
      </section>

      <section className="quick-grid">
        <Link className="quick-link card" to="/manager/employees">Manage Employees</Link>
        <Link className="quick-link card" to="/manager/menu">Manage Menu</Link>
        <Link className="quick-link card" to="/manager/inventory">Inventory</Link>
        <Link className="quick-link card" to="/manager/reports">Sales & Trends</Link>
      </section>
    </PageShell>
  );
}
