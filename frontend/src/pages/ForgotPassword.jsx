import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaKey } from 'react-icons/fa';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="card" style={{ backdropFilter: 'blur(10px)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <div className="text-center mb-4">
                <div style={{
                    display: 'inline-flex',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: 'var(--warning)',
                    marginBottom: '1rem'
                }}>
                    <FaKey size={28} />
                </div>
                <h2>Reset Password</h2>
                <p className="text-muted">Enter your email to receive instructions.</p>
            </div>

            {!submitted ? (
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@company.com"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            ) : (
                <div className="text-center">
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
                    </div>
                    <button className="btn btn-secondary btn-block" onClick={() => setSubmitted(false)}>Try another email</button>
                </div>
            )}

            <div className="text-center mt-4">
                <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Back to Sign In</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
