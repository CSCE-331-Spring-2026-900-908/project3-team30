import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import ManagerLayout from '../components/ManagerLayout';
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
    <ManagerLayout
      title="Restock Report"
      subtitle="Items below minimum stock threshold"
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
    </ManagerLayout>
  );
}