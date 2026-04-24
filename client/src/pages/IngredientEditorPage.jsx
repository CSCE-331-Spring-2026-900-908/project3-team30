import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import PageShell from '../components/PageShell';
import { api } from '../services/api';

export default function IngredientEditorPage() {
  const { itemName } = useParams();
  const decoded = decodeURIComponent(itemName);
  const [rows, setRows] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [form, setForm] = useState({ ingredient: '', quantityUsed: '' });
  
  const load = () => api.getIngredientsForMenuItem(decoded).then(setRows);
  const loadAvailable = () => api.getAvailableIngredients().then(setAvailableIngredients);
  
  useEffect(() => { 
    load(); 
    loadAvailable();
  }, [decoded]);
  
  return (
    <PageShell 
      title="Ingredient Editor" 
      subtitle={`Ingredients for ${decoded}`} 
      actions={<Link className="ghost-link" to="/manager/menu">Back to menu manager</Link>}
    >
      <div className="split-layout">
        <div>
          <h3>Current Ingredients </h3>
          <DataTable
            columns={[
              { key: 'ingredient', label: 'Ingredient' },
              { key: 'quantityUsed', label: 'Quantity Used' },
            ]}
            rows={rows}
            onRowClick={(row) => setForm(row)}
          />
          
          <h3 style={{ marginTop: '2rem' }}>Available Ingredients</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'category', label: 'Category' },
              { key: 'unitOfMeasurement', label: 'Unit' },
            ]}
            rows={availableIngredients}
            onRowClick={(row) => setForm({ ingredient: row.name, quantityUsed: '' })}
          />
        </div>
        
        <div className="card form-card">
          <h2>Edit Ingredient Link</h2>
          <FormField label="Ingredient Name">
            <input 
              value={form.ingredient} 
              onChange={(e) => setForm({ ...form, ingredient: e.target.value })} 
            />
          </FormField>
          <FormField label="Quantity Used">
            <input 
              type="number" 
              step="0.01" 
              value={form.quantityUsed} 
              onChange={(e) => setForm({ ...form, quantityUsed: e.target.value })} 
            />
          </FormField>
          <div className="inline-actions">
            <button 
              className="primary-button inline" 
              onClick={async () => { 
                await api.saveIngredientForMenuItem(decoded, form); 
                setForm({ ingredient: '', quantityUsed: '' }); 
                load(); 
              }}
            >
              Add / Update
            </button>
            <button 
              className="secondary-button inline" 
              disabled={!form.ingredient} 
              onClick={async () => { 
                await api.deleteIngredientForMenuItem(decoded, form.ingredient); 
                setForm({ ingredient: '', quantityUsed: '' }); 
                load(); 
              }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}