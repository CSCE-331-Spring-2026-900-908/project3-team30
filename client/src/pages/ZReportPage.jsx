import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { currency } from '../utils/format';

export default function ZReportPage() {
  const [report, setReport] = useState(null);
  useEffect(() => { api.getReports().then((data) => setReport(data.zReport)); }, []);

  return (
    <PageShell title="Z Report" subtitle={`Last run: ${report?.lastRun ?? 'Loading…'}`} actions={<Link className="ghost-link" to="/manager/reports">Back to sales & trends</Link>}>
      <section className="stat-grid">
        <StatCard label="Total Cash" value={report ? currency(report.totalCash) : '—'} />
        <StatCard label="Total Card" value={report ? currency(report.totalCard) : '—'} />
        <StatCard label="Sales" value={report?.numSales ?? '—'} />
        <StatCard label="Cancelled / Voided" value={report ? `${report.numCancelled} / ${report.numVoided}` : '—'} />
      </section>
    </PageShell>
  );
}
