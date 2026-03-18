import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Building, MapPin, Globe, Linkedin, Github, Phone, Building2 } from 'lucide-react';

const DEPARTMENTS = [
    ['CSE', 'Computer Science (CSE)'],
    ['ECE', 'Electronics (ECE)'],
    ['EEE', 'Electrical (EEE)'],
    ['MECH', 'Mechanical (MECH)'],
    ['CIVIL', 'Civil (CIVIL)']
];

const currentYear = new Date().getFullYear();
const PASSED_OUT_YEARS = Array.from({ length: currentYear - 1979 }, (_, i) => String(currentYear - i));

const AlumniAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        department: '',
        passedOutYear: '',
        currentCompany: '',
        jobRole: '',
        phoneNumber: '',
        currentLocation: '',
        yearsOfExperience: '',
        companyWebsite: '',
        oldCompany: '',
        linkedin: '',
        github: '',
        confirmPassword: ''
    });
    const { alumniLogin, alumniSignup, googleLogin } = useContext(AuthContext);
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
                await alumniLogin(formData.email, formData.password);
            } else {
                await alumniSignup({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phoneNumber: formData.phoneNumber,
                    department: formData.department,
                    passedOutYear: formData.passedOutYear,
                    currentCompany: formData.currentCompany,
                    jobRole: formData.jobRole,
                    profile: {
                        currentLocation: formData.currentLocation,
                        yearsOfExperience: formData.yearsOfExperience,
                        companyWebsite: formData.companyWebsite,
                        oldCompany: formData.oldCompany,
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

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setError('');
            setLoading(true);
            await googleLogin(credentialResponse.credential, 'alumni');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Google Authentication Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google Authentication Failed');
    };

    const inputIconCls = 'w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all';
    const inputCls = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all';
    const selectCls = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all appearance-none';

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 flex items-center justify-center p-4 py-12 transition-all duration-500">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg bg-emerald-600">
                        <Briefcase className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {isLogin ? 'Alumni Login' : 'Alumni Registration'}
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        {isLogin ? 'Welcome back! Sign in to continue' : 'Join the alumni network'}
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-4 text-sm font-semibold transition-all ${isLogin
                                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-4 text-sm font-semibold transition-all ${!isLogin
                                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    <div className="p-8">
                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-4">
                            {isLogin ? (
                                /* ---- LOGIN FORM ---- */
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input type="email" name="email" required className={inputIconCls}
                                                value={formData.email} onChange={onChange} placeholder="alumni@example.com" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input type="password" name="password" required className={inputIconCls}
                                                value={formData.password} onChange={onChange} placeholder="••••••••" />
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading}
                                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                                        {loading ? 'Signing in...' : 'Sign In'}
                                    </button>

                                    {/* Divider */}
                                    <div className="relative my-1">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs text-gray-400">
                                            <span className="bg-white px-3">or continue with</span>
                                        </div>
                                    </div>

                                    {/* Google Login */}
                                    <div className="flex justify-center w-full">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={handleGoogleError}
                                            useOneTap={false}
                                            text="signin_with"
                                            shape="rectangular"
                                            width="100%"
                                        />
                                    </div>
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
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="email" name="email" required className={inputIconCls}
                                                    value={formData.email} onChange={onChange} placeholder="alumni@example.com" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="tel" name="phoneNumber" required className={inputIconCls}
                                                    value={formData.phoneNumber} onChange={onChange} placeholder="+91 98765 43210" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                                <select name="department" required
                                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all appearance-none"
                                                    value={formData.department} onChange={onChange}>
                                                    <option value="">Select Department</option>
                                                    {DEPARTMENTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Passed Out Year</label>
                                            <select name="passedOutYear" required className={selectCls}
                                                value={formData.passedOutYear} onChange={onChange}>
                                                <option value="">Select Year</option>
                                                {PASSED_OUT_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Company</label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="text" name="currentCompany" required className={inputIconCls}
                                                    value={formData.currentCompany} onChange={onChange} placeholder="Google" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Role</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="text" name="jobRole" required className={inputIconCls}
                                                    value={formData.jobRole} onChange={onChange} placeholder="Software Engineer" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Location</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="text" name="currentLocation" className={inputIconCls}
                                                    value={formData.currentLocation} onChange={onChange} placeholder="Bangalore, India" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Experience</label>
                                            <input type="number" name="yearsOfExperience" className={inputCls}
                                                value={formData.yearsOfExperience} onChange={onChange} placeholder="3" min="0" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Website</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="url" name="companyWebsite" className={inputIconCls}
                                                    value={formData.companyWebsite} onChange={onChange} placeholder="https://company.com" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Previous Company (Optional)</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input type="text" name="oldCompany" className={inputIconCls}
                                                value={formData.oldCompany} onChange={onChange} placeholder="Microsoft" />
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
                                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </button>

                                    {/* Divider */}
                                    <div className="relative my-3">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs text-gray-400">
                                            <span className="bg-white px-3">or sign up with</span>
                                        </div>
                                    </div>

                                    {/* Google Login */}
                                    <div className="flex justify-center w-full">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={handleGoogleError}
                                            useOneTap={false}
                                            text="signup_with"
                                            shape="rectangular"
                                            width="100%"
                                        />
                                    </div>
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

export default AlumniAuth;
