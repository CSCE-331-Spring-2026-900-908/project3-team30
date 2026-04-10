import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { currency } from '../utils/format';

export default function XReportPage() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getXReport()
      .then((data) => {
        console.log('X report data:', data);
        setReport(data);
      })
      .catch((err) => {
        console.error('Failed to load X report:', err);
        setError(err.message);
      });
  }, []);

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleString();
  };

  return (
    <PageShell
      title="X Report"
      subtitle={
        report
          ? `LIVE REPORT (as of ${formatTime(report.runAt)})`
          : 'Loading...'
      }
      actions={<Link className="ghost-link" to="/manager/reports">Back to sales & trends</Link>}
    >
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section className="stat-grid">
        <StatCard label="Total Cash" value={report ? currency(report.totalCash) : '—'} />
        <StatCard label="Total Card" value={report ? currency(report.totalCard) : '—'} />
        <StatCard label="Sales" value={report?.numSales ?? '—'} />
        <StatCard label="Cancelled / Voided" value={report ? `${report.numCancelled} / ${report.numVoided}` : '—'} />
        <StatCard label="Net Total" value={report ? currency(report.netTotal) : '—'} />
      </section>
    </PageShell>
  );
}