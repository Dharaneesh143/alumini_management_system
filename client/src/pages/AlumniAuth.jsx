import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import Education3DIcon from '../components/Education3DIcon';

const AlumniAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        department: '',
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

    const { name, department, passedOutYear, currentCompany, jobRole, email, phoneNumber, password } = formData;

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
        <div className="auth-container">
            {/* Left Panel - Animated Gradient with 3D Icon */}
            <div className="auth-left-panel">
                <div className="auth-left-content">
                    <Education3DIcon size={200} />
                    <h1 className="auth-left-title">
                        Alumni Network
                    </h1>
                    <p className="auth-left-subtitle">
                        Reconnect with your alma mater, mentor students, and share your professional journey
                    </p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="auth-right-panel">
                <div className="auth-form-container">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">
                            {isLogin ? 'Alumni Login' : 'Join Alumni Network'}
                        </h2>
                        <p className="auth-form-subtitle">
                            {isLogin ? 'Welcome back! Enter your credentials' : 'Register to connect with your alma mater'}
                        </p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div style={{
                            background: 'var(--success-light)',
                            color: 'var(--success)',
                            padding: '0.875rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                            {message}
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
                                    <label className="auth-label">Department</label>
                                    <select
                                        name="department"
                                        value={department}
                                        onChange={onChange}
                                        required
                                        className="auth-select"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="BE CSE (Computer Science & Engineering)">BE CSE (Computer Science & Engineering)</option>
                                        <option value="BE ECE (Electronics & Communication Engineering)">BE ECE (Electronics & Communication Engineering)</option>
                                        <option value="BE EEE (Electrical & Electronics Engineering)">BE EEE (Electrical & Electronics Engineering)</option>
                                        <option value="BE MECH (Mechanical Engineering)">BE MECH (Mechanical Engineering)</option>
                                        <option value="BE CIVIL (Civil Engineering)">BE CIVIL (Civil Engineering)</option>
                                        <option value="BE BME (Biomedical Engineering)">BE BME (Biomedical Engineering)</option>
                                        <option value="BE AGRI (Agricultural Engineering)">BE AGRI (Agricultural Engineering)</option>
                                        <option value="BE AERO (Aeronautical Engineering)">BE AERO (Aeronautical Engineering)</option>
                                        <option value="BE AUTO (Automobile Engineering)">BE AUTO (Automobile Engineering)</option>
                                        <option value="BTech IT (Information Technology)">BTech IT (Information Technology)</option>
                                        <option value="BTech AI&DS (Artificial Intelligence & Data Science)">BTech AI&DS (Artificial Intelligence & Data Science)</option>
                                        <option value="BTech CSBS (Computer Science & Business Systems)">BTech CSBS (Computer Science & Business Systems)</option>
                                        <option value="BTech CHEM (Chemical Engineering)">BTech CHEM (Chemical Engineering)</option>
                                    </select>
                                </div>
                                <div className="auth-input-group">
                                    <label className="auth-label">Passed Out Year</label>
                                    <input
                                        type="number"
                                        name="passedOutYear"
                                        value={passedOutYear}
                                        onChange={onChange}
                                        placeholder="e.g. 2020"
                                        required
                                        className="auth-input"
                                    />
                                </div>
                                <div className="auth-input-group">
                                    <label className="auth-label">Current Company</label>
                                    <input
                                        type="text"
                                        name="currentCompany"
                                        value={currentCompany}
                                        onChange={onChange}
                                        placeholder="Where do you work now?"
                                        required
                                        className="auth-input"
                                    />
                                </div>
                                <div className="auth-input-group">
                                    <label className="auth-label">Job Role</label>
                                    <input
                                        type="text"
                                        name="jobRole"
                                        value={jobRole}
                                        onChange={onChange}
                                        placeholder="e.g. Software Engineer"
                                        required
                                        className="auth-input"
                                    />
                                </div>
                                <div className="auth-input-group">
                                    <label className="auth-label">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={phoneNumber}
                                        onChange={onChange}
                                        placeholder="Enter phone number"
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

                    {!isLogin && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'var(--gray-50)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-light)'
                        }}>
                            <p><strong>Note:</strong> Alumni accounts require manual approval by the administrator before you can log in.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlumniAuth;
