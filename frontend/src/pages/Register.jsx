import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaRocket } from 'react-icons/fa';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        org_name: '',
        org_address: '',
        org_tax_id: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = (e) => {
        e.preventDefault();
        setStep(step + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ backdropFilter: 'blur(10px)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <div className="text-center mb-4">
                <div style={{
                    display: 'inline-flex',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--accent-secondary)',
                    marginBottom: '1rem'
                }}>
                    <FaRocket size={28} />
                </div>
                <h2>Start your Journey</h2>
                <p className="text-muted">Create your organization account.</p>
            </div>

            {error && (
                <div style={{
                    padding: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={step === 2 ? handleSubmit : handleNext}>
                {step === 1 && (
                    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                        <h4 className="mb-4">User Details</h4>
                        <div className="flex gap-4">
                            <div className="mb-4" style={{ flex: 1 }}>
                                <label>First Name</label>
                                <input name="first_name" value={formData.first_name} onChange={handleChange} required />
                            </div>
                            <div className="mb-4" style={{ flex: 1 }}>
                                <label>Last Name</label>
                                <input name="last_name" value={formData.last_name} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label>Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <label>Phone Number</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <label>Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">Next: Organization Info</button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                        <h4 className="mb-4">Organization Details</h4>
                        <div className="mb-4">
                            <label>Organization Name</label>
                            <input name="org_name" value={formData.org_name} onChange={handleChange} required />
                        </div>
                        <div className="mb-4">
                            <label>Tax ID / EIN</label>
                            <input name="org_tax_id" value={formData.org_tax_id} onChange={handleChange} placeholder="Optional" />
                        </div>
                        <div className="mb-4">
                            <label>Address</label>
                            <textarea name="org_address" value={formData.org_address} onChange={handleChange} rows="3" placeholder="Optional" />
                        </div>

                        <div className="flex gap-4">
                            <button type="button" className="btn btn-secondary btn-block" onClick={() => setStep(1)}>Back</button>
                            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </div>
                )}
            </form>

            <div className="text-center mt-4">
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
