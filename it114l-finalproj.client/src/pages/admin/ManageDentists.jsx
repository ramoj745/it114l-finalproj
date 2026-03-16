import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

const emptyForm = { firstName: '', lastName: '', contactNumber: '', email: '', specialization: '' };

export default function ManageDentists() {
  const [dentists, setDentists] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/dentists').then((r) => setDentists(r.data));
  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/dentists/${editing}`, form);
        setEditing(null);
      } else {
        await api.post('/dentists', form);
      }
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving dentist.');
    }
  };

  const startEdit = (d) => {
    setEditing(d.dentistID);
    setForm({ firstName: d.firstName, lastName: d.lastName, contactNumber: d.contactNumber, email: d.email, specialization: d.specialization });
  };

  const cancelEdit = () => { setEditing(null); setForm(emptyForm); };

  const deleteDentist = async (id) => {
    if (!confirm('Delete this dentist?')) return;
    try {
      await api.delete(`/dentists/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <AdminLayout title="Dentists">
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">{editing ? 'Edit Dentist' : 'Add Dentist'}</div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Number</label>
              <input name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="09XXXXXXXXX" maxLength={11} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" required />
            </div>
          </div>
          <div className="form-group">
            <label>Specialization</label>
            <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. General Dentistry, Orthodontics" required />
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary">{editing ? 'Update Dentist' : 'Add Dentist'}</button>
            {editing && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dentists.length === 0 && (
              <tr><td colSpan={5} className="table-empty">No dentists added yet.</td></tr>
            )}
            {dentists.map((d) => (
              <tr key={d.dentistID}>
                <td>Dr. {d.firstName} {d.lastName}</td>
                <td>{d.specialization}</td>
                <td>{d.contactNumber}</td>
                <td>{d.email}</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(d)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteDentist(d.dentistID)}>Delete</button>
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
