import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Shield, AlertCircle } from 'lucide-react';

/* ── Floating orb component for background decoration ── */
const Orb = ({ className }) => (
    <div className={`absolute rounded-full blur-3xl opacity-30 pointer-events-none ${className}`} />
);

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { adminLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    /* mount → trigger fade-in animation */
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(t);
    }, []);

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await adminLogin(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Admin Login Failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">

            {/* ── Animated background orbs ── */}
            <Orb className="w-96 h-96 bg-violet-400 top-[-6rem] left-[-6rem] animate-pulse" />
            <Orb className="w-80 h-80 bg-indigo-300 bottom-[-4rem] right-[-4rem] animate-pulse" style={{ animationDelay: '1s' }} />
            <Orb className="w-56 h-56 bg-purple-300 top-1/2 left-1/4 animate-pulse" style={{ animationDelay: '2s' }} />

            {/* ── Animated grid overlay ── */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: 'linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* ── Card ── */}
            <div
                className={`relative w-full max-w-md transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
                {/* Glow ring behind card */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400/30 to-indigo-400/20 blur-xl scale-105" />

                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-violet-100 overflow-hidden">

                    {/* ── Top accent bar ── */}
                    <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

                    {/* ── Header ── */}
                    <div className="px-10 pt-10 pb-6 text-center">
                        {/* Shield icon with animated ring */}
                        <div className="relative inline-flex items-center justify-center mb-6">
                            <div className="absolute w-20 h-20 rounded-full border-2 border-violet-200 animate-ping opacity-30" />
                            <div className="absolute w-16 h-16 rounded-full border border-violet-300 opacity-50" />
                            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
                                <Shield className="w-7 h-7" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">Admin Portal</h2>
                        <p className="text-gray-500 text-sm mt-1">Secure access for system administrators</p>
                    </div>

                    {/* ── Form ── */}
                    <form onSubmit={onSubmit} className="px-10 pb-10 space-y-6">

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-shake">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Administrator Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all hover:border-violet-300"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all hover:border-violet-300"
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
                            className="relative w-full py-3 px-4 rounded-xl text-white font-semibold text-sm overflow-hidden group transition-all duration-200 shadow-md hover:shadow-violet-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                        >
                            {/* shimmer effect */}
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4" />
                                        Secure Access
                                    </>
                                )}
                            </span>
                        </button>

                        {/* Security notice */}
                        <div className="pt-1 text-center">
                            <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
                                <Shield className="w-3 h-3 text-violet-400" />
                                All access attempts are logged and monitored
                            </p>
                        </div>
                    </form>
                </div>

                {/* Back link */}
                <div className="text-center mt-5">
                    <Link to="/login" className="text-sm text-gray-400 hover:text-violet-600 transition-colors">
                        ← Back to Login
                    </Link>
                </div>
            </div>

            {/* ── Inline keyframes for shake animation ── */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%       { transform: translateX(-4px); }
                    40%       { transform: translateX(4px); }
                    60%       { transform: translateX(-3px); }
                    80%       { transform: translateX(3px); }
                }
                .animate-shake { animation: shake 0.4s ease; }
            `}</style>
        </div>
    );
};

export default AdminLogin;
