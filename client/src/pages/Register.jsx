import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration Failed');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-2xl" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        required
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
                        required
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

                    <select
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    >
                        <option value="student">Student</option>
                        <option value="alumni">Alumni</option>
                    </select>

                    <button type="submit" className="btn w-full">Sign Up</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
