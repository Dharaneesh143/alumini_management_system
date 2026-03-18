import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, GraduationCap, Briefcase } from 'lucide-react';

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

    const handleGoogleLogin = () => {
        console.log('Google Login clicked for role:', formData.role);
        alert('Google Login integration coming soon!');
    };

    const isStudent = formData.role === 'student';

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-500 ${isStudent
            ? 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100'
            : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100'
        }`}>
            <div className="w-full max-w-md">
                {/* Logo / Title */}
                <div className="text-center mb-10">
                    <div className={`inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl mb-5 shadow-lg ${isStudent
                        ? 'bg-blue-600'
                        : 'bg-emerald-600'
                    }`}>
                        {isStudent
                            ? <GraduationCap className="w-9 h-9 text-white" />
                            : <Briefcase className="w-9 h-9 text-white" />
                        }
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 mt-2 text-sm">Sign in to your account to continue</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-10 py-10">
                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                                {error}
                            </div>
                        )}

                        {/* Role Toggle */}
                        <div className="mb-8">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">I am a</p>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'student' })}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${formData.role === 'student'
                                        ? 'bg-white text-blue-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    Student
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'alumni' })}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${formData.role === 'alumni'
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Alumni
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={onSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${isStudent
                                            ? 'focus:ring-blue-400'
                                            : 'focus:ring-emerald-400'
                                        }`}
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${isStudent
                                            ? 'focus:ring-blue-400'
                                            : 'focus:ring-emerald-400'
                                        }`}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${isStudent
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                            >
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
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign in with Google
                            </button>
                        </form>

                        {/* Register Link */}
                        <p className="text-center text-sm text-gray-500 mt-8">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className={`font-semibold hover:underline ${isStudent ? 'text-blue-600' : 'text-emerald-600'}`}
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Admin Link */}
                <div className="text-center mt-5">
                    <Link to="/admin/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                        Admin Access →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
