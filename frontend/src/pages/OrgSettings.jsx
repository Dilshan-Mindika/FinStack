import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const OrgSettings = () => {
    const { organization } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        tax_id: '',
        address: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        if (organization) {
            setFormData({
                name: organization.name || '',
                tax_id: organization.tax_id || '',
                address: organization.address || '',
                phone: organization.phone || '',
                email: organization.email || ''
            });
        }
    }, [organization]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/organizations/${organization.id}`, formData);
            alert('Organization updated!');
        } catch (err) {
            alert('Failed to update organization');
        }
    };

    return (
        <div>
            <h2 className="mb-4">Organization Settings</h2>
            <div className="card" style={{ maxWidth: '800px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label>Organization Name</label>
                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="mb-4">
                        <label>Tax ID</label>
                        <input value={formData.tax_id} onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })} />
                    </div>
                    <div className="mb-4">
                        <label>Address</label>
                        <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows="3" />
                    </div>
                    <div className="flex gap-4 mb-4">
                        <div style={{ flex: 1 }}>
                            <label>Email</label>
                            <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Phone</label>
                            <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                    </div>
                    <button className="btn btn-primary">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default OrgSettings;
