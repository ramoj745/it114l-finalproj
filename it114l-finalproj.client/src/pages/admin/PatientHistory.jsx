import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

const badgeClass = (status) => ({
  Pending:   'badge badge-pending',
  Approved:  'badge badge-approved',
  Completed: 'badge badge-completed',
  Cancelled: 'badge badge-cancelled',
}[status] ?? 'badge');

export default function PatientHistory() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get(`/patients/${id}`).then((r) => setPatient(r.data));
    api.get(`/patients/${id}/history`).then((r) => setHistory(r.data));
  }, [id]);

  return (
    <AdminLayout title="Patient History">
      <Link to="/admin/patients" className="back-link">← Back to Patients</Link>

      {patient && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ marginBottom: 4 }}>{patient.firstName} {patient.lastName}</h2>
          <p style={{ margin: 0 }}>{patient.contactNumber} &nbsp;·&nbsp; {patient.email}</p>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Dentist</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr><td colSpan={6} className="table-empty">No appointment history found.</td></tr>
            )}
            {history.map((a) => (
              <tr key={a.appointmentID}>
                <td>{a.appointmentID}</td>
                <td>Dr. {a.dentistFirstName} {a.dentistLastName}</td>
                <td>{a.serviceName}</td>
                <td>{a.appointmentDate.split('T')[0]}</td>
                <td>{a.appointmentTime.substring(0, 5)}</td>
                <td><span className={badgeClass(a.status)}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
