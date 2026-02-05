import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import {
    Briefcase,
    Eye,
    GraduationCap,
    Mail,
    CheckCircle,
    Clock,
    AlertTriangle,
    Plus,
    User,
    BarChart,
    ChevronRight,
    Search,
    Edit
} from 'lucide-react';
import StatCard from '../components/StatCard';
import api, { API_ENDPOINTS } from '../config/api';

const AlumniDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        jobsPosted: 0,
        views: 0,
        mentorships: 0,
        applications: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [jobsRes, mentorshipRes] = await Promise.all([
                api.get(API_ENDPOINTS.GET_JOBS),
                api.get(API_ENDPOINTS.GET_MENTORSHIP_REQUESTS)
            ]);

            const myJobs = jobsRes.data.filter(job => job.postedBy === user._id || job.postedBy?._id === user._id);
            const pendingMentorships = mentorshipRes.data.filter(req => req.status === 'pending');

            setStats({
                jobsPosted: myJobs.length,
                views: 0,
                mentorships: pendingMentorships.length,
                applications: 0
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleToggleMentorship = async () => {
        try {
            const res = await api.put('/api/alumni/profile', {
                isMentor: !user.isMentor
            });
            // Update local user context (if possible) or refresh page
            window.location.reload();
        } catch (err) {
            console.error('Error toggling mentorship:', err);
        }
    };

    const [showSettings, setShowSettings] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        capacity: user?.mentorSettings?.capacity || 3,
        mentorshipAreas: user?.mentorSettings?.mentorshipAreas || [],
        resumeReview: user?.mentorSettings?.resumeReview ?? true
    });

    const MENTORSHIP_AREAS = ['Career Guidance', 'Coding', 'Placement', 'Higher Studies'];

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            await api.put('/api/alumni/profile', {
                mentorSettings: settingsForm
            });
            setShowSettings(false);
            window.location.reload();
        } catch (err) {
            console.error('Error saving settings:', err);
        }
    };

    const toggleArea = (area) => {
        setSettingsForm(prev => ({
            ...prev,
            mentorshipAreas: prev.mentorshipAreas.includes(area)
                ? prev.mentorshipAreas.filter(a => a !== area)
                : [...prev.mentorshipAreas, area]
        }));
    };

    return (
        <div>
            {/* Modal for Mentorship Settings */}
            {showSettings && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Mentorship Settings</h2>
                            <button onClick={() => setShowSettings(false)} className="text-secondary text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSaveSettings}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Max Students Capacity</label>
                                <input
                                    type="number"
                                    className="form-input w-full"
                                    min="1" max="10"
                                    value={settingsForm.capacity}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, capacity: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Mentorship Areas</label>
                                <div className="flex flex-wrap gap-2">
                                    {MENTORSHIP_AREAS.map(area => (
                                        <button
                                            key={area}
                                            type="button"
                                            onClick={() => toggleArea(area)}
                                            className={`badge cursor-pointer transition-all ${settingsForm.mentorshipAreas.includes(area) ? 'badge-primary' : 'badge-gray'}`}
                                        >
                                            {area}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6 flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="resume-review"
                                    checked={settingsForm.resumeReview}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, resumeReview: e.target.checked })}
                                />
                                <label htmlFor="resume-review" className="text-sm">Allow Resume Review</label>
                            </div>
                            <div className="flex gap-4">
                                <button type="submit" className="btn btn-primary flex-1">Save Settings</button>
                                <button type="button" onClick={() => setShowSettings(false)} className="btn btn-outline flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Welcome Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
                        <div className="flex items-center gap-3">
                            <p className="text-secondary">Alumni Dashboard</p>
                            <span className="text-muted">•</span>
                            <div className="flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={user?.isMentor || false}
                                        onChange={handleToggleMentorship}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                                <span className="text-sm font-medium">Available for Mentorship</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={Briefcase}
                    label="Jobs Posted"
                    value={stats.jobsPosted}
                    color="primary"
                />
                <StatCard
                    icon={Eye}
                    label="Total Views"
                    value="0"
                    color="info"
                />
                <StatCard
                    icon={GraduationCap}
                    label="Mentorship Requests"
                    value={stats.mentorships}
                    color="success"
                />
                <StatCard
                    icon={Mail}
                    label="Applications"
                    value="0"
                    color="warning"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="card">
                    <h3 className="card-title mb-4">Quick Actions</h3>
                    <div className="flex flex-col gap-3">
                        <Link
                            to="/jobs/create"
                            className="btn btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            Post a Job
                        </Link>
                        <Link to="/mentorship/requests" className="btn btn-outline w-full flex items-center justify-center gap-2">
                            <GraduationCap size={18} />
                            Mentorship Requests
                        </Link>
                        {user?.isMentor && (
                            <button
                                onClick={() => setShowSettings(true)}
                                className="btn btn-outline w-full flex items-center justify-center gap-2"
                            >
                                <Clock size={18} />
                                Mentorship Settings
                            </button>
                        )}
                        <Link to="/profile" className="btn btn-outline w-full flex items-center justify-center gap-2">
                            <Edit size={18} />
                            Edit Profile
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header">
                        <h3 className="card-title">Recent Activity</h3>
                    </div>
                    <div className="card-body">
                        <div className="text-center text-secondary py-8">
                            <div className="flex justify-center mb-4">
                                <BarChart size={48} className="text-muted" />
                            </div>
                            <p>No recent activity</p>
                            <p className="text-sm mt-2">Start by posting a job or accepting mentorship requests</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Information */}
            <div className="mt-8">
                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center justify-between">
                            <h3 className="card-title">Your Profile</h3>
                            <Link to="/profile" className="text-sm text-primary font-medium">
                                Edit Profile →
                            </Link>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <div className="mb-4">
                                    <div className="text-xs text-secondary mb-1">Department</div>
                                    <div className="font-medium">{user?.profile?.department || 'Not specified'}</div>
                                </div>
                                <div className="mb-4">
                                    <div className="text-xs text-secondary mb-1">Batch</div>
                                    <div className="font-medium">{user?.profile?.batch || 'Not specified'}</div>
                                </div>
                                <div className="mb-4">
                                    <div className="text-xs text-secondary mb-1">Company</div>
                                    <div className="font-medium">{user?.profile?.company || 'Not specified'}</div>
                                </div>
                            </div>
                            <div>
                                <div className="mb-4">
                                    <div className="text-xs text-secondary mb-1">Designation</div>
                                    <div className="font-medium">{user?.profile?.designation || 'Not specified'}</div>
                                </div>
                                <div className="mb-4">
                                    <div className="text-xs text-secondary mb-1">Skills</div>
                                    <div className="flex flex-wrap gap-2">
                                        {user?.profile?.skills && user.profile.skills.length > 0 ? (
                                            user.profile.skills.map((skill, index) => (
                                                <span key={index} className="badge badge-gray">{skill}</span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-secondary">No skills added</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlumniDashboard;
