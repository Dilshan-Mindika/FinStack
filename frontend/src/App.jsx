import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DashboardLayout from './layouts/DashboardLayout';
import Profile from './pages/Profile';
import OrgSettings from './pages/OrgSettings';
import UserManagement from './pages/UserManagement';
import BookSetup from './pages/BookSetup';
import Settings from './pages/Settings';
import TaxSettings from './pages/TaxSettings';
import Preferences from './pages/Preferences';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const DashboardHome = () => <div className="card"><h3>Dashboard Home</h3><p>Overview widgets will go here.</p></div>;

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<Profile />} />
        <Route path="organization" element={<OrgSettings />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="setup-book" element={<BookSetup />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/taxes" element={<TaxSettings />} />
        <Route path="settings/preferences" element={<Preferences />} />
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
