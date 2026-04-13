import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import PageShell from '../components/PageShell';
import { api } from '../services/api';
import { currency } from '../utils/format';

const emptyForm = {
  sku: '',
  name: '',
  retailPrice: '',
  category: '',
  amtInStock: '',
  minStockNeeded: '',
  unitOfMeasurement: ''
};

export default function InventoryPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);

  const load = () =>
    api.getInventory()
      .then((data) => {
        console.log('Inventory loaded:', data);
        setRows(data);
      })
      .catch((err) => {
        console.error('Failed to load inventory:', err);
        setRows([]);
      });

  useEffect(() => {
    load();
  }, []);

  const handleRowClick = (row) => {
    setForm({
      sku: row.sku ?? '',
      name: row.name ?? '',
      retailPrice: row.retailPrice ?? '',
      category: row.category ?? '',
      amtInStock: row.amtInStock ?? '',
      minStockNeeded: row.minStockNeeded ?? '',
      unitOfMeasurement: row.unitOfMeasurement ?? ''
    });
    setIsEditing(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      console.log('Saving inventory form:', form, 'isEditing:', isEditing);

      if (isEditing) {
        await api.updateInventoryItem(form);
      } else {
        await api.createInventoryItem(form);
      }

      setForm(emptyForm);
      setIsEditing(false);
      await load();
    } catch (err) {
      console.error('Failed to save inventory item:', err);
      alert(err.message || 'Failed to save inventory item');
    }
  };

  const handleDelete = async () => {
    try {
      if (!form.sku) return;

      await api.deleteInventoryItem(form.sku);
      setForm(emptyForm);
      setIsEditing(false);
      await load();
    } catch (err) {
      console.error('Failed to delete inventory item:', err);
      alert(err.message || 'Failed to delete inventory item');
    }
  };

  const handleClear = () => {
    setForm(emptyForm);
    setIsEditing(false);
  };

  return (
    <PageShell title="Inventory" actions={<Link className="ghost-link" to="/manager">Back to dashboard</Link>}>
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
          onRowClick={handleRowClick}
        />

        <div className="card form-card">
          <h2>{isEditing ? 'Edit Inventory Item' : 'New Inventory Item'}</h2>

          {['sku', 'name', 'retailPrice', 'category', 'amtInStock', 'minStockNeeded', 'unitOfMeasurement'].map((field) => (
            <FormField key={field} label={field.replace(/([A-Z])/g, ' $1')}>
              <input
                value={form[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                disabled={isEditing && field === 'sku'}
              />
            </FormField>
          ))}

          <div className="inline-actions">
            <button className="primary-button inline" onClick={handleSave}>
              {isEditing ? 'Update' : 'Add'}
            </button>

            <button
              className="secondary-button inline"
              disabled={!form.sku || !isEditing}
              onClick={handleDelete}
            >
              Remove
            </button>

            <button className="secondary-button inline" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}