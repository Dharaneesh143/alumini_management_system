import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Shield3DIcon from '../components/Shield3DIcon';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { adminLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await adminLogin(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Admin Login Failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Left Panel - Admin Focused */}
            <div className="auth-left-panel" style={{ background: 'linear-gradient(-45deg, #1e293b 0%, #0f172a 100%)' }}>
                <div className="auth-left-content">
                    <Shield3DIcon size={220} />
                    <h1 className="auth-left-title">
                        Admin Control Panel
                    </h1>
                    <p className="auth-left-subtitle">
                        Secure access to system management, user verification, and platform moderation
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="auth-right-panel">
                <div className="auth-form-container">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">🛡️ Admin Login</h2>
                        <p className="auth-form-subtitle">Enter your secure credentials to proceed</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="auth-form">
                        <div className="auth-input-group">
                            <label className="auth-label">Administrator Email</label>
                            <input
                                type="email"
                                required
                                className="auth-input"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="admin@example.com"
                            />
                        </div>
                        <div className="auth-input-group">
                            <label className="auth-label">Password</label>
                            <input
                                type="password"
                                required
                                className="auth-input"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            className="auth-button"
                            style={{ background: '#ef4444' }}
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Secure Access'}
                        </button>
                    </form>

                    <div className="auth-toggle-text">
                        <p className="text-sm text-secondary" style={{ marginTop: '2rem' }}>
                            Restricted area. All access attempts are logged.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
