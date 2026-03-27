import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import DataTable from '../components/DataTable';
import { api } from '../services/api';

export default function SalesAndTrendsPage() {
  const [reports, setReports] = useState(null);
  useEffect(() => { api.getReports().then(setReports); }, []);

  return (
    <PageShell title="Sales & Trends" subtitle="Web version of salesAndTrends.fxml" actions={<Link className="ghost-link" to="/manager">Back to dashboard</Link>}>
      <div className="split-layout">
        <div>
          <div className="quick-grid two-col">
            <Link className="quick-link card" to="/manager/reports/sales">Sales Report</Link>
            <Link className="quick-link card" to="/manager/reports/x">X Report</Link>
            <Link className="quick-link card" to="/manager/reports/z">Z Report</Link>
            <Link className="quick-link card" to="/manager/reports/restock">Restock Report</Link>
          </div>
        </div>
        <DataTable
          columns={[
            { key: 'ingredient', label: 'Ingredient' },
            { key: 'totalUsed', label: 'Total Used' },
          ]}
          rows={reports?.productUsage ?? []}
          emptyMessage="Loading product usage…"
        />
      </div>
    </PageShell>
  );
}
