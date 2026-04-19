import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

export default function HappyHourPage() {
  return (
    <PageShell
      title="Sales & Trends"
      actions={<Link className="ghost-link" to="/manager">Back to dashboard</Link>}
    >
      <div className="quick-grid two-col">
        <Link className="quick-link card" to="/manager/reports/sales">
          Sales Report
        </Link>
        <Link className="quick-link card" to="/manager/reports/x">
          X Report
        </Link>
        <Link className="quick-link card" to="/manager/reports/z">
          Z Report
        </Link>
        <Link className="quick-link card" to="/manager/reports/restock">
          Restock Report
        </Link>
      </div>
    </PageShell>
  );
}