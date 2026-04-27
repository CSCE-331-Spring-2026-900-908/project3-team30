import { Link } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout';

export default function SalesAndTrendsPage() {
  return (
    <ManagerLayout title="Sales & Trends">
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
    </ManagerLayout>
  );
}