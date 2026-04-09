import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import PageShell from '../components/PageShell';
import { api } from '../services/api';

export default function RestockReportPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getRestockReport()
      .then((data) => {
        console.log('Restock report data:', data);
        setRows(data);
      })
      .catch((err) => {
        console.error('Failed to load restock report:', err);
        setError(err.message);
      });
  }, []);

  return (
    <PageShell
      title="Restock Report"
      subtitle="Items below minimum stock threshold"
      actions={<Link className="ghost-link" to="/manager/reports">Back to sales & trends</Link>}
    >
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <DataTable
        columns={[
          { key: 'sku', label: 'SKU' },
          { key: 'name', label: 'Name' },
          { key: 'amtInStock', label: 'Current Stock' },
          { key: 'minStockNeeded', label: 'Minimum Needed' },
        ]}
        rows={rows}
      />
    </PageShell>
  );
}