import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
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
            // Use legacy endpoint and filter client-side
            const jobsRes = await api.get(API_ENDPOINTS.GET_JOBS);
            const myJobs = jobsRes.data.filter(job => job.postedBy === user._id || job.postedBy?._id === user._id);

            setStats({
                jobsPosted: myJobs.length,
                views: 0,
                mentorships: 0,
                applications: 0
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
                        <p className="text-secondary">Alumni Dashboard</p>
                    </div>
                    <div>
                        <span className={`badge ${user?.isVerified ? 'badge-success' : 'badge-warning'}`}>
                            {user?.isVerified ? '✓ Verified Alumni' : '⏳ Pending Verification'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Verification Warning */}
            {!user?.isVerified && (
                <div className="card mb-6" style={{ background: 'var(--warning-light)', borderColor: 'var(--warning)' }}>
                    <div className="flex items-start gap-4">
                        <div className="text-2xl">⚠️</div>
                        <div className="flex-1">
                            <h4 className="font-semibold mb-1">Account Pending Verification</h4>
                            <p className="text-sm text-secondary">
                                Your account is awaiting admin verification. Some features may be restricted until your account is approved.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon="💼"
                    label="Jobs Posted"
                    value={stats.jobsPosted}
                    color="primary"
                />
                <StatCard
                    icon="👁️"
                    label="Total Views"
                    value="0"
                    color="info"
                />
                <StatCard
                    icon="👨‍🎓"
                    label="Mentorship Requests"
                    value="0"
                    color="success"
                />
                <StatCard
                    icon="📧"
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
                            className={`btn btn-primary w-full ${!user?.isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={(e) => !user?.isVerified && e.preventDefault()}
                        >
                            <span>➕</span>
                            Post a Job
                        </Link>
                        <Link to="/mentorship/requests" className="btn btn-outline w-full">
                            <span>👨‍🏫</span>
                            Mentorship Requests
                        </Link>
                        <Link to="/profile" className="btn btn-outline w-full">
                            <span>✏️</span>
                            Edit Profile
                        </Link>
                        <Link to="/jobs" className="btn btn-outline w-full">
                            <span>💼</span>
                            Browse Jobs
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
                            <div className="text-4xl mb-4">📊</div>
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
