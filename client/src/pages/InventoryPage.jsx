import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import PageShell from '../components/PageShell';
import { api } from '../services/api';
import { currency } from '../utils/format';

const emptyForm = { sku: '', name: '', retailPrice: '', category: '', amtInStock: '', minStockNeeded: '', unitOfMeasurement: '' };

export default function InventoryPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.getInventory().then(setRows);
  useEffect(() => { load(); }, []);

  return (
    <PageShell title="Inventory" subtitle="Web version of inventory.fxml" actions={<Link className="ghost-link" to="/manager">Back to dashboard</Link>}>
      <div className="split-layout">
        <DataTable
          columns={[
            { key: 'sku', label: 'SKU' },
            { key: 'name', label: 'Name' },
            { key: 'retailPrice', label: 'Retail Price', render: (value) => currency(value) },
            { key: 'amtInStock', label: 'In Stock' },
            { key: 'minStockNeeded', label: 'Min Stock' },
          ]}
          rows={rows}
          onRowClick={(row) => setForm(row)}
        />
        <div className="card form-card">
          <h2>Inventory Item</h2>
          {['sku','name','retailPrice','category','amtInStock','minStockNeeded','unitOfMeasurement'].map((field) => (
            <FormField key={field} label={field.replace(/([A-Z])/g, ' $1')}>
              <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
            </FormField>
          ))}
          <div className="inline-actions">
            <button className="primary-button inline" onClick={async () => { await api.saveInventoryItem(form); setForm(emptyForm); load(); }}>Add / Update</button>
            <button className="secondary-button inline" disabled={!form.sku} onClick={async () => { await api.deleteInventoryItem(form.sku); setForm(emptyForm); load(); }}>Remove</button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
