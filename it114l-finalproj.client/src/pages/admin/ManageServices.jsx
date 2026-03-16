import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

const emptyForm = { serviceName: '', description: '', price: '' };

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/services').then((r) => setServices(r.data));
  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editing) {
        await api.put(`/services/${editing}`, payload);
        setEditing(null);
      } else {
        await api.post('/services', payload);
      }
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving service.');
    }
  };

  const startEdit = (s) => {
    setEditing(s.serviceID);
    setForm({ serviceName: s.serviceName, description: s.description, price: s.price.toString() });
  };

  const cancelEdit = () => { setEditing(null); setForm(emptyForm); };

  const deleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <AdminLayout title="Services">
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">{editing ? 'Edit Service' : 'Add Service'}</div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Service Name</label>
              <input name="serviceName" value={form.serviceName} onChange={handleChange} placeholder="e.g. Teeth Cleaning" required />
            </div>
            <div className="form-group">
              <label>Price (₱)</label>
              <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} placeholder="0.00" required />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <input name="description" value={form.description} onChange={handleChange} placeholder="Brief description of the service" required />
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary">{editing ? 'Update Service' : 'Add Service'}</button>
            {editing && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Description</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && (
              <tr><td colSpan={4} className="table-empty">No services added yet.</td></tr>
            )}
            {services.map((s) => (
              <tr key={s.serviceID}>
                <td>{s.serviceName}</td>
                <td>{s.description}</td>
                <td>₱{s.price.toFixed(2)}</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(s)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteService(s.serviceID)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
