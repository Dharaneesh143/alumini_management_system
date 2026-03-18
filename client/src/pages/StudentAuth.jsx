import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, Hash, Building2, Calendar, Code, Linkedin, Github, Phone } from 'lucide-react';

const DEPARTMENTS = [
    ['CSE', 'Computer Science (CSE)'],
    ['ECE', 'Electronics (ECE)'],
    ['EEE', 'Electrical (EEE)'],
    ['MECH', 'Mechanical (MECH)'],
    ['CIVIL', 'Civil (CIVIL)']
];
const BATCHES = ['2021', '2022', '2023', '2024', '2025', '2026', '2027'];

const StudentAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        registerNumber: '',
        department: '',
        batch: '',
        yearOfStudy: '',
        phoneNumber: '',
        skills: '',
        linkedin: '',
        github: '',
        confirmPassword: ''
    });
    const { studentLogin, studentSignup } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            if (isLogin) {
                await studentLogin(formData.email, formData.password);
            } else {
                await studentSignup({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phoneNumber: formData.phoneNumber,
                    registerNumber: formData.registerNumber,
                    department: formData.department,
                    graduationYear: formData.batch,
                    yearOfStudy: formData.yearOfStudy,
                    skills: formData.skills,
                    profile: {
                        batch: formData.batch,
                        phoneNumber: formData.phoneNumber,
                        yearOfStudy: formData.yearOfStudy,
                        skills: formData.skills,
                        linkedin: formData.linkedin,
                        github: formData.github
                    }
                });
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || (isLogin ? 'Login Failed' : 'Registration Failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        console.log('Google Login clicked for student');
        alert('Google Login integration coming soon!');
    };

    const inputCls = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all';
    const inputIconCls = 'w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all';
    const selectCls = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all appearance-none';

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6 py-14">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl mb-5 shadow-lg bg-blue-600">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                        {isLogin ? 'Student Login' : 'Student Registration'}
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        {isLogin ? 'Welcome back! Sign in to continue' : 'Create your student account'}
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-4 text-sm font-semibold transition-all ${isLogin
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-4 text-sm font-semibold transition-all ${!isLogin
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    <div className="px-10 py-8">
                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-5">
                            {isLogin ? (
                                /* ---- LOGIN FORM ---- */
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input type="email" name="email" required className={inputIconCls}
                                                value={formData.email} onChange={onChange} placeholder="Enter your college email" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input type="password" name="password" required className={inputIconCls}
                                                value={formData.password} onChange={onChange} placeholder="••••••••" />
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading}
                                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-4">
                                        {loading ? 'Signing in...' : 'Sign In'}
                                    </button>

                                    {/* Divider */}
                                    <div className="relative my-3">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs text-gray-400">
                                            <span className="bg-white px-3">or continue with</span>
                                        </div>
                                    </div>

                                    {/* Google Login */}
                                    <button type="button" onClick={handleGoogleLogin}
                                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Sign in with Google
                                    </button>
                                </>
                            ) : (
                                /* ---- SIGNUP FORM ---- */
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="text" name="name" required className={inputIconCls}
                                                    value={formData.name} onChange={onChange} placeholder="John Doe" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Register Number</label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="text" name="registerNumber" required className={inputIconCls}
                                                    value={formData.registerNumber} onChange={onChange} placeholder="73762XXXXXXX" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="email" name="email" required className={inputIconCls}
                                                    value={formData.email} onChange={onChange} placeholder="Enter your college email" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="tel" name="phoneNumber" required className={inputIconCls}
                                                    value={formData.phoneNumber} onChange={onChange} placeholder="+91 98765 43210" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                                            <select name="department" required className={selectCls}
                                                value={formData.department} onChange={onChange}>
                                                <option value="">Select Department</option>
                                                {DEPARTMENTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Batch (Graduation Year)</label>
                                            <select name="batch" required className={selectCls}
                                                value={formData.batch} onChange={onChange}>
                                                <option value="">Select Batch</option>
                                                {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Year of Study</label>
                                            <select name="yearOfStudy" required className={selectCls}
                                                value={formData.yearOfStudy} onChange={onChange}>
                                                <option value="">Select Year</option>
                                                <option value="1">First Year</option>
                                                <option value="2">Second Year</option>
                                                <option value="3">Third Year</option>
                                                <option value="4">Fourth Year</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Skills (Optional)</label>
                                            <div className="relative">
                                                <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="text" name="skills" className={inputIconCls}
                                                    value={formData.skills} onChange={onChange} placeholder="React, Node.js, Python" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn (Optional)</label>
                                            <div className="relative">
                                                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="url" name="linkedin" className={inputIconCls}
                                                    value={formData.linkedin} onChange={onChange} placeholder="https://linkedin.com/in/username" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">GitHub (Optional)</label>
                                            <div className="relative">
                                                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="url" name="github" className={inputIconCls}
                                                    value={formData.github} onChange={onChange} placeholder="https://github.com/username" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="password" name="password" required className={inputIconCls}
                                                    value={formData.password} onChange={onChange} placeholder="••••••••" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="password" name="confirmPassword" required className={inputIconCls}
                                                    value={formData.confirmPassword} onChange={onChange} placeholder="••••••••" />
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading}
                                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center mt-5">
                    <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                        ← Back to Main Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StudentAuth;
