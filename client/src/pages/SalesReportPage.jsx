import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { currency } from '../utils/format';

export default function SalesReportPage() {
  const [sales, setSales] = useState(null);
  useEffect(() => { api.getReports().then((data) => setSales(data.sales)); }, []);

  return (
    <PageShell title="Sales Report" subtitle="Web version of salesReport.fxml" actions={<Link className="ghost-link" to="/manager/reports">Back to sales & trends</Link>}>
      <section className="stat-grid">
        <StatCard label="Total Revenue" value={sales ? currency(sales.totalRevenue) : '—'} />
        <StatCard label="Total Orders" value={sales?.totalOrders ?? '—'} />
        <StatCard label="Average Order" value={sales ? currency(sales.avgOrderValue) : '—'} />
        <StatCard label="Best Seller" value={sales?.bestSeller ?? '—'} />
      </section>
    </PageShell>
  );
}
