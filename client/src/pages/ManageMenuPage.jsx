import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import ManagerLayout from '../components/ManagerLayout';
import { api } from '../services/api';
import { currency } from '../utils/format';

const emptyForm = { id: null, name: '', price: '', category: '', imageURL: '' };

export default function ManageMenuPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const load = () => api.getMenuDrinks().then(setItems);
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
    <ManagerLayout title="Manage Menu">
      <div className="split-layout">
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'price', label: 'Price', render: (value) => currency(value) },
            { key: 'category', label: 'Category' },
            { key: 'imageURL', label: 'Image', render: (value) => value ? 'Added' : 'Default' },
          ]}
          rows={items}
          onRowClick={(row) => setForm(row)}
        />
        <div className="card form-card">
          <h2>Menu Item Form</h2>
          <FormField label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Price"><input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></FormField>
          <FormField label="Category"><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></FormField>
          <FormField label="Image URL or Public Image Path">
            <input
              placeholder="/images/ThaiMilkTea.png or https://example.com/image.png"
              value={form.imageURL ?? ''}
              onChange={(e) => setForm({ ...form, imageURL: e.target.value })}
            />
          </FormField>
          {form.imageURL ? (
            <div className="menu-image-preview">
              <img src={form.imageURL} alt={`${form.name || 'Menu item'} preview`} />
            </div>
          ) : null}
          <div className="inline-actions">
            <button className="primary-button inline" onClick={save}>Add / Update</button>
            <button className="secondary-button inline" onClick={remove} disabled={!form.name}>Remove</button>
            <button className="secondary-button inline" disabled={!form.name} onClick={() => navigate(`/manager/menu/${encodeURIComponent(form.name)}/ingredients`)}>Edit Ingredients</button>
          </div>
          {status ? <p className="success-text">{status}</p> : null}
        </div>
      </div>
    </ManagerLayout>
  );
}
