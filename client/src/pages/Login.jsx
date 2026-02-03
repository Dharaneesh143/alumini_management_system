import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login Failed');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-2xl" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Login</h2>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        className="input-field" // Need to add to index.css or inline
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button type="submit" className="btn w-full">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
