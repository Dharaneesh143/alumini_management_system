import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import api from '../config/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const location = useLocation(); // Add hook usage
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.pathname.includes('/admin/users')) setFilter('all');
        else if (location.pathname.includes('/admin/alumni')) setFilter('alumni');
        else if (location.pathname.includes('/admin/students')) setFilter('students');
    }, [location]);

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, [filter]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/api/admin/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            let url = '/api/admin/users';
            if (filter === 'alumni') url += '?role=alumni';
            if (filter === 'students') url += '?role=student';
            if (filter === 'pending') url += '?role=alumni&isVerified=false';

            const res = await api.get(url);
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAlumni = async (userId, isVerified) => {
        try {
            await api.post('/api/admin/verify-alumni', { userId, isVerified });
            fetchStats();
            fetchUsers();
        } catch (err) {
            console.error('Error verifying alumni:', err);
            alert('Failed to update verification status');
        }
    };

    const handleDeactivateUser = async (userId) => {
        if (!window.confirm('Are you sure you want to deactivate this user?')) return;

        try {
            await api.delete(`/api/admin/users/${userId}`);
            fetchStats();
            fetchUsers();
        } catch (err) {
            console.error('Error deactivating user:', err);
            alert('Failed to deactivate user');
        }
    };

    const alumniColumns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        {
            header: 'Batch',
            render: (row) => row.profile?.batch || 'N/A'
        },
        {
            header: 'Department',
            render: (row) => row.profile?.department || 'N/A'
        },
        {
            header: 'Company',
            render: (row) => row.profile?.company || 'N/A'
        },
        {
            header: 'Status',
            render: (row) => (
                <span className={`badge ${row.isVerified ? 'badge-success' : 'badge-warning'}`}>
                    {row.isVerified ? 'Verified' : 'Pending'}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    {!row.isVerified && (
                        <button
                            onClick={() => handleVerifyAlumni(row._id, true)}
                            className="btn btn-sm btn-success"
                        >
                            Approve
                        </button>
                    )}
                    {!row.isVerified && (
                        <button
                            onClick={() => handleVerifyAlumni(row._id, false)}
                            className="btn btn-sm btn-danger"
                        >
                            Reject
                        </button>
                    )}
                    <button
                        onClick={() => handleDeactivateUser(row._id)}
                        className="btn btn-sm btn-outline"
                    >
                        Deactivate
                    </button>
                </div>
            )
        }
    ];

    const studentColumns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        {
            header: 'Department',
            render: (row) => row.profile?.department || 'N/A'
        },
        {
            header: 'Batch',
            render: (row) => row.profile?.batch || 'N/A'
        },
        {
            header: 'Actions',
            render: (row) => (
                <button
                    onClick={() => handleDeactivateUser(row._id)}
                    className="btn btn-sm btn-outline"
                >
                    Deactivate
                </button>
            )
        }
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
                <p className="text-secondary">System overview and user management</p>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon="👥"
                        label="Total Users"
                        value={stats.totalUsers}
                    />
                    <StatCard
                        icon="🎓"
                        label="Verified Alumni"
                        value={stats.verifiedAlumni}
                    />
                    <StatCard
                        icon="⏳"
                        label="Pending Verifications"
                        value={stats.pendingAlumni}
                    />
                    <StatCard
                        icon="💼"
                        label="Total Jobs"
                        value={stats.totalJobs}
                    />
                </div>
            )}

            {/* User Management */}
            <div className="card">
                <div className="card-header">
                    <div className="flex items-center justify-between">
                        <h3 className="card-title">User Management</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                            >
                                All Users
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                            >
                                Pending Alumni
                            </button>
                            <button
                                onClick={() => setFilter('alumni')}
                                className={`btn btn-sm ${filter === 'alumni' ? 'btn-primary' : 'btn-outline'}`}
                            >
                                All Alumni
                            </button>
                            <button
                                onClick={() => setFilter('students')}
                                className={`btn btn-sm ${filter === 'students' ? 'btn-primary' : 'btn-outline'}`}
                            >
                                Students
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-8 text-secondary">Loading...</div>
                    ) : (
                        <DataTable
                            columns={filter === 'students' ? studentColumns : alumniColumns}
                            data={users}
                        />
                    )}
                </div>
            </div>

            {/* System Info */}
            {stats && (
                <div className="grid grid-cols-3 gap-6 mt-8">
                    <div className="card">
                        <h4 className="font-semibold mb-4">Student Statistics</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-secondary">Total Students</span>
                                <span className="font-semibold">{stats.totalStudents}</span>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <h4 className="font-semibold mb-4">Alumni Statistics</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-secondary">Total Alumni</span>
                                <span className="font-semibold">{stats.totalAlumni}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary">Verified</span>
                                <span className="font-semibold text-success">{stats.verifiedAlumni}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary">Pending</span>
                                <span className="font-semibold text-warning">{stats.pendingAlumni}</span>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <h4 className="font-semibold mb-4">Platform Activity</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-secondary">Jobs Posted</span>
                                <span className="font-semibold">{stats.totalJobs}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
