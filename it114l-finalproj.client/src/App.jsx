import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import BookAppointment from './pages/BookAppointment';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ManageAppointments from './pages/admin/ManageAppointments';
import ManageDentists from './pages/admin/ManageDentists';
import ManageServices from './pages/admin/ManageServices';
import PatientsList from './pages/admin/PatientsList';
import PatientHistory from './pages/admin/PatientHistory';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/book" element={<BookAppointment />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/appointments"
                        element={
                            <PrivateRoute>
                                <ManageAppointments />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/dentists"
                        element={
                            <PrivateRoute>
                                <ManageDentists />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/services"
                        element={
                            <PrivateRoute>
                                <ManageServices />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/patients"
                        element={
                            <PrivateRoute>
                                <PatientsList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/patients/:id/history"
                        element={
                            <PrivateRoute>
                                <PatientHistory />
                            </PrivateRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;