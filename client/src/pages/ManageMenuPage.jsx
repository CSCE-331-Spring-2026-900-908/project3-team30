import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import PageShell from '../components/PageShell';
import { api } from '../services/api';
import { currency } from '../utils/format';

const emptyForm = { id: null, name: '', price: '', category: '' };

export default function ManageMenuPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const load = () => api.getMenuItems().then(setItems);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.saveMenuItem(form);
    setStatus(`Saved menu item ${form.name}.`);
    setForm(emptyForm);
    load();
  };

  const remove = async () => {
    await api.deleteMenuItem(form.name);
    setStatus(`Removed menu item ${form.name}.`);
    setForm(emptyForm);
    load();
  };

  return (
    <PageShell title="Manage Menu" subtitle="Web version of manageMenu.fxml" actions={<Link className="ghost-link" to="/manager">Back to dashboard</Link>}>
      <div className="split-layout">
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'price', label: 'Price', render: (value) => currency(value) },
            { key: 'category', label: 'Category' },
          ]}
          rows={items}
          onRowClick={(row) => setForm(row)}
        />
        <div className="card form-card">
          <h2>Menu Item Form</h2>
          <FormField label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Price"><input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></FormField>
          <FormField label="Category"><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></FormField>
          <div className="inline-actions">
            <button className="primary-button inline" onClick={save}>Add / Update</button>
            <button className="secondary-button inline" onClick={remove} disabled={!form.name}>Remove</button>
            <button className="secondary-button inline" disabled={!form.name} onClick={() => navigate(`/manager/menu/${encodeURIComponent(form.name)}/ingredients`)}>Edit Ingredients</button>
          </div>
          {status ? <p className="success-text">{status}</p> : null}
        </div>
      </div>
    </PageShell>
  );
}
