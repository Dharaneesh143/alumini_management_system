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
    MessageSquare
} from 'lucide-react';
import StatCard from '../components/StatCard';
import api, { API_ENDPOINTS } from '../config/api';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [stats, setStats] = useState({ appliedJobs: 0, mentorshipRequests: 0, events: 0 });
    const [activeMentorship, setActiveMentorship] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [jobsRes, statsRes, requestsRes] = await Promise.all([
                api.get(API_ENDPOINTS.GET_JOBS),
                api.get('/api/student/stats'),
                api.get(API_ENDPOINTS.GET_MENTORSHIP_REQUESTS)
            ]);
            setJobs(jobsRes.data.slice(0, 3));
            setStats(statsRes.data);
            const active = requestsRes.data.find(r => r.status === 'accepted');
            setActiveMentorship(active);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
                <p className="text-secondary">Here's your student dashboard overview</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={Briefcase}
                    label="Jobs Available"
                    value={jobs.length}
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
                <StatCard
                    icon={Calendar}
                    label="Events"
                    value={stats.events}
                    color="warning"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-6">
                {/* Recent Jobs */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header">
                        <div className="flex items-center justify-between">
                            <h3 className="card-title">Recent Job Opportunities</h3>
                            <Link to="/jobs" className="text-sm text-primary font-medium">
                                View All →
                            </Link>
                        </div>
                    </div>
                    <div className="card-body">
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
                            <div className="flex flex-col gap-4">
                                {jobs.map((job) => (
                                    <div key={job._id} className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-base mb-1">{job.title}</h4>
                                                <p className="text-sm text-secondary mb-2">{job.company}</p>
                                                <div className="flex items-center gap-4 text-xs text-muted">
                                                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                                                    <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary || 'Not specified'}</span>
                                                </div>
                                            </div>
                                            <Link to={`/jobs`} className="btn btn-sm btn-primary">
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                ))}
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
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
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
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                            {activeMentorship.alumni?.name?.charAt(0).toUpperCase()}
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
                                        <Target size={14} className="text-indigo-600" />
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
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                >
                                    <MessageSquare size={18} />
                                    Chat with Mentor
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Profile Completion */}
                    <div className="card">
                        <h3 className="card-title mb-4">Profile Completion</h3>
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-secondary">Progress</span>
                                <span className="text-sm font-semibold">60%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                        <p className="text-xs text-secondary mb-4">
                            Complete your profile to increase visibility to alumni
                        </p>
                        <Link to="/profile" className="btn btn-outline w-full btn-sm">
                            Update Profile
                        </Link>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="card">
                        <h3 className="card-title mb-4">Quick Actions</h3>
                        <div className="flex flex-col gap-3">
                            <Link to="/jobs" className="btn btn-outline w-full flex items-center justify-center gap-2">
                                <Search size={18} />
                                Browse Jobs
                            </Link>
                            {!activeMentorship && (
                                <Link to="/mentorship" className="btn btn-outline w-full flex items-center justify-center gap-2">
                                    <Users size={18} />
                                    Find Mentor
                                </Link>
                            )}
                            <Link to="/events" className="btn btn-outline w-full flex items-center justify-center gap-2">
                                <Calendar size={18} />
                                View Events
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Section */}
            <div className="mt-8">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Your Activity</h3>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-primary mb-1">{stats.appliedJobs}</div>
                                <div className="text-sm text-secondary">Jobs Applied</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-success mb-1">{stats.mentorshipRequests}</div>
                                <div className="text-sm text-secondary">Mentorship Requests</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-info mb-1">{stats.events}</div>
                                <div className="text-sm text-secondary">Events Registered</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
