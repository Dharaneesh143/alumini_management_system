import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, Briefcase, Phone, MapPin, Building, Linkedin, Github } from 'lucide-react';

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const BATCHES = ['2021', '2022', '2023', '2024', '2025', '2026', '2027'];
const YEARS_OF_STUDY = ['1', '2', '3', '4'];
const currentYear = new Date().getFullYear();
const PASSED_OUT_YEARS = Array.from({ length: currentYear - 1979 }, (_, i) => String(currentYear - i));

const InputWrapper = ({ icon: Icon, children }) => (
    <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
        {React.cloneElement(children, {
            className: `${children.props.className} w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`
        })}
    </div>
);

const Register = () => {
    const [role, setRole] = useState('student');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        registerNumber: '',
        department: '',
        batch: '',
        yearOfStudy: '',
        skills: '',
        passedOutYear: '',
        currentCompany: '',
        jobRole: '',
        currentLocation: '',
        yearsOfExperience: '',
        companyWebsite: '',
        oldCompany: '',
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

    const isStudent = role === 'student';
    const accent = isStudent ? 'blue' : 'emerald';
    const inputCls = `w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-${accent}-400 focus:border-transparent transition-all`;
    const selectCls = `w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-${accent}-400 focus:border-transparent transition-all appearance-none`;

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 py-12 transition-all duration-500 ${isStudent
            ? 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100'
            : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100'
        }`}>
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg ${isStudent ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                        {isStudent
                            ? <GraduationCap className="w-7 h-7 text-white" />
                            : <Briefcase className="w-7 h-7 text-white" />
                        }
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
                    <p className="text-gray-500 mt-1 text-sm">Join the Alumni &amp; Placement Portal</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-10 py-10 space-y-6">
                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                                {error}
                            </div>
                        )}

                        {/* Role Toggle */}
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">I am a</p>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setRole('student')}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${isStudent
                                        ? 'bg-white text-blue-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    Student
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('alumni')}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${!isStudent
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Alumni
                                </button>
                            </div>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-7">
                            {/* Common fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input type="text" name="name" required className={`${inputCls} pl-10`}
                                            value={formData.name} onChange={onChange} placeholder="John Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input type="email" name="email" required className={`${inputCls} pl-10`}
                                            value={formData.email} onChange={onChange}
                                            placeholder={isStudent ? 'student@college.edu' : 'alumni@example.com'} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input type="password" name="password" required className={`${inputCls} pl-10`}
                                            value={formData.password} onChange={onChange} placeholder="••••••••" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input type="password" name="confirmPassword" required className={`${inputCls} pl-10`}
                                            value={formData.confirmPassword} onChange={onChange} placeholder="••••••••" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input type="tel" name="phoneNumber" required className={`${inputCls} pl-10`}
                                            value={formData.phoneNumber} onChange={onChange} placeholder="+91 98765 43210" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                    <select name="department" required className={selectCls}
                                        value={formData.department} onChange={onChange}>
                                        <option value="">Select Department</option>
                                        {DEPARTMENTS.map(d => (
                                            <option key={d} value={d}>{d === 'CSE' ? 'Computer Science (CSE)' : d === 'ECE' ? 'Electronics (ECE)' : d === 'EEE' ? 'Electrical (EEE)' : d === 'MECH' ? 'Mechanical (MECH)' : 'Civil (CIVIL)'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Student-Specific */}
                            {isStudent && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Register Number</label>
                                            <input type="text" name="registerNumber" required className={inputCls}
                                                value={formData.registerNumber} onChange={onChange} placeholder="73762XXXXXXX" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Batch (Graduation Year)</label>
                                            <select name="batch" required className={selectCls}
                                                value={formData.batch} onChange={onChange}>
                                                <option value="">Select Batch</option>
                                                {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
                                            <select name="yearOfStudy" required className={selectCls}
                                                value={formData.yearOfStudy} onChange={onChange}>
                                                <option value="">Select Year</option>
                                                {[['1','First Year'],['2','Second Year'],['3','Third Year'],['4','Fourth Year']].map(([v,l]) => (
                                                    <option key={v} value={v}>{l}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Skills (Optional)</label>
                                            <input type="text" name="skills" className={inputCls}
                                                value={formData.skills} onChange={onChange} placeholder="React, Node.js, Python" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Alumni-Specific */}
                            {!isStudent && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Passed Out Year</label>
                                            <select name="passedOutYear" required className={selectCls}
                                                value={formData.passedOutYear} onChange={onChange}>
                                                <option value="">Select Year</option>
                                                {PASSED_OUT_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Company</label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="text" name="currentCompany" required className={`${inputCls} pl-10`}
                                                    value={formData.currentCompany} onChange={onChange} placeholder="Google" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
                                            <input type="text" name="jobRole" required className={inputCls}
                                                value={formData.jobRole} onChange={onChange} placeholder="Software Engineer" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input type="text" name="currentLocation" className={`${inputCls} pl-10`}
                                                    value={formData.currentLocation} onChange={onChange} placeholder="Bangalore, India" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                                            <input type="number" name="yearsOfExperience" className={inputCls}
                                                value={formData.yearsOfExperience} onChange={onChange} placeholder="3" min="0" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                                            <input type="url" name="companyWebsite" className={inputCls}
                                                value={formData.companyWebsite} onChange={onChange} placeholder="https://company.com" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Previous Company (Optional)</label>
                                        <input type="text" name="oldCompany" className={inputCls}
                                            value={formData.oldCompany} onChange={onChange} placeholder="Microsoft" />
                                    </div>
                                </>
                            )}

                            {/* Social Links */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input type="url" name="linkedin" className={`${inputCls} pl-10`}
                                            value={formData.linkedin} onChange={onChange} placeholder="https://linkedin.com/in/username" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Profile</label>
                                    <div className="relative">
                                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input type="url" name="github" className={`${inputCls} pl-10`}
                                            value={formData.github} onChange={onChange} placeholder="https://github.com/username" />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${isStudent
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                            </div>

                            <p className="text-center text-sm text-gray-500 pt-2">
                                Already have an account?{' '}
                                <Link to="/login" className={`font-semibold hover:underline ${isStudent ? 'text-blue-600' : 'text-emerald-600'}`}>
                                    Sign In
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
