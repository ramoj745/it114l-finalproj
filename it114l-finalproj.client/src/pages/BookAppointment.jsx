import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const initialForm = {
  firstName: '',
  lastName: '',
  contactNumber: '',
  email: '',
  dentistID: '',
  serviceID: '',
  appointmentDate: '',
  appointmentTime: '',
};

export default function BookAppointment() {
  const [dentists, setDentists] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dentists').then((r) => setDentists(r.data));
    api.get('/services').then((r) => setServices(r.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/appointments', {
        firstName: form.firstName,
        lastName: form.lastName,
        contactNumber: form.contactNumber,
        email: form.email,
        dentistID: Number(form.dentistID),
        serviceID: Number(form.serviceID),
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime + ':00',
      });
      setSuccess('Your appointment has been booked! We will confirm it shortly.');
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-page">
      <div className="public-card public-card-wide">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1 style={{ marginBottom: 4 }}>Book an Appointment</h1>
        <p style={{ marginBottom: 24 }}>Fill in your details and we'll get you scheduled.</p>

        {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}
        {error   && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-section-title">Personal Information</div>

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Juan" required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Dela Cruz" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contact Number</label>
              <input name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="09XXXXXXXXX" maxLength={11} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" required />
            </div>
          </div>

          <div className="form-section-title">Appointment Details</div>

          <div className="form-group">
            <label>Dentist</label>
            <select name="dentistID" value={form.dentistID} onChange={handleChange} required>
              <option value="">Select a dentist</option>
              {dentists.map((d) => (
                <option key={d.dentistID} value={d.dentistID}>
                  Dr. {d.firstName} {d.lastName} — {d.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Service</label>
            <select name="serviceID" value={form.serviceID} onChange={handleChange} required>
              <option value="">Select a service</option>
              {services.map((s) => (
                <option key={s.serviceID} value={s.serviceID}>
                  {s.serviceName} — ₱{s.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Preferred Date</label>
              <input name="appointmentDate" type="date" value={form.appointmentDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Preferred Time</label>
              <input name="appointmentTime" type="time" value={form.appointmentTime} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}
