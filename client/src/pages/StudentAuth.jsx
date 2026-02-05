import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import Education3DIcon from '../components/Education3DIcon';

const StudentAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        registerNumber: '',
        department: '',
        graduationYear: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { studentLogin, studentSignup } = useContext(AuthContext);

    const { name, registerNumber, department, graduationYear, email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await studentLogin(email, password);
            } else {
                await studentSignup(formData);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Left Panel - Animated Gradient with 3D Icon */}
            <div className="auth-left-panel">
                <div className="auth-left-content">
                    <Education3DIcon size={200} />
                    <h1 className="auth-left-title">
                        Welcome to AlumniPortal
                    </h1>
                    <p className="auth-left-subtitle">
                        Connect with alumni, discover opportunities, and build your professional network
                    </p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="auth-right-panel">
                <div className="auth-form-container">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">
                            {isLogin ? 'Student Login' : 'Create Account'}
                        </h2>
                        <p className="auth-form-subtitle">
                            {isLogin ? 'Enter your credentials to access your account' : 'Fill in your details to get started'}
                        </p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="auth-form">
                        {!isLogin && (
                            <>
                                <div className="auth-input-group">
                                    <label className="auth-label">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={name}
                                        onChange={onChange}
                                        placeholder="Enter your full name"
                                        required
                                        className="auth-input"
                                    />
                                </div>
                                <div className="auth-input-group">
                                    <label className="auth-label">Register Number</label>
                                    <input
                                        type="text"
                                        name="registerNumber"
                                        value={registerNumber}
                                        onChange={onChange}
                                        placeholder="Enter register number"
                                        required
                                        className="auth-input"
                                    />
                                </div>
                                <div className="auth-input-group">
                                    <label className="auth-label">Department</label>
                                    <select
                                        name="department"
                                        value={department}
                                        onChange={onChange}
                                        required
                                        className="auth-select"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="CSE">CSE</option>
                                        <option value="ECE">ECE</option>
                                        <option value="EEE">EEE</option>
                                        <option value="MECH">MECH</option>
                                        <option value="CIVIL">CIVIL</option>
                                        <option value="IT">IT</option>
                                    </select>
                                </div>
                                <div className="auth-input-group">
                                    <label className="auth-label">Graduation Year</label>
                                    <input
                                        type="number"
                                        name="graduationYear"
                                        value={graduationYear}
                                        onChange={onChange}
                                        placeholder="e.g. 2026"
                                        required
                                        className="auth-input"
                                    />
                                </div>
                            </>
                        )}
                        <div className="auth-input-group">
                            <label className="auth-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                placeholder="Enter your email"
                                required
                                className="auth-input"
                            />
                        </div>
                        <div className="auth-input-group">
                            <label className="auth-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="Min 6 characters"
                                required
                                minLength="6"
                                className="auth-input"
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
                        </button>
                    </form>

                    <p className="auth-toggle-text">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <span
                            onClick={() => setIsLogin(!isLogin)}
                            className="auth-toggle-link"
                        >
                            {isLogin ? 'Sign up' : 'Login'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudentAuth;
