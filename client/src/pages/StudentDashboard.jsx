import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import api, { API_ENDPOINTS } from '../config/api';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentJobs();
    }, []);

    const fetchRecentJobs = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.GET_JOBS);
            setJobs(res.data.slice(0, 3)); // Get top 3 recent jobs
        } catch (err) {
            console.error('Error fetching jobs:', err);
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
                    icon="💼"
                    label="Jobs Available"
                    value={jobs.length}
                    color="primary"
                />
                <StatCard
                    icon="🎯"
                    label="Applications"
                    value="0"
                    color="success"
                />
                <StatCard
                    icon="👨‍🏫"
                    label="Mentors"
                    value="0"
                    color="info"
                />
                <StatCard
                    icon="📅"
                    label="Events"
                    value="0"
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
                                <div className="text-4xl mb-4">💼</div>
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
                                                    <span>📍 {job.location}</span>
                                                    <span>💰 {job.salary || 'Not specified'}</span>
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

                {/* Quick Actions */}
                <div className="flex flex-col gap-6">
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
                            <Link to="/jobs" className="btn btn-outline w-full">
                                <span>💼</span>
                                Browse Jobs
                            </Link>
                            <Link to="/mentorship" className="btn btn-outline w-full">
                                <span>👨‍🏫</span>
                                Find Mentor
                            </Link>
                            <Link to="/events" className="btn btn-outline w-full">
                                <span>📅</span>
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
                                <div className="text-2xl font-bold text-primary mb-1">0</div>
                                <div className="text-sm text-secondary">Jobs Applied</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-success mb-1">0</div>
                                <div className="text-sm text-secondary">Mentorship Requests</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-info mb-1">0</div>
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
