import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import {
    Briefcase,
    Target,
    Users,
    Calendar,
    MapPin,
    DollarSign,
    Search,
    User,
    ChevronRight,
    BookOpen,
    MessageSquare,
    Clock,
    Settings,
    MoreVertical
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ResumeUpload from '../components/ResumeUpload';
import PageSettings from '../components/PageSettings';
import { useTheme } from '../context/ThemeContext.jsx';
import api, { API_ENDPOINTS } from '../config/api';

const StudentDashboard = () => {
    const { user, refreshUser } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [totalJobsCount, setTotalJobsCount] = useState(0);
    const [stats, setStats] = useState({ appliedJobs: 0, mentorshipRequests: 0, events: 0 });
    const [activeMentorship, setActiveMentorship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const { isDarkMode, setIsDarkMode } = useTheme();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Refresh user data to ensure profile completion is accurate
            if (refreshUser) {
                await refreshUser();
            }
            const [jobsRes, statsRes, requestsRes] = await Promise.all([
                api.get(API_ENDPOINTS.GET_JOBS),
                api.get('/api/student/stats'),
                api.get(API_ENDPOINTS.GET_MENTORSHIP_REQUESTS)
            ]);
            setTotalJobsCount(jobsRes.data.length);
            setJobs(jobsRes.data);
            setStats(statsRes.data);
            const active = requestsRes.data.find(r => r.status === 'accepted' || r.status === 'Active');
            setActiveMentorship(active);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateProfileProgress = () => {
        if (!user) return 0;

        // Define all profile fields to check
        const fields = [
            user.name,
            user.email,
            user.phoneNumber,
            user.department,
            user.batch,
            user.profile?.cgpa,
            user.profile?.skills && user.profile.skills.length > 0,
            user.profile?.resumeUrl
        ];

        // Filter out null, undefined, empty strings, and false values
        const filled = fields.filter(f => {
            if (f === null || f === undefined || f === '' || f === false) return false;
            if (typeof f === 'number' && f === 0) return true; // Allow 0 as valid
            return true;
        });

        return Math.round((filled.length / fields.length) * 100);
    };

    const progress = calculateProfileProgress();


    return (
        <div className="space-y-8 pb-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold mb-2 dark:text-white">Welcome back, {user?.name}!</h2>
                    <p className="text-secondary dark:text-slate-400">Here's your dashboard overview</p>
                </div>
                <div className="relative">
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-500 dark:text-slate-400 ${showSettings ? 'ring-2 ring-primary/20' : ''}`}
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showSettings && (
                        <div className="absolute right-0 top-full mt-2 z-50">
                            <PageSettings 
                                isDarkMode={isDarkMode}
                                setIsDarkMode={setIsDarkMode}
                                onClose={() => setShowSettings(false)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-6 justify-between">
                <StatCard
                    icon={Briefcase}
                    label="Jobs Available"
                    value={totalJobsCount}
                    color="primary"
                />
                <StatCard
                    icon={Target}
                    label="Applications"
                    value={stats.appliedJobs}
                    color="success"
                />
                <StatCard
                    icon={Users}
                    label="Mentors"
                    value={stats.mentorshipRequests}
                    color="info"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-6">
                {/* Recent Jobs */}
                {/* Recent Jobs */}
                <div className="card flex flex-col" style={{ gridColumn: 'span 2', height: '800px' }}>
                    <div className="px-6 py-2 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-800">Recent Job Opportunities</h3>
                        <Link to="/jobs" className="text-xs text-primary font-bold hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="card-body p-0 relative flex flex-col overflow-hidden h-full">
                        <div style={{ maxHeight: '780px' }} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                            {loading ? (
                                <div className="text-center text-secondary py-8">Loading...</div>
                            ) : jobs.length === 0 ? (
                                <div className="text-center text-secondary py-8">
                                    <div className="flex justify-center mb-4">
                                        <Briefcase size={48} className="text-muted" />
                                    </div>
                                    <p>No jobs available yet</p>
                                </div>
                            ) : (
                                jobs.slice(0, 6).map((job) => (
                                    <div key={job._id} className="p-4 border border-gray-200 rounded-xl hover:border-primary transition-all bg-white hover:shadow-md">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-base mb-1">{job.title}</h4>
                                                <p className="text-sm text-secondary mb-2">{job.company}</p>
                                                <div className="flex items-center gap-4 text-xs text-muted">
                                                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                                                    <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary || 'Not specified'}</span>
                                                </div>
                                            </div>
                                            <Link to={`/jobs/${job._id}`} className="btn btn-sm btn-primary">
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {jobs.length > 6 && (
                            <div className="absolute bottom-6 right-6">
                                <Link
                                    to="/jobs"
                                    className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all border-4 border-white group"
                                    title="See all jobs"
                                >
                                    <div className="flex flex-col items-center leading-none">
                                        <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                        <span className="text-[8px] font-black uppercase mt-1">See All</span>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions & Mentorship */}
                <div className="flex flex-col gap-6">
                    {/* Active Mentorship Card - Enhanced UI */}
                    {activeMentorship && (
                        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl border-2 border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            {/* Header with gradient */}
                            <div className="bg-violet-400 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                            <Users size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">My Mentor</h3>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-400 text-green-900 text-xs font-bold rounded-full">
                                                <div className="w-1.5 h-1.5 bg-green-900 rounded-full animate-pulse"></div>
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mentor Profile */}
                            <div className="p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    {/* Large Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-16 h-16 bg-gray-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                            {(activeMentorship.alumni?.name || 'M').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                                    </div>

                                    {/* Mentor Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xl font-bold text-gray-900 mb-1 truncate">
                                            {activeMentorship.alumni?.name}
                                        </h4>
                                        <div className="flex items-center gap-2 text-gray-700 mb-1">
                                            <Briefcase size={14} className="text-indigo-600 flex-shrink-0" />
                                            <span className="font-semibold text-sm truncate">{activeMentorship.alumni?.jobRole || 'Professional'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <BookOpen size={14} className="text-purple-600 flex-shrink-0" />
                                            <span className="text-xs truncate">{activeMentorship.alumni?.currentCompany || 'Company'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mentorship Topic */}
                                <div className="bg-white rounded-xl p-3 mb-4 border border-indigo-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Target size={14} className="text-indigo-500" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Focus Area</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">{activeMentorship.mentorshipTopic || 'Career Guidance'}</p>
                                </div>

                                {/* Skills */}
                                {activeMentorship.alumni?.profile?.skills && activeMentorship.alumni.profile.skills.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expertise</p>
                                        <div className="flex flex-wrap gap-2">
                                            {activeMentorship.alumni.profile.skills.slice(0, 3).map((skill, idx) => (
                                                <span key={idx} className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CTA Button */}
                                <Link
                                    to={`/mentorship/conversation/${activeMentorship._id}`}
                                    className="w-full bg-violet-400 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                >
                                    <MessageSquare size={18} />
                                    Chat with Mentor
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Resume Upload Section */}
                    <ResumeUpload
                        currentResume={user?.profile?.resumeUrl || user?.resume}
                        onUploadSuccess={() => {
                            if (refreshUser) refreshUser();
                        }}
                    />

                </div>
            </div>

            {/* Secondary Row: Quick Actions (Left) + Profile Completion (Right) */}
            <div className="grid grid-cols-3 gap-6">
                {/* Quick Actions - span 2 */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3 className="card-title mb-4 text-base font-bold text-gray-800">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Link to="/jobs" className="btn btn-outline w-full flex items-center justify-center gap-2 py-3">
                            <Search size={18} />
                            Browse Jobs
                        </Link>
                        {activeMentorship ? (
                            <Link to={`/mentorship/conversation/${activeMentorship._id}`} className="btn btn-outline w-full flex items-center justify-center gap-2 py-3">
                                <MessageSquare size={18} />
                                My Mentor Chat
                            </Link>
                        ) : (
                            <>
                                <Link to="/mentorship" className="btn btn-outline w-full flex items-center justify-center gap-2 py-3">
                                    <Users size={18} />
                                    Find Mentor
                                </Link>
                                <Link to="/mentorship/requests" className="btn btn-outline w-full flex items-center justify-center gap-2 py-3">
                                    <Clock size={18} />
                                    My Requests
                                </Link>
                            </>
                        )}
                        <Link to="/events" className="btn btn-outline w-full flex items-center justify-center gap-2 py-3">
                            <Calendar size={18} />
                            Events
                        </Link>
                        <Link to="/settings" className="btn btn-outline w-full flex items-center justify-center gap-2 py-3">
                            <Settings size={18} />
                            Settings
                        </Link>
                    </div>
                </div>

                {/* Profile Completion - span 1 */}
                <div className="card">
                    <h3 className="card-title mb-4 text-base font-bold text-gray-800">Profile Completion</h3>
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-secondary">Progress</span>
                            <span className="text-sm font-semibold">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <p className="text-xs text-secondary mb-4">
                        Complete your profile to increase visibility to alumni
                    </p>
                    <Link to="/profile" className="btn btn-outline w-full btn-sm mt-auto">
                        Update Profile
                    </Link>
                </div>
            </div>

            {/* Activity Section */}
            <div>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Your Activity</h3>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-primary mb-1">{stats.appliedJobs}</div>
                                <div className="text-sm text-secondary">Jobs Applied</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-success mb-1">{stats.mentorshipRequests}</div>
                                <div className="text-sm text-secondary">Mentorship Requests</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
