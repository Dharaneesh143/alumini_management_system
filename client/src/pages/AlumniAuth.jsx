import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

const AlumniAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        passedOutYear: '',
        currentCompany: '',
        jobRole: '',
        email: '',
        phoneNumber: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { alumniLogin, alumniSignup } = useContext(AuthContext);

    const { name, passedOutYear, currentCompany, jobRole, email, phoneNumber, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (isLogin) {
                await alumniLogin(email, password);
                navigate('/dashboard');
            } else {
                const res = await alumniSignup(formData);
                setMessage(res.msg || 'Signup successful! Please wait for admin approval.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '500px', padding: '4rem 1rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary)' }}>
                    Alumni {isLogin ? 'Login' : 'Signup'}
                </h2>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        border: '1px solid #fecaca'
                    }}>
                        {error}
                    </div>
                )}

                {message && (
                    <div style={{
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        border: '1px solid #bbf7d0'
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    {!isLogin && (
                        <>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={name}
                                    onChange={onChange}
                                    placeholder="Enter your full name"
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Passed Out Year</label>
                                <input
                                    type="number"
                                    name="passedOutYear"
                                    value={passedOutYear}
                                    onChange={onChange}
                                    placeholder="e.g. 2020"
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Current Company</label>
                                <input
                                    type="text"
                                    name="currentCompany"
                                    value={currentCompany}
                                    onChange={onChange}
                                    placeholder="Where do you work now?"
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Job Role</label>
                                <input
                                    type="text"
                                    name="jobRole"
                                    value={jobRole}
                                    onChange={onChange}
                                    placeholder="e.g. Software Engineer"
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={phoneNumber}
                                    onChange={onChange}
                                    placeholder="Enter phone number"
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                        </>
                    )}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder="Enter your email"
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            placeholder="Min 6 characters"
                            required
                            minLength="6"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn"
                        disabled={loading}
                        style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {isLogin ? 'Signup' : 'Login'}
                    </span>
                </p>

                <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                    <p><strong>Note:</strong> Alumni accounts require manual approval by the administrator before you can log in.</p>
                </div>
            </div>
        </div>
    );
};

export default AlumniAuth;
