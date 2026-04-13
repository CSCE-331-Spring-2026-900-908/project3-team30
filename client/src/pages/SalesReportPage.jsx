import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import DataTable from '../components/DataTable';
import { api } from '../services/api';

export default function SalesReportPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');

  const generateReport = async () => {
    if (!startDate || !endDate) {
      setStatus('Please select both a start date and end date.');
      return;
    }

    try {
      const data = await api.getSalesReport(startDate, endDate);
      setRows(data);
      setStatus('');
    } catch (error) {
      console.error(error);
      setStatus(error.message || 'Failed to load sales report.');
    }
  };

  const totalRevenue = rows.reduce((sum, row) => sum + Number(row.revenue), 0);

  return (
    <PageShell
      title="Sales Report"
      actions={<Link className="ghost-link" to="/manager/reports">Back to sales & trends</Link>}
    >
      <div className="card form-card" style={{ marginBottom: '1.5rem' }}>
        <h2>Select a start and end date, then click Generate</h2>

        <div className="inline-actions" style={{ marginTop: '1rem', marginBottom: '1rem', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label>Start:</label><br />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label>End:</label><br />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button className="primary-button" onClick={generateReport}>
            Generate Report
          </button>
        </div>

        {status ? <p>{status}</p> : null}
      </div>

      <DataTable
        columns={[
          { key: 'item', label: 'Item' },
          { key: 'quantitySold', label: 'Quantity Sold' },
          { key: 'revenue', label: 'Revenue' }
        ]}
        rows={rows.map((row) => ({
          ...row,
          revenue: `$${Number(row.revenue).toFixed(2)}`
        }))}
        emptyMessage="No sales data to show."
      />

      <div className="card" style={{ marginTop: '1rem', padding: '1.5rem' }}>
        <strong style={{ fontSize: '1.2rem' }}>Total Revenue:</strong>
        <span style={{ fontSize: '1.4rem', fontWeight: '600', marginLeft: '0.5rem' }}>
          ${totalRevenue.toFixed(2)}
        </span>
      </div>
    </PageShell>
  );
}