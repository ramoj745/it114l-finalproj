import { useEffect, useMemo, useState } from 'react';
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

const initialErrors = {
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
    dentistID: '',
    serviceID: '',
    appointmentDate: '',
    appointmentTime: '',
};

const nameRegex = /^[A-Za-zÀ-ÿ\s'-]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputErrorStyle = {
    border: '1px solid #d92d20',
    boxShadow: '0 0 0 3px rgba(217, 45, 32, 0.08)',
};

const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const isSunday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(`${dateString}T00:00:00`);
    return date.getDay() === 0;
};

const isTimeInRange = (time) => {
    if (!time) return false;
    return time >= '08:00' && time <= '18:30';
};

const toTitleCase = (value) => {
    return value
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
        .map((part) =>
            part
                .split(/([-'])/)
                .map((piece) => {
                    if (piece === '-' || piece === "'") return piece;
                    if (!piece) return piece;
                    return piece.charAt(0).toUpperCase() + piece.slice(1);
                })
                .join('')
        )
        .join(' ');
};

const generateTimeOptions = () => {
    const options = [];
    let hour = 8;
    let minute = 0;

    while (hour < 18 || (hour === 18 && minute <= 30)) {
        const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

        const labelDate = new Date(`1970-01-01T${value}:00`);
        const label = labelDate.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        options.push({ value, label });

        minute += 30;
        if (minute === 60) {
            minute = 0;
            hour += 1;
        }
    }

    return options;
};

const getCurrentTimeRoundedUp = () => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    if (minutes > 0 && minutes <= 30) {
        minutes = 30;
    } else if (minutes > 30) {
        minutes = 0;
        hours += 1;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export default function BookAppointment() {
    const [dentists, setDentists] = useState([]);
    const [services, setServices] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [fieldErrors, setFieldErrors] = useState(initialErrors);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [bookedTimes, setBookedTimes] = useState([]);

    const allTimeOptions = useMemo(() => generateTimeOptions(), []);
    const todayString = getTodayString();

    const availableTimeOptions = useMemo(() => {
        let filtered = allTimeOptions;

        if (form.appointmentDate === todayString) {
            const currentRoundedTime = getCurrentTimeRoundedUp();
            filtered = filtered.filter((time) => time.value >= currentRoundedTime);
        }

        return filtered;
    }, [form.appointmentDate, allTimeOptions, todayString]);

    useEffect(() => {
        api.get('/dentists').then((r) => setDentists(r.data));
        api.get('/services').then((r) => setServices(r.data));
    }, []);

    useEffect(() => {
        const loadAvailability = async () => {
            if (!form.dentistID || !form.appointmentDate || isSunday(form.appointmentDate)) {
                setBookedTimes([]);
                return;
            }

            try {
                const response = await api.get('/appointments/availability', {
                    params: {
                        dentistId: form.dentistID,
                        date: form.appointmentDate,
                    },
                });

                setBookedTimes(
                    (response.data || []).map((t) => String(t).slice(0, 5))
                );
            } catch (err) {
                console.error('Failed to load availability:', err);
                setBookedTimes([]);
            }
        };

        loadAvailability();
    }, [form.dentistID, form.appointmentDate]);

    useEffect(() => {
        if (isSunday(form.appointmentDate)) {
            setForm((prev) => ({ ...prev, appointmentTime: '' }));
            setFieldErrors((prev) => ({
                ...prev,
                appointmentTime: 'The clinic is closed on Sundays.',
            }));
        } else {
            setFieldErrors((prev) => ({
                ...prev,
                appointmentTime:
                    prev.appointmentTime === 'The clinic is closed on Sundays.'
                        ? ''
                        : prev.appointmentTime,
            }));
        }
    }, [form.appointmentDate]);

    useEffect(() => {
        if (isSunday(form.appointmentDate)) {
            setForm((prev) => ({ ...prev, appointmentTime: '' }));
            setFieldErrors((prev) => ({
                ...prev,
                appointmentTime: '',
            }));
        } else {
            setFieldErrors((prev) => ({
                ...prev,
                appointmentTime: '',
            }));
        }
    }, [form.appointmentDate]);

    const validateField = (name, value) => {
        switch (name) {
            case 'firstName':
                if (!value.trim()) return 'First name is required.';
                if (value.trim().length < 2) return 'First name must be at least 2 characters.';
                if (!nameRegex.test(value.trim())) return "First name can only contain letters, spaces, ' and -.";
                return '';

            case 'lastName':
                if (!value.trim()) return 'Last name is required.';
                if (value.trim().length < 2) return 'Last name must be at least 2 characters.';
                if (!nameRegex.test(value.trim())) return "Last name can only contain letters, spaces, ' and -.";
                return '';

            case 'contactNumber':
                if (!value.trim()) return 'Contact number is required.';
                if (!/^09\d{9}$/.test(value.trim())) return 'Contact number must be 11 digits and start with 09.';
                return '';

            case 'email':
                if (!value.trim()) return 'Email address is required.';
                if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
                return '';

            case 'dentistID':
                if (!value) return 'Please select a dentist.';
                return '';

            case 'serviceID':
                if (!value) return 'Please select a service.';
                return '';

            case 'appointmentDate':
                if (!value) return 'Please select a preferred date.';
                if (value < getTodayString()) return 'Please select today or a future date.';
                if (isSunday(value)) return 'The clinic is closed on Sundays. Please select another date.';
                return '';

            case 'appointmentTime':
                if (!value) return 'Please select a preferred time.';
                if (!isTimeInRange(value)) return 'Please choose a time between 8:00 AM and 6:30 PM.';
                if (bookedTimes.includes(value)) return 'This time slot is no longer available.';
                if (
                    form.appointmentDate === todayString &&
                    value < getCurrentTimeRoundedUp()
                ) {
                    return 'Please choose a future time for today.';
                }
                return '';

            default:
                return '';
        }
    };

    const validateForm = (currentForm) => {
        const newErrors = {
            firstName: validateField('firstName', currentForm.firstName),
            lastName: validateField('lastName', currentForm.lastName),
            contactNumber: validateField('contactNumber', currentForm.contactNumber),
            email: validateField('email', currentForm.email),
            dentistID: validateField('dentistID', currentForm.dentistID),
            serviceID: validateField('serviceID', currentForm.serviceID),
            appointmentDate: validateField('appointmentDate', currentForm.appointmentDate),
            appointmentTime: validateField('appointmentTime', currentForm.appointmentTime),
        };

        setFieldErrors(newErrors);
        return Object.values(newErrors).every((msg) => !msg);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let nextValue = value;

        if (name === 'contactNumber') {
            nextValue = value.replace(/\D/g, '').slice(0, 11);
        }

        if (name === 'firstName' || name === 'lastName') {
            nextValue = value.replace(/\s{2,}/g, ' ');
        }

        setForm((prev) => ({ ...prev, [name]: nextValue }));
        setFieldErrors((prev) => ({
            ...prev,
            [name]: validateField(name, nextValue),
        }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        let nextValue = value;

        if (name === 'firstName' || name === 'lastName') {
            nextValue = toTitleCase(value.trim());
            setForm((prev) => ({ ...prev, [name]: nextValue }));
        }

        setFieldErrors((prev) => ({
            ...prev,
            [name]: validateField(name, nextValue),
        }));
    };

    const getSubmitErrorMessage = (cleanedForm, errors) => {
        const errorCount = Object.values(errors).filter(Boolean).length;

        if (errorCount > 1) {
            return 'Please review the highlighted fields before submitting.';
        }

        if (!cleanedForm.dentistID && !cleanedForm.serviceID) {
            return 'Please select your preferred dentist and service before submitting.';
        }

        if (!cleanedForm.dentistID) {
            return 'Please select your preferred dentist before submitting.';
        }

        if (!cleanedForm.serviceID) {
            return 'Please select your preferred service before submitting.';
        }

        if (errors.appointmentDate) {
            return errors.appointmentDate;
        }

        if (errors.appointmentTime) {
            return errors.appointmentTime;
        }

        if (errors.contactNumber) {
            return 'Please enter a valid contact number before submitting.';
        }

        if (errors.email) {
            return 'Please enter a valid email address before submitting.';
        }

        return 'Please review the highlighted fields before submitting.';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const cleanedForm = {
            ...form,
            firstName: toTitleCase(form.firstName.trim()),
            lastName: toTitleCase(form.lastName.trim()),
            contactNumber: form.contactNumber.trim(),
            email: form.email.trim(),
        };

        setForm(cleanedForm);

        const isValid = validateForm(cleanedForm);

        if (!isValid) {
            const errors = {
                firstName: validateField('firstName', cleanedForm.firstName),
                lastName: validateField('lastName', cleanedForm.lastName),
                contactNumber: validateField('contactNumber', cleanedForm.contactNumber),
                email: validateField('email', cleanedForm.email),
                dentistID: validateField('dentistID', cleanedForm.dentistID),
                serviceID: validateField('serviceID', cleanedForm.serviceID),
                appointmentDate: validateField('appointmentDate', cleanedForm.appointmentDate),
                appointmentTime: validateField('appointmentTime', cleanedForm.appointmentTime),
            };

            setError(getSubmitErrorMessage(cleanedForm, errors));
            setLoading(false);
            return;
        }

        try {
            await api.post('/appointments', {
                firstName: cleanedForm.firstName,
                lastName: cleanedForm.lastName,
                contactNumber: cleanedForm.contactNumber,
                email: cleanedForm.email,
                dentistID: Number(cleanedForm.dentistID),
                serviceID: Number(cleanedForm.serviceID),
                appointmentDate: cleanedForm.appointmentDate,
                appointmentTime: cleanedForm.appointmentTime + ':00',
            });

            setSuccess('Your appointment has been booked successfully. We will confirm it shortly by email.');
            setError('');
            setForm(initialForm);
            setFieldErrors(initialErrors);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            setSuccess('');
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

                {success && (
                    <div className="alert alert-success" style={{ marginBottom: 16 }}>
                        {success}
                    </div>
                )}

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                <form className="form" onSubmit={handleSubmit} noValidate>
                    <div className="form-section-title">Personal Information</div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Juan"
                                required
                                style={fieldErrors.firstName ? inputErrorStyle : {}}
                            />
                            {fieldErrors.firstName && (
                                <small style={{ color: '#b42318', marginTop: 6, display: 'block' }}>
                                    {fieldErrors.firstName}
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Dela Cruz"
                                required
                                style={fieldErrors.lastName ? inputErrorStyle : {}}
                            />
                            {fieldErrors.lastName && (
                                <small style={{ color: '#b42318', marginTop: 6, display: 'block' }}>
                                    {fieldErrors.lastName}
                                </small>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Contact Number</label>
                            <input
                                name="contactNumber"
                                value={form.contactNumber}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="09XXXXXXXXX"
                                maxLength={11}
                                inputMode="numeric"
                                required
                                style={fieldErrors.contactNumber ? inputErrorStyle : {}}
                            />
                            {fieldErrors.contactNumber && (
                                <small style={{ color: '#b42318', marginTop: 6, display: 'block' }}>
                                    {fieldErrors.contactNumber}
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="you@email.com"
                                required
                                style={fieldErrors.email ? inputErrorStyle : {}}
                            />
                            {fieldErrors.email && (
                                <small style={{ color: '#b42318', marginTop: 6, display: 'block' }}>
                                    {fieldErrors.email}
                                </small>
                            )}
                        </div>
                    </div>

                    <div className="form-section-title">Appointment Details</div>

                    <div className="form-group">
                        <label>Dentist</label>
                        <select
                            name="dentistID"
                            value={form.dentistID}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            style={fieldErrors.dentistID ? inputErrorStyle : {}}
                        >
                            <option value="">Select a dentist</option>
                            {dentists.map((d) => (
                                <option key={d.dentistID} value={d.dentistID}>
                                    Dr. {d.firstName} {d.lastName} — {d.specialization}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.dentistID && (
                            <small style={{ color: '#b42318', marginTop: 6, display: 'block' }}>
                                {fieldErrors.dentistID}
                            </small>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Service</label>
                        <select
                            name="serviceID"
                            value={form.serviceID}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            style={fieldErrors.serviceID ? inputErrorStyle : {}}
                        >
                            <option value="">Select a service</option>
                            {services.map((s) => (
                                <option key={s.serviceID} value={s.serviceID}>
                                    {s.serviceName} — ₱{s.price.toFixed(2)}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.serviceID && (
                            <small style={{ color: '#b42318', marginTop: 6, display: 'block' }}>
                                {fieldErrors.serviceID}
                            </small>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Preferred Date</label>
                            <input
                                name="appointmentDate"
                                type="date"
                                min={getTodayString()}
                                value={form.appointmentDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                style={fieldErrors.appointmentDate ? inputErrorStyle : {}}
                            />
                            {fieldErrors.appointmentDate && (
                                <small style={{ color: '#b42318', marginTop: 6, display: 'block' }}>
                                    {fieldErrors.appointmentDate}
                                </small>
                            )}
                        </div>

                        <div className="form-group">
    <label>Preferred Time</label>
    <select
        name="appointmentTime"
        value={isSunday(form.appointmentDate) ? '' : form.appointmentTime}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        disabled={isSunday(form.appointmentDate)}
        style={fieldErrors.appointmentTime ? inputErrorStyle : {}}
    >
        <option value="">
            {isSunday(form.appointmentDate) ? 'Closed on Sundays' : 'Select a time'}
        </option>
                                {availableTimeOptions.map((time) => {
                                    const isBooked = bookedTimes.includes(time.value);

                                    return (
                                        <option
                                            key={time.value}
                                            value={time.value}
                                            disabled={isBooked}
                                        >
                                            {isBooked ? `${time.label} — Booked` : time.label}
                                        </option>
                                    );
                                })}
    </select>
                            {!isSunday(form.appointmentDate) && fieldErrors.appointmentTime ? (
                                <small style={{ color: '#b42318', marginTop: 6, display: 'block' }}>
                                    {fieldErrors.appointmentTime}
                                </small>
                            ) : !isSunday(form.appointmentDate) ? (
                                <small style={{ color: '#667085', marginTop: 6, marginLeft: 8, display: 'block' }}>
                                    Available from 8:00 AM to 6:30 PM.
                                </small>
                            ) : null}
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