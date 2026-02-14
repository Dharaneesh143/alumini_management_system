import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, Briefcase, Phone, MapPin, Building, Calendar, Github, Linkedin } from 'lucide-react';

const Register = () => {
    const [role, setRole] = useState('student');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        // Student fields
        registerNumber: '',
        department: '',
        batch: '',
        yearOfStudy: '',
        skills: '',
        // Alumni fields
        passedOutYear: '',
        currentCompany: '',
        jobRole: '',
        currentLocation: '',
        yearsOfExperience: '',
        companyWebsite: '',
        oldCompany: '',
        // Social
        linkedin: '',
        github: ''
    });
    const { studentSignup, alumniSignup } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            if (role === 'student') {
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
            setError(err.response?.data?.msg || 'Registration Failed');
        } finally {
            setLoading(false);
        }
    };

    const roleColors = {
        student: {
            bg: 'from-blue-50 to-indigo-50',
            primary: 'bg-blue-600 hover:bg-blue-700',
            text: 'text-blue-600',
            focus: 'focus:ring-blue-500 focus:border-blue-500',
            icon: <GraduationCap className="w-5 h-5" />
        },
        alumni: {
            bg: 'from-emerald-50 to-teal-50',
            primary: 'bg-emerald-600 hover:bg-emerald-700',
            text: 'text-emerald-600',
            focus: 'focus:ring-emerald-500 focus:border-emerald-500',
            icon: <Briefcase className="w-5 h-5" />
        }
    };

    const currentTheme = roleColors[role];

    return (
        <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} flex items-center justify-center p-4 py-12 transition-all duration-300`}>
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${currentTheme.bg} ${currentTheme.text} mb-4`}>
                            {currentTheme.icon}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-600 text-sm">Join the Alumni & Placement Portal</p>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('student')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${role === 'student'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    <span className="font-medium text-sm">Student</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('alumni')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${role === 'alumni'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <Briefcase className="w-4 h-4" />
                                    <span className="font-medium text-sm">Alumni</span>
                                </button>
                            </div>
                        </div>

                        {/* Common Fields */}
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
                                        className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
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
                                        className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
                                        value={formData.email}
                                        onChange={onChange}
                                        placeholder={role === 'student' ? 'student@college.edu' : 'alumni@example.com'}
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
                                        className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
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
                                        className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
                                        value={formData.confirmPassword}
                                        onChange={onChange}
                                        placeholder="••••••••"
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
                                        className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
                                        value={formData.phoneNumber}
                                        onChange={onChange}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                <select
                                    name="department"
                                    required
                                    className={`block w-full px-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} text-gray-900`}
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

                        {/* Student-Specific Fields */}
                        {role === 'student' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Register Number</label>
                                        <input
                                            type="text"
                                            name="registerNumber"
                                            required
                                            className={`block w-full px-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
                                            value={formData.registerNumber}
                                            onChange={onChange}
                                            placeholder="2023XXXXX"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Batch (Year)</label>
                                        <select
                                            name="batch"
                                            required
                                            className={`block w-full px-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} text-gray-900`}
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
                                        <select
                                            name="yearOfStudy"
                                            required
                                            className={`block w-full px-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} text-gray-900`}
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
                                        <input
                                            type="text"
                                            name="skills"
                                            className={`block w-full px-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
                                            value={formData.skills}
                                            onChange={onChange}
                                            placeholder="React, Node.js, Python"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Alumni-Specific Fields */}
                        {role === 'alumni' && (
                            <>
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
                                                className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
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
                                                className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
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
                                        <input
                                            type="text"
                                            name="jobRole"
                                            required
                                            className={`block w-full px-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
                                            value={formData.jobRole}
                                            onChange={onChange}
                                            placeholder="Software Engineer"
                                        />
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
                                                className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
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
                                            className={`block w-full px-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
                                            value={formData.yearsOfExperience}
                                            onChange={onChange}
                                            placeholder="3"
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                                        <input
                                            type="url"
                                            name="companyWebsite"
                                            className={`block w-full px-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
                                            value={formData.companyWebsite}
                                            onChange={onChange}
                                            placeholder="https://company.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Previous Company (Optional)</label>
                                    <input
                                        type="text"
                                        name="oldCompany"
                                        className={`block w-full px-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
                                        value={formData.oldCompany}
                                        onChange={onChange}
                                        placeholder="Microsoft"
                                    />
                                </div>
                            </>
                        )}

                        {/* Social Links */}
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
                                        className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
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
                                        className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg ${currentTheme.focus} placeholder-gray-400 text-gray-900`}
                                        value={formData.github}
                                        onChange={onChange}
                                        placeholder="https://github.com/username"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full ${currentTheme.primary} text-white font-medium py-2.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>

                        {/* Login Link */}
                        <div className="text-center pt-2">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className={`font-medium ${currentTheme.text} hover:underline`}>
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
