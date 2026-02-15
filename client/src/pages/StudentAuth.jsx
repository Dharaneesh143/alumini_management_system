import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, Hash, Building2, Calendar, Code, Linkedin, Github, Phone } from 'lucide-react';

const StudentAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        // Login
        email: '',
        password: '',
        // Signup
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 flex items-center justify-center p-4 py-12 transition-all duration-300">
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 text-blue-600 mb-4 border-2 border-blue-100">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {isLogin ? 'Student Login' : 'Student Registration'}
                        </h2>
                        <p className="text-gray-600 text-sm">
                            {isLogin ? 'Welcome back! Sign in to continue' : 'Create your student account'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="px-8 pb-8 space-y-5">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {isLogin ? (
                            /* Login Form */
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-colors hover:bg-gray-100"
                                            value={formData.email}
                                            onChange={onChange}
                                            placeholder="Enter your college email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-colors hover:bg-gray-100"
                                            value={formData.password}
                                            onChange={onChange}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Signup Form */
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-colors hover:bg-gray-100"
                                                value={formData.name}
                                                onChange={onChange}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Register Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Hash className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="registerNumber"
                                                required
                                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-colors hover:bg-gray-100"
                                                value={formData.registerNumber}
                                                onChange={onChange}
                                                placeholder="73762XXXXXXX"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-colors hover:bg-gray-100"
                                                value={formData.email}
                                                onChange={onChange}
                                                placeholder="Enter your college email"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                required
                                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-colors hover:bg-gray-100"
                                                value={formData.phoneNumber}
                                                onChange={onChange}
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Building2 className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <select
                                                name="department"
                                                required
                                                className="block w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-cyan-400 focus:border-cyan-400 text-white transition-all duration-300 hover:bg-slate-700/70"
                                                value={formData.department}
                                                onChange={onChange}
                                            >
                                                <option value="">Select Department</option>
                                                <option value="CSE">Computer Science</option>
                                                <option value="ECE">Electronics</option>
                                                <option value="EEE">Electrical</option>
                                                <option value="MECH">Mechanical</option>
                                                <option value="CIVIL">Civil</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Batch (Year)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <select
                                                name="batch"
                                                required
                                                className="block w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-cyan-400 focus:border-cyan-400 text-white transition-all duration-300 hover:bg-slate-700/70"
                                                value={formData.batch}
                                                onChange={onChange}
                                            >
                                                <option value="">Select Batch</option>
                                                <option value="2023">2023</option>
                                                <option value="2024">2024</option>
                                                <option value="2025">2025</option>
                                                <option value="2026">2026</option>
                                                <option value="2027">2027</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
                                        <select
                                            name="yearOfStudy"
                                            required
                                            className="block w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-cyan-400 focus:border-cyan-400 text-white transition-all duration-300 hover:bg-slate-700/70"
                                            value={formData.yearOfStudy}
                                            onChange={onChange}
                                        >
                                            <option value="">Select Year</option>
                                            <option value="1">First Year</option>
                                            <option value="2">Second Year</option>
                                            <option value="3">Third Year</option>
                                            <option value="4">Fourth Year</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Code className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="skills"
                                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-colors hover:bg-gray-100"
                                                value={formData.skills}
                                                onChange={onChange}
                                                placeholder="React, Node.js, Python"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Linkedin className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="url"
                                                name="linkedin"
                                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-colors hover:bg-gray-100"
                                                value={formData.linkedin}
                                                onChange={onChange}
                                                placeholder="https://linkedin.com/in/username"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Profile</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Github className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="url"
                                                name="github"
                                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-colors hover:bg-gray-100"
                                                value={formData.github}
                                                onChange={onChange}
                                                placeholder="https://github.com/username"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-colors hover:bg-gray-100"
                                                value={formData.password}
                                                onChange={onChange}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                required
                                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-colors hover:bg-gray-100"
                                                value={formData.confirmPassword}
                                                onChange={onChange}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 mt-4 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (isLogin ? 'Signing in...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>

                        {/* Toggle Link */}
                        <div className="text-center pt-2 mt-4">
                            <p className="text-sm text-gray-400">
                                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="font-medium text-blue-600 hover:underline transition-colors"
                                >
                                    {isLogin ? 'Create Account' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <Link to="/login" className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                        ← Back to Main Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StudentAuth;

