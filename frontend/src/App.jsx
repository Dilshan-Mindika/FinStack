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

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const DashboardPlaceholder = () => {
  const { logout, user, organization } = useAuth();
  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user.first_name}!</p>
      <p>Role: {user.role}</p>
      <p>Organization: {organization ? organization.name : 'None'}</p>
      <button onClick={logout} className="btn btn-secondary">Logout</button>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPlaceholder />
        </ProtectedRoute>
      } />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
