import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { currency } from '../utils/format';

export default function ZReportPage() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFresh, setIsFresh] = useState(false);

  const loadZReport = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getZReport();

      setReport(data);
      setIsFresh(true); // THIS tells us it's newly generated
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleString();
  };

  useEffect(() => {
    loadZReport();
  }, []);

  return (
    <PageShell
      title="Z Report"
      subtitle={
        report
          ? `${report.isNew ? 'NEW REPORT' : 'OLD REPORT'} (generated at: ${formatTime(report.runAt)})`
          : 'Loading...'
      }
      actions={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <Link className="ghost-link" to="/manager/reports">
            Back to sales & trends
          </Link>

          <button
            type="button"
            onClick={loadZReport}
            disabled={loading}
            style={{
              background: loading ? '#6b7280' : '#5b21b6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 6px 16px rgba(91, 33, 182, 0.28)',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      }
    >
      {error && (
        <p style={{ color: '#b91c1c', marginBottom: '1rem', fontWeight: 600 }}>
          {error}
        </p>
      )}

      <section className="stat-grid">
        <StatCard label="Total Cash" value={report ? currency(report.totalCash) : '—'} />
        <StatCard label="Total Card" value={report ? currency(report.totalCard) : '—'} />
        <StatCard label="Sales" value={report?.numSales ?? '—'} />
        <StatCard
          label="Cancelled / Voided"
          value={report ? `${report.numCancelled} / ${report.numVoided}` : '—'}
        />
        <StatCard label="Net Total" value={report ? currency(report.netTotal) : '—'} />
      </section>
    </PageShell>
  );
}