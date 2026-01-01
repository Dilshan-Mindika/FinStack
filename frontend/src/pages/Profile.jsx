import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Profile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone: user?.phone || ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/users/${user.id}`, formData); // Assuming user update endpoint exists
            setMessage('Profile updated successfully');
        } catch (err) {
            console.error(err);
            setMessage('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="mb-4">My Profile</h2>
            <div className="card" style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-4 mb-4">
                        <div style={{ flex: 1 }}>
                            <label>First Name</label>
                            <input
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Last Name</label>
                            <input
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label>Email</label>
                        <input value={user?.email} disabled style={{ opacity: 0.7 }} />
                    </div>
                    <div className="mb-4">
                        <label>Phone</label>
                        <input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <button className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    {message && <span className="ml-4" style={{ marginLeft: '1rem', color: 'var(--success)' }}>{message}</span>}
                </form>
            </div>
        </div>
    );
};

export default Profile;
