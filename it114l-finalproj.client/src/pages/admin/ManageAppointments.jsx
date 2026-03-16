import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

const STATUSES = ['Pending', 'Approved', 'Completed', 'Cancelled'];

const badgeClass = (status) => ({
  Pending:   'badge badge-pending',
  Approved:  'badge badge-approved',
  Completed: 'badge badge-completed',
  Cancelled: 'badge badge-cancelled',
}[status] ?? 'badge');

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    const [a, d, s] = await Promise.all([
      api.get('/appointments'),
      api.get('/dentists'),
      api.get('/services'),
    ]);
    setAppointments(a.data);
    setDentists(d.data);
    setServices(s.data);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (appt) => {
    setEditing(appt.appointmentID);
    setEditForm({
      dentistID: appt.dentistID,
      serviceID: appt.serviceID,
      appointmentDate: appt.appointmentDate.split('T')[0],
      appointmentTime: appt.appointmentTime.substring(0, 5),
      status: appt.status,
    });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/appointments/${id}`, {
        ...editForm,
        dentistID: Number(editForm.dentistID),
        serviceID: Number(editForm.serviceID),
        appointmentTime: editForm.appointmentTime + ':00',
      });
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    }
  };

  const quickStatusChange = async (appt, newStatus) => {
    setUpdatingStatus(appt.appointmentID);
    try {
      await api.put(`/appointments/${appt.appointmentID}`, {
        dentistID: appt.dentistID,
        serviceID: appt.serviceID,
        appointmentDate: appt.appointmentDate.split('T')[0],
        appointmentTime: appt.appointmentTime.substring(0, 8),
        status: newStatus,
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteAppt = async (id) => {
    if (!confirm('Delete this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <AdminLayout title="Appointments">
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Dentist</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && (
              <tr><td colSpan={8} className="table-empty">No appointments found.</td></tr>
            )}
            {appointments.map((a) => (
              <tr key={a.appointmentID}>
                {editing === a.appointmentID ? (
                  <>
                    <td>{a.appointmentID}</td>
                    <td>{a.patientFirstName} {a.patientLastName}</td>
                    <td>
                      <select value={editForm.dentistID} onChange={(e) => setEditForm({ ...editForm, dentistID: e.target.value })}>
                        {dentists.map((d) => <option key={d.dentistID} value={d.dentistID}>Dr. {d.firstName} {d.lastName}</option>)}
                      </select>
                    </td>
                    <td>
                      <select value={editForm.serviceID} onChange={(e) => setEditForm({ ...editForm, serviceID: e.target.value })}>
                        {services.map((s) => <option key={s.serviceID} value={s.serviceID}>{s.serviceName}</option>)}
                      </select>
                    </td>
                    <td><input type="date" value={editForm.appointmentDate} onChange={(e) => setEditForm({ ...editForm, appointmentDate: e.target.value })} /></td>
                    <td><input type="time" value={editForm.appointmentTime} onChange={(e) => setEditForm({ ...editForm, appointmentTime: e.target.value })} /></td>
                    <td>
                      <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-primary btn-sm" onClick={() => saveEdit(a.appointmentID)}>Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{a.appointmentID}</td>
                    <td>{a.patientFirstName} {a.patientLastName}</td>
                    <td>Dr. {a.dentistFirstName} {a.dentistLastName}</td>
                    <td>{a.serviceName}</td>
                    <td>{a.appointmentDate.split('T')[0]}</td>
                    <td>{a.appointmentTime.substring(0, 5)}</td>
                    <td>
                      <select
                        className={badgeClass(a.status)}
                        value={a.status}
                        disabled={updatingStatus === a.appointmentID}
                        onChange={(e) => quickStatusChange(a, e.target.value)}
                        style={{ border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                      >
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(a)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteAppt(a.appointmentID)}>Delete</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
