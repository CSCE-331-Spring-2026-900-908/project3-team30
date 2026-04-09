import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { currency } from '../utils/format';

export default function ZReportPage() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleString();
  };

  const loadLatestZReport = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const data = await api.getLatestZReport();
      setReport(data);
    } catch (err) {
      console.error('Failed to load latest Z report:', err);
      setError(err.message || 'Failed to load latest Z report');
    } finally {
      setLoading(false);
    }
  };

  const generateZReport = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const data = await api.getZReport();

      console.log('Z report response:', data);

      setReport(data);

      if (data?.newlyGenerated) {
        setMessage('Z report generated successfully');
      } else {
        setMessage('Unable to generate: Z report has already been generated for today');
      }

    } catch (err) {
      console.error('Failed to generate Z report:', err);
      setError(err.message || 'Failed to generate Z report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatestZReport();
  }, []);

  return (
    <PageShell
      title="Z Report"
      subtitle={
        report
          ? `${report.newlyGenerated ? 'New report generated at' : 'Last generated at'}: ${formatTime(report.runAt)}`
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
            onClick={generateZReport}
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
            {loading ? 'Working...' : 'Generate Report'}
          </button>
        </div>
      }
    >
      {message && (
        <p
          style={{
            color: message.toLowerCase().includes('unable') ? '#b91c1c' : '#15803d',
            marginBottom: '1rem',
            fontWeight: 600,
          }}
        >
          {message}
        </p>
      )}

      {error && (
        <p
          style={{
            color: '#b91c1c',
            marginBottom: '1rem',
            fontWeight: 600,
          }}
        >
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