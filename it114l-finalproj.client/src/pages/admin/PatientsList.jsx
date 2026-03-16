import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

export default function PatientsList() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    api.get('/patients').then((r) => setPatients(r.data));
  }, []);

  return (
    <AdminLayout title="Patients">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Registered</th>
              <th>History</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 && (
              <tr><td colSpan={6} className="table-empty">No patients registered yet.</td></tr>
            )}
            {patients.map((p) => (
              <tr key={p.patientID}>
                <td>{p.patientID}</td>
                <td>{p.firstName} {p.lastName}</td>
                <td>{p.contactNumber}</td>
                <td>{p.email}</td>
                <td>{new Date(p.dateCreated).toLocaleDateString()}</td>
                <td>
                  <Link to={`/admin/patients/${p.patientID}/history`} className="btn btn-secondary btn-sm">
                    View History
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
