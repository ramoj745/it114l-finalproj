import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { to: '/admin/appointments', icon: '📋', label: 'Appointments' },
    { to: '/admin/dentists', icon: '🦷', label: 'Dentists' },
    { to: '/admin/services', icon: '🩺', label: 'Services' },
    { to: '/admin/patients', icon: '👥', label: 'Patients' },
];

export default function AdminLayout({ title, children }) {
    const { username, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <img src="/logo.png" alt="Abainza Dental Clinic" className="sidebar-logo-img" />
                    <div className="sidebar-clinic-name">Abainza Dental Clinic</div>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-nav-label">Management</div>

                    <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="nav-icon">⌂</span>
                        Dashboard
                    </NavLink>

                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => isActive ? 'active' : ''}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}

                    <Link to="/" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>
                        Go to Homepage
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <strong>{username}</strong>
                        Admin
                    </div>
                    <button className="btn btn-secondary btn-sm btn-full" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </aside>

            <div className="admin-main">
                <header className="admin-topbar">
                    <h1>{title}</h1>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to="/" className="btn btn-ghost btn-sm">
                            Home
                        </Link>
                        <NavLink to="/admin" className="btn btn-ghost btn-sm">
                            ⌂ Dashboard
                        </NavLink>
                    </div>
                </header>
                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
}