import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaUser, FaBuilding, FaUsers, FaSignOutAlt, FaBars, FaSearch, FaBell, FaCog } from 'react-icons/fa';
import { useState } from 'react';

const DashboardLayout = () => {
    const { user, organization, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
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
        { label: 'Settings', path: '/dashboard/settings', icon: <FaCog /> },
    ];

    const isAdmin = user?.role === 'admin' || user?.role === 'manager';

    // Get current page title based on path
    const getPageTitle = () => {
        const currentItem = navItems.find(item => item.path === location.pathname);
        return currentItem ? currentItem.label : 'Dashboard';
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

            {/* Sidebar */}
            <aside style={{
                width: sidebarOpen ? '260px' : '80px',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-color)',
                transition: 'width 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 50
            }}>
                {/* Sidebar Brand */}
                <div style={{
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    padding: sidebarOpen ? '0 1.5rem' : '0',
                    borderBottom: '1px solid var(--border-color)',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        borderRadius: '8px',
                        flexShrink: 0
                    }}></div>
                    {sidebarOpen && <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, letterSpacing: '0.5px' }}>FinStack</h3>}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '1.5rem 1rem', overflowY: 'auto' }}>
                    {navItems.map((item) => {
                        if (item.adminOnly && !isAdmin) return null;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.8rem 1rem',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                                    borderRadius: '0 8px 8px 0',
                                    marginBottom: '0.5rem',
                                    transition: 'all 0.2s',
                                    gap: '12px',
                                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                                    textDecoration: 'none'
                                })}
                            >
                                <span style={{ fontSize: '1.2rem', display: 'flex' }}>{item.icon}</span>
                                {sidebarOpen && <span style={{ fontWeight: 500 }}>{item.label}</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Sidebar Footer (Toggle) */}
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            padding: '0.5rem'
                        }}
                    >
                        <FaBars />
                    </button>
                </div>
            </aside>

            {/* Main Layout Area */}
            <div style={{
                flex: 1,
                marginLeft: sidebarOpen ? '260px' : '80px',
                transition: 'margin-left 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0 // Prevent flex child overflow
            }}>

                {/* Top Header */}
                <header style={{
                    height: '70px',
                    background: 'rgba(24, 27, 33, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 2rem',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40
                }}>
                    {/* Header Left: Page Title or Breadcrumbs */}
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{getPageTitle()}</h2>
                    </div>

                    {/* Header Right: Actions & Profile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {/* Search Bar (Visual Only for now) */}
                        <div style={{
                            position: 'relative',
                            display: 'none', // Hidden on small screens?
                            '@media (min-width: 768px)': { display: 'block' }
                        }}>
                            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                style={{
                                    paddingLeft: '36px',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    width: '240px'
                                }}
                            />
                        </div>

                        {/* Notifications */}
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.1rem', cursor: 'pointer' }}>
                            <FaBell />
                        </button>

                        {/* User Profile */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '1.5rem', borderLeft: '1px solid var(--border-color)' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.first_name} {user?.last_name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{organization?.name}</div>
                            </div>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold'
                            }}>
                                {user?.first_name?.charAt(0)}
                            </div>
                            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', marginLeft: '0.5rem', cursor: 'pointer' }} title="Logout">
                                <FaSignOutAlt />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
