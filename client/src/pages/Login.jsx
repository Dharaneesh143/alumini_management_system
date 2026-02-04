import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '', role: 'student' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            await login(formData.email, formData.password, formData.role);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login Failed');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-2xl" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
                <p className="text-secondary text-center mb-6">Login to your account</p>

                {error && <div className="p-3 mb-4 bg-danger-light text-danger rounded text-sm text-center">{error}</div>}

                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div className="form-group">
                        <label className="form-label">I am a...</label>
                        <select
                            className="form-input"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="student">Student</option>
                            <option value="alumni">Alumni</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            required
                            className="form-input"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            required
                            className="form-input"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
