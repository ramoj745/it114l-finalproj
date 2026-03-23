import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', form);
            login(res.data);
            navigate('/admin', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="public-page">
            <div className="public-card">
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <img
                        src="/logo.png"
                        alt="Abainza Dental Clinic"
                        style={{
                            height: 80,
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto 12px'
                        }}
                    />
                    <h1 style={{ fontSize: '1.5rem', marginTop: 8 }}>Admin Login</h1>
                    <p style={{ marginTop: 4, fontSize: '0.875rem' }}>
                        Abainza Dental Clinic
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Enter username"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        style={{ marginTop: 8 }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}