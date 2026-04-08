import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import PageShell from '../components/PageShell';
import { api } from '../services/api';

const emptyForm = { code: '', firstName: '', lastName: '', role: 'cashier' };

export default function ManageEmployeesPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');

  const load = () => api.getUsers().then(setUsers);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.code.trim()) {
      setStatus("Enter a code before saving an employee.");
      return;
    }

    if (!form.firstName.trim()) {
      setStatus("Enter a first name before saving an employee.");
      return;
    }

    if (!form.lastName.trim()) {
      setStatus("Enter a last name before saving an employee.");
      return;
    }
    try {
      const codeNumber = Number(form.code);
      const payload = {
        code: codeNumber,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role
      };
      const existingUser = users.find((user) => user.code === codeNumber);
      if (!existingUser) {
        await api.addUser(payload);
        setStatus(`Saved employee ${form.code}.`);
      } else {
        await api.updateUser(payload);
        setStatus(`Updated employee ${form.code}.`);
      }
      setForm(emptyForm);
      await load();
      
    } catch (error) {
      console.error(error);
      setStatus(error.message ||"Failed to save employee.");
    }
  };

  const remove = async () => {
    if (!form.code.trim()) {
      setStatus("Enter a code before removing an employee.");
      return;
    }
    try {
      await api.deleteUser(Number(form.code));
      setStatus(`Removed employee ${form.code}.`);
      setForm(emptyForm);
      await load();
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Failed to remove employee.");
    }
  };

  return (
    <PageShell title="Manage Employees" subtitle="Web version of manageEmployees.fxml" actions={<Link className="ghost-link" to="/manager">Back to dashboard</Link>}>
      <div className="split-layout">
        <DataTable
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'role', label: 'Role' },
          ]}
          rows={users}
          onRowClick={(row) => setForm({ code: row.code, firstName: row.firstName, lastName: row.lastName, role: row.role })}
        />
        <div className="card form-card">
          <h2>Employee Form</h2>
          <FormField label="Code"><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></FormField>
          <FormField label="First Name"><input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></FormField>
          <FormField label="Last Name"><input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></FormField>
          <FormField label="Role">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
            </select>
          </FormField>
          <div className="inline-actions">
            <button className="primary-button inline" onClick={save}>Add / Update</button>
            <button className="secondary-button inline" onClick={remove}>Remove</button>
          </div>
          {status ? <p className="success-text">{status}</p> : null}
        </div>
      </div>
    </PageShell>
  );
}
