import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { adminLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await adminLogin(formData.email, formData.password);
            navigate('/dashboard'); // Will redirect to Admin Dashboard via helper
        } catch (err) {
            setError(err.response?.data?.msg || 'Admin Login Failed');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', borderColor: 'var(--danger)' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div className="text-4xl mb-2">🛡️</div>
                    <h2 className="text-2xl font-bold text-danger">Admin Portal</h2>
                    <p className="text-secondary text-sm">Restricted Access Only</p>
                </div>

                {error && <div className="p-3 mb-4 bg-danger-light text-danger rounded text-sm text-center">{error}</div>}

                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div className="form-group">
                        <label className="form-label text-xs uppercase font-bold text-secondary">Admin Email</label>
                        <input
                            type="email"
                            required
                            className="form-input"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label text-xs uppercase font-bold text-secondary">Password</label>
                        <input
                            type="password"
                            required
                            className="form-input"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn btn-danger w-full">Secure Login</button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
