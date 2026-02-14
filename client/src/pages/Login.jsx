import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, Briefcase } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '', role: 'student' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.email, formData.password, formData.role);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login Failed');
        } finally {
            setLoading(false);
        }
    };

    const roleColors = {
        student: {
            bg: 'from-blue-50 to-indigo-50',
            primary: 'bg-blue-600 hover:bg-blue-700',
            border: 'border-blue-200',
            text: 'text-blue-600',
            focus: 'focus:ring-blue-500 focus:border-blue-500',
            icon: <GraduationCap className="w-5 h-5" />
        },
        alumni: {
            bg: 'from-emerald-50 to-teal-50',
            primary: 'bg-emerald-600 hover:bg-emerald-700',
            border: 'border-emerald-200',
            text: 'text-emerald-600',
            focus: 'focus:ring-emerald-500 focus:border-emerald-500',
            icon: <Briefcase className="w-5 h-5" />
        }
    };

    const currentTheme = roleColors[formData.role];

    return (
        <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} flex items-center justify-center p-4 transition-all duration-300`}>
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${currentTheme.bg} ${currentTheme.text} mb-4`}>
                            {currentTheme.icon}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-600 text-sm">Sign in to your account to continue</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="px-8 pb-8 space-y-5">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                I am a
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'student' })}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${formData.role === 'student'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    <span className="font-medium text-sm">Student</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'alumni' })}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${formData.role === 'alumni'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <Briefcase className="w-4 h-4" />
                                    <span className="font-medium text-sm">Alumni</span>
                                </button>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900 transition-all`}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900 transition-all`}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full ${currentTheme.primary} text-white font-medium py-2.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        {/* Register Link */}
                        <div className="text-center pt-2">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/register" className={`font-medium ${currentTheme.text} hover:underline`}>
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Admin Link */}
                <div className="text-center mt-6">
                    <Link to="/admin/login" className="text-sm text-gray-500 hover:text-gray-700">
                        Admin Access →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
