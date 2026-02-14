import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Building, Calendar, MapPin, Globe, Linkedin, Github, Phone, Building2 } from 'lucide-react';
import alumniLogo from '../assets/alumniblack.png';

const AlumniAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        // Login
        email: '',
        password: '',
        // Signup
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
    const { alumniLogin, alumniSignup } = useContext(AuthContext);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-8 pt-8 pb-6 text-center">
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <img src={alumniLogo} alt="Alumni Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '50%' }} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {isLogin ? 'Alumni Login' : 'Alumni Registration'}
                        </h2>
                        <p className="text-gray-600 text-sm">
                            {isLogin ? 'Welcome back! Sign in to continue' : 'Join the alumni network'}
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
                                    <label className="block text-sm p-2 font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
                                            value={formData.email}
                                            onChange={onChange}
                                            placeholder="alumni@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block p-2 text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
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
                                            <div className="absolute inset-y-0 left-0 pl-3  flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
                                                value={formData.name}
                                                onChange={onChange}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

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
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
                                                value={formData.email}
                                                onChange={onChange}
                                                placeholder="alumni@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
                                                value={formData.phoneNumber}
                                                onChange={onChange}
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Building2 className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <select
                                                name="department"
                                                required
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
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
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Passed Out Year</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                name="passedOutYear"
                                                required
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
                                                value={formData.passedOutYear}
                                                onChange={onChange}
                                                placeholder="2020"
                                                min="1980"
                                                max={new Date().getFullYear()}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Company</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Building className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="currentCompany"
                                                required
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
                                                value={formData.currentCompany}
                                                onChange={onChange}
                                                placeholder="Google"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Briefcase className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="jobRole"
                                                required
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
                                                value={formData.jobRole}
                                                onChange={onChange}
                                                placeholder="Software Engineer"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <MapPin className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="currentLocation"
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
                                                value={formData.currentLocation}
                                                onChange={onChange}
                                                placeholder="Bangalore, India"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                                        <input
                                            type="number"
                                            name="yearsOfExperience"
                                            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
                                            value={formData.yearsOfExperience}
                                            onChange={onChange}
                                            placeholder="3"
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                                <Globe className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="url"
                                                name="companyWebsite"
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
                                                value={formData.companyWebsite}
                                                onChange={onChange}
                                                placeholder="https://company.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Previous Company (Optional)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 px-2 pl-3 flex items-center pointer-events-none">
                                            <Building className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="oldCompany"
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
                                            value={formData.oldCompany}
                                            onChange={onChange}
                                            placeholder="Microsoft"
                                        />
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
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
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
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
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
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
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
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 text-gray-900"
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
                            
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 mt-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (isLogin ? 'Signing in...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>

                        {/* Toggle Link */}
                        <div className="text-center pt-2 mt-2">
                            <p className="text-sm text-gray-600">
                                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="font-medium text-emerald-600 hover:underline"
                                >
                                    {isLogin ? 'Create Account' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to Main Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AlumniAuth;
