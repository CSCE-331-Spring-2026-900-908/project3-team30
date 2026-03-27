import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import PageShell from '../components/PageShell';
import { api } from '../services/api';

export default function RestockReportPage() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.getRestockItems().then(setRows); }, []);

  return (
    <PageShell title="Restock Report" subtitle="Items below minimum stock threshold" actions={<Link className="ghost-link" to="/manager/reports">Back to sales & trends</Link>}>
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
