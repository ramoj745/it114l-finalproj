import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="public-page">
            <div className="home-hero">
                <img src="/logo.png" alt="Abainza Dental Clinic" className="home-logo" />
                <h1 className="clinic-name">Abainza Dental Clinic</h1>
                <p className="clinic-tagline">
                    Quality dental care made easy. Book your appointment online in minutes.
                </p>

                <div className="home-actions">
                    <Link to="/book" className="btn btn-primary">
                        Book an Appointment
                    </Link>

                    <span className="home-divider">or</span>

                    {isAuthenticated ? (
                        <Link to="/admin" className="btn btn-secondary">
                            Admin Dashboard
                        </Link>
                    ) : (
                        <Link to="/admin/login" className="btn btn-secondary">
                            Admin Login
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}