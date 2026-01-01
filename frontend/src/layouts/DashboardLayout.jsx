import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaUser, FaBuilding, FaUsers, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useState } from 'react';

const DashboardLayout = () => {
    const { user, organization, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: <FaHome /> },
        { label: 'My Profile', path: '/dashboard/profile', icon: <FaUser /> },
        { label: 'Organization', path: '/dashboard/organization', icon: <FaBuilding />, adminOnly: true },
        { label: 'Users', path: '/dashboard/users', icon: <FaUsers />, adminOnly: true },
    ];

    const isAdmin = user?.role === 'admin' || user?.role === 'manager'; // Simple check

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <aside style={{
                width: sidebarOpen ? '260px' : '80px',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-color)',
                transition: 'width 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 50
            }}>
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: '8px' }}></div>
                    {sidebarOpen && <h3 style={{ margin: 0, fontSize: '1.2rem' }}>FinStack</h3>}
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    {navItems.map((item) => {
                        if (item.adminOnly && !isAdmin) return null;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.75rem 1rem',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    background: isActive ? 'var(--accent-primary)' : 'transparent',
                                    borderRadius: '0.5rem',
                                    marginBottom: '0.5rem',
                                    transition: 'all 0.2s',
                                    gap: '12px',
                                    justifyContent: sidebarOpen ? 'flex-start' : 'center'
                                })}
                            >
                                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                {sidebarOpen && <span>{item.label}</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', padding: '0.5rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {user?.first_name?.charAt(0)}
                        </div>
                        {sidebarOpen && (
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{user?.first_name} {user?.last_name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{organization?.name}</div>
                            </div>
                        )}
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary btn-block" style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', gap: '10px' }}>
                        <FaSignOutAlt />
                        {sidebarOpen && 'Logout'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: sidebarOpen ? '260px' : '80px',
                transition: 'margin-left 0.3s ease',
                padding: '2rem'
            }}>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
