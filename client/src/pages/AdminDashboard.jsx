import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, UserCheck, Clock, Briefcase } from 'lucide-react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import api from '../config/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
    const [deleteFeedback, setDeleteFeedback] = useState('');

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
            console.log('Sending verification request:', { userId, isVerified });
            const res = await api.post('/api/admin/verify-alumni', { userId, isVerified });
            console.log('Verification successful:', res.data);
            fetchStats();
            fetchUsers();
        } catch (err) {
            console.error('Error verifying alumni:', err);
            const errorMsg = err.response?.data?.msg || err.message;
            alert(`Failed to update verification status: ${errorMsg}`);
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

    const handleDeleteClick = (user) => {
        setSelectedUserForDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        if (!deleteFeedback.trim()) {
            alert('Please provide feedback for deletion');
            return;
        }

        try {
            await api.post('/api/admin/delete-user', {
                userId: selectedUserForDelete._id,
                feedback: deleteFeedback
            });
            setShowDeleteModal(false);
            setDeleteFeedback('');
            setSelectedUserForDelete(null);
            fetchStats();
            fetchUsers();
            alert('User deleted successfully and data removed from database.');
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(err.response?.data?.msg || 'Failed to delete user');
        }
    };

    const alumniColumns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        {
            header: 'Batch',
            render: (row) => row.batch || row.profile?.batch || 'N/A'
        },
        {
            header: 'Department',
            render: (row) => row.department || row.profile?.department || 'N/A'
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
                    <button
                        onClick={() => {
                            if (row.role === 'student') navigate(`/admin/students/${row._id}`);
                            else navigate(`/admin/alumni/${row._id}`);
                        }}
                        className="btn btn-xs btn-outline"
                    >
                        View
                    </button>
                    {row.role === 'alumni' && !row.isVerified && (
                        <button
                            onClick={() => handleVerifyAlumni(row._id, true)}
                            className="btn btn-sm btn-success"
                        >
                            Approve
                        </button>
                    )}
                    {row.role === 'alumni' && !row.isVerified && (
                        <button
                            onClick={() => handleVerifyAlumni(row._id, false)}
                            className="btn btn-sm btn-danger"
                        >
                            Reject
                        </button>
                    )}
                    {row.isVerified && (
                        <button
                            onClick={() => handleDeactivateUser(row._id)}
                            className="btn btn-sm btn-outline text-warning"
                        >
                            Deactivate
                        </button>
                    )}
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="btn btn-sm btn-danger"
                    >
                        Delete
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
            render: (row) => row.department || row.profile?.department || 'N/A'
        },
        {
            header: 'Batch',
            render: (row) => row.batch || row.profile?.batch || 'N/A'
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate(`/admin/students/${row._id}`)}
                        className="btn btn-xs btn-outline"
                    >
                        View
                    </button>
                    <button
                        onClick={() => handleDeactivateUser(row._id)}
                        className="btn btn-sm btn-outline text-warning"
                    >
                        Deactivate
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="btn btn-sm btn-danger"
                    >
                        Delete
                    </button>
                </div>
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
                        icon={Users}
                        label="Total Users"
                        value={stats.totalUsers}
                        color="primary"
                    />
                    <StatCard
                        icon={UserCheck}
                        label="Verified Alumni"
                        value={stats.verifiedAlumni}
                        color="success"
                    />
                    <StatCard
                        icon={Clock}
                        label="Pending Verifications"
                        value={stats.pendingAlumni}
                        color="warning"
                    />
                    <StatCard
                        icon={Briefcase}
                        label="Total Jobs"
                        value={stats.totalJobs}
                        color="info"
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

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Confirm Permanent Deletion</h3>
                        <p className="mb-4 text-secondary">
                            Deleting <strong>{selectedUserForDelete?.name}</strong> ({selectedUserForDelete?.email}) will permanently remove them from the database.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Feedback / Reason for Deletion</label>
                            <textarea
                                className="w-full border rounded p-2 focus:ring-2 focus:ring-primary h-24"
                                placeholder="Enter reason for deletion..."
                                value={deleteFeedback}
                                onChange={(e) => setDeleteFeedback(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-3 font-semibold">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteFeedback('');
                                }}
                                className="px-4 py-2 border rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteUser}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
