import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const tiles = [
  { to: '/admin/appointments', icon: '📋', label: 'Appointments',  desc: 'View and manage all appointments' },
  { to: '/admin/dentists',     icon: '🦷', label: 'Dentists',      desc: 'Add, edit, or remove dentists' },
  { to: '/admin/services',     icon: '🩺', label: 'Services',      desc: 'Manage dental services offered' },
  { to: '/admin/patients',     icon: '👥', label: 'Patients',      desc: 'Browse registered patients' },
];

export default function Dashboard() {
  return (
    <AdminLayout title="Dashboard">
      <p className="text-muted" style={{ marginBottom: 28 }}>
        Welcome back. Select a section to get started.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {tiles.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            style={{ textDecoration: 'none' }}
          >
            <div className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{tile.icon}</div>
              <h3 style={{ marginBottom: 4 }}>{tile.label}</h3>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>{tile.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
