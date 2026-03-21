import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

export default function PatientsList() {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    useEffect(() => {
        api.get('/patients').then((r) => setPatients(r.data));
    }, []);

    const filteredPatients = useMemo(() => {
        const search = searchTerm.toLowerCase();

        const filtered = patients.filter((patient) => {
            const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
            const contact = (patient.contactNumber || '').toLowerCase();
            const email = (patient.email || '').toLowerCase();

            return (
                fullName.includes(search) ||
                contact.includes(search) ||
                email.includes(search)
            );
        });

        filtered.sort((a, b) => {
            const dateA = new Date(a.dateCreated).getTime();
            const dateB = new Date(b.dateCreated).getTime();

            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }, [patients, searchTerm, sortOrder]);

    return (
        <AdminLayout title="Patients">
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: 12,
                    marginBottom: 12,
                    alignItems: 'center',
                }}
            >
                <input
                    type="text"
                    placeholder="Search name, contact, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        margin: 0,
                        width: '100%',
                        boxSizing: 'border-box',
                    }}
                />

                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{
                        margin: 0,
                        width: '100%',
                        boxSizing: 'border-box',
                    }}
                >
                    <option value="newest">Newest Registered</option>
                    <option value="oldest">Oldest Registered</option>
                </select>
            </div>

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
                        {filteredPatients.length === 0 && (
                            <tr>
                                <td colSpan={6} className="table-empty">
                                    No matching patients found.
                                </td>
                            </tr>
                        )}

                        {filteredPatients.map((patient, index) => (
                            <tr key={patient.patientID}>
                                <td>{index + 1}</td>
                                <td>{patient.firstName} {patient.lastName}</td>
                                <td>{patient.contactNumber}</td>
                                <td>{patient.email}</td>
                                <td>{new Date(patient.dateCreated).toLocaleDateString()}</td>
                                <td>
                                    <Link
                                        to={`/admin/patients/${patient.patientID}/history`}
                                        className="btn btn-secondary btn-sm"
                                    >
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