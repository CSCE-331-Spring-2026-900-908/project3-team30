import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { useAuth } from '../context/AuthContext';

export default function CashierDashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <PageShell
      title="Cashier Dashboard"
      subtitle="Web version of cashierDashboard.fxml"
      actions={<button className="secondary-button" onClick={() => { logout(); navigate('/login'); }}>Log out</button>}
    >
      <section className="quick-grid two-col">
        <Link className="quick-link card" to="/cashier/menu">Menu</Link>
        <Link className="quick-link card" to="/cashier/checkout">Checkout</Link>
      </section>
    </PageShell>
  );
}
