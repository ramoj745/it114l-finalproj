import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

const STATUSES = ['Pending', 'Approved', 'Completed', 'Cancelled'];

const badgeClass = (status) => ({
    Pending: 'badge badge-pending',
    Approved: 'badge badge-approved',
    Completed: 'badge badge-completed',
    Cancelled: 'badge badge-cancelled',
}[status] ?? 'badge');

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

export default function ManageAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [dentists, setDentists] = useState([]);
    const [services, setServices] = useState([]);
    const [editing, setEditing] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dentistFilter, setDentistFilter] = useState('');

    const showSuccess = (message) => {
        setSuccess(message);
        setError('');
        setTimeout(() => setSuccess(''), 3000);
    };

    const showError = (message) => {
        setError(message);
        setSuccess('');
        setTimeout(() => setError(''), 4000);
    };

    const load = async () => {
        try {
            setLoading(true);

            const [a, d, s] = await Promise.all([
                api.get('/appointments'),
                api.get('/dentists'),
                api.get('/services'),
            ]);

            setAppointments(a.data);
            setDentists(d.data);
            setServices(s.data);
            setError('');
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to load appointments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

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

    const cancelEdit = () => {
        setEditing(null);
        setEditForm({});
    };

    const saveEdit = async (id) => {
        try {
            setSavingEdit(true);

            await api.put(`/appointments/${id}`, {
                ...editForm,
                dentistID: Number(editForm.dentistID),
                serviceID: Number(editForm.serviceID),
                appointmentTime: editForm.appointmentTime + ':00',
            });

            setEditing(null);
            setEditForm({});
            showSuccess('Appointment updated successfully.');
            load();
        } catch (err) {
            showError(err.response?.data?.message || 'Update failed.');
        } finally {
            setSavingEdit(false);
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

            if (newStatus === 'Approved') {
                showSuccess('Appointment approved and email sent successfully.');
            } else {
                showSuccess(`Appointment status changed to ${newStatus}.`);
            }

            load();
        } catch (err) {
            showError(err.response?.data?.message || 'Status update failed.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const deleteAppt = async (id) => {
        if (!confirm('Delete this appointment?')) return;

        try {
            setDeletingId(id);
            await api.delete(`/appointments/${id}`);
            showSuccess('Appointment deleted successfully.');
            load();
        } catch (err) {
            showError(err.response?.data?.message || 'Delete failed.');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredAppointments = appointments.filter((a) => {
        const patientFullName = `${a.patientFirstName} ${a.patientLastName}`.toLowerCase();
        const dentistFullName = `Dr. ${a.dentistFirstName} ${a.dentistLastName}`;

        const matchesSearch = patientFullName.includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || a.status === statusFilter;
        const matchesDentist = !dentistFilter || dentistFullName === dentistFilter;

        return matchesSearch && matchesStatus && matchesDentist;
    });

    return (
        <AdminLayout title="Appointments">
            {success && (
                <div
                    className="alert"
                    style={{
                        marginBottom: 16,
                        backgroundColor: '#e8f7ee',
                        color: '#1f7a3d',
                        border: '1px solid #b7e4c7',
                        padding: '12px 16px',
                        borderRadius: 8,
                        fontWeight: 600,
                    }}
                >
                    {success}
                </div>
            )}

            {error && (
                <div
                    className="alert alert-error"
                    style={{
                        marginBottom: 16,
                        backgroundColor: '#fdeaea',
                        color: '#b42318',
                        border: '1px solid #f5c2c7',
                        padding: '12px 16px',
                        borderRadius: 8,
                        fontWeight: 600,
                    }}
                >
                    {error}
                </div>
            )}

            {loading ? (
                <div
                    style={{
                        padding: '24px',
                        background: '#fff',
                        borderRadius: 12,
                        textAlign: 'center',
                        fontWeight: 600,
                    }}
                >
                    Loading appointments...
                </div>
            ) : (
                <>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1.8fr 0.9fr 0.9fr',
                            gap: 12,
                            marginBottom: 12,
                            alignItems: 'center',
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Search patient name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                margin: 0,
                                width: '100%',
                                boxSizing: 'border-box',
                            }}
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                margin: 0,
                                width: '100%',
                                boxSizing: 'border-box',
                            }}
                        >
                            <option value="">All Statuses</option>
                            {STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>

                        <select
                            value={dentistFilter}
                            onChange={(e) => setDentistFilter(e.target.value)}
                            style={{
                                margin: 0,
                                width: '100%',
                                boxSizing: 'border-box',
                            }}
                        >
                            <option value="">All Dentists</option>
                            {[...new Set(
                                appointments.map((a) => `Dr. ${a.dentistFirstName} ${a.dentistLastName}`)
                            )].map((dentist) => (
                                <option key={dentist} value={dentist}>
                                    {dentist}
                                </option>
                            ))}
                        </select>
                    </div>

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
                                    <th>Code</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredAppointments.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="table-empty">
                                            No matching appointments found.
                                        </td>
                                    </tr>
                                )}

                                {filteredAppointments.map((a, index) => (
                                    <tr key={a.appointmentID}>
                                        {editing === a.appointmentID ? (
                                            <>
                                                <td>{index + 1}</td>
                                                <td>{a.patientFirstName} {a.patientLastName}</td>

                                                <td>
                                                    <select
                                                        value={editForm.dentistID}
                                                        disabled={savingEdit}
                                                        onChange={(e) =>
                                                            setEditForm({ ...editForm, dentistID: e.target.value })
                                                        }
                                                    >
                                                        {dentists.map((d) => (
                                                            <option key={d.dentistID} value={d.dentistID}>
                                                                Dr. {d.firstName} {d.lastName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>

                                                <td>
                                                    <select
                                                        value={editForm.serviceID}
                                                        disabled={savingEdit}
                                                        onChange={(e) =>
                                                            setEditForm({ ...editForm, serviceID: e.target.value })
                                                        }
                                                    >
                                                        {services.map((s) => (
                                                            <option key={s.serviceID} value={s.serviceID}>
                                                                {s.serviceName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>

                                                <td>
                                                    <input
                                                        type="date"
                                                        value={editForm.appointmentDate}
                                                        disabled={savingEdit}
                                                        onChange={(e) =>
                                                            setEditForm({ ...editForm, appointmentDate: e.target.value })
                                                        }
                                                    />
                                                </td>

                                                <td>
                                                    <input
                                                        type="time"
                                                        value={editForm.appointmentTime}
                                                        disabled={savingEdit}
                                                        onChange={(e) =>
                                                            setEditForm({ ...editForm, appointmentTime: e.target.value })
                                                        }
                                                    />
                                                </td>

                                                <td>
                                                    <select
                                                        value={editForm.status}
                                                        disabled={savingEdit}
                                                        onChange={(e) =>
                                                            setEditForm({ ...editForm, status: e.target.value })
                                                        }
                                                    >
                                                        {STATUSES.map((s) => (
                                                            <option key={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </td>

                                                <td>
                                                    {a.confirmationCode ? (
                                                        <span style={{ fontWeight: 600 }}>{a.confirmationCode}</span>
                                                    ) : (
                                                        <span style={{ color: '#98a2b3' }}>—</span>
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="btn-group">
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            disabled={savingEdit}
                                                            onClick={() => saveEdit(a.appointmentID)}
                                                        >
                                                            {savingEdit ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            disabled={savingEdit}
                                                            onClick={cancelEdit}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{index + 1}</td>
                                                <td>{a.patientFirstName} {a.patientLastName}</td>
                                                <td>Dr. {a.dentistFirstName} {a.dentistLastName}</td>
                                                <td>{a.serviceName}</td>
                                                <td>{formatDate(a.appointmentDate)}</td>
                                                <td>{formatTime(a.appointmentTime)}</td>

                                                <td>
                                                    <select
                                                        className={badgeClass(a.status)}
                                                        value={a.status}
                                                        disabled={updatingStatus === a.appointmentID}
                                                        onChange={(e) => quickStatusChange(a, e.target.value)}
                                                        style={{
                                                            border: 'none',
                                                            cursor: updatingStatus === a.appointmentID ? 'not-allowed' : 'pointer',
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem',
                                                        }}
                                                    >
                                                        {STATUSES.map((s) => (
                                                            <option key={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </td>

                                                <td>
                                                    {a.confirmationCode ? (
                                                        <span style={{ fontWeight: 600 }}>{a.confirmationCode}</span>
                                                    ) : (
                                                        <span style={{ color: '#98a2b3' }}>—</span>
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="btn-group">
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            disabled={updatingStatus === a.appointmentID || deletingId === a.appointmentID}
                                                            onClick={() => startEdit(a)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            disabled={updatingStatus === a.appointmentID || deletingId === a.appointmentID}
                                                            onClick={() => deleteAppt(a.appointmentID)}
                                                        >
                                                            {deletingId === a.appointmentID ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}