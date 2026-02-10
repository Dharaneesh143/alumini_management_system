import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Trash2, UserCheck, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import api from '../../config/api';
import DataTable from '../../components/DataTable';

const AlumniManagement = () => {
    const navigate = useNavigate();
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        department: '',
        status: '',
        verification: '' // all, verified, pending
    });

    const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
    const [deleteFeedback, setDeleteFeedback] = useState('');

    useEffect(() => {
        fetchAlumni();
    }, [filters]);

    const fetchAlumni = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.department) queryParams.append('department', filters.department);
            if (filters.status) queryParams.append('status', filters.status);

            if (filters.verification === 'verified') queryParams.append('isVerified', 'true');
            if (filters.verification === 'pending') queryParams.append('isVerified', 'false');

            const res = await api.get(`/api/admin/alumni?${queryParams.toString()}`);
            setAlumni(res.data);
        } catch (err) {
            console.error('Error fetching alumni:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleDeleteClick = (user, e) => {
        e.stopPropagation();
        setDeleteModal({ show: true, user });
    };

    const confirmDelete = async () => {
        if (!deleteFeedback.trim()) return alert('Feedback is required for deletion');

        try {
            await api.post('/api/admin/delete-user', {
                userId: deleteModal.user._id,
                feedback: deleteFeedback
            });
            alert('User deleted permanently from platform');
            setDeleteModal({ show: false, user: null });
            setDeleteFeedback('');
            fetchAlumni();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete user');
        }
    };

    const handleVerifySync = async (userId, isVerified) => {
        try {
            await api.post('/api/admin/verify-alumni', { userId, isVerified });
            fetchAlumni();
        } catch (err) {
            console.error('Verification error:', err);
            alert('Action failed');
        }
    };

    const handleActivate = async (userId, e) => {
        e.stopPropagation();
        try {
            await api.post(`/api/admin/users/${userId}/activate`);
            alert('Account activated successfully');
            fetchAlumni();
        } catch (err) {
            console.error('Activate error:', err);
            alert('Failed to activate account');
        }
    };

    const handleDeactivate = async (userId, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to deactivate this account?')) return;
        try {
            await api.delete(`/api/admin/users/${userId}`);
            alert('Account deactivated successfully');
            fetchAlumni();
        } catch (err) {
            console.error('Deactivate error:', err);
            alert('Failed to deactivate account');
        }
    };

    const handleDeactivationAction = async (userId, action, e) => {
        e.stopPropagation();
        const confirmMsg = action === 'approve'
            ? 'Are you sure you want to APPROVE this deactivation request?'
            : 'Are you sure you want to REJECT this deactivation request?';

        if (!confirm(confirmMsg)) return;

        try {
            await api.post('/api/admin/handle-deactivation', { userId, action });
            alert(`Deactivation request ${action}d successfully`);
            fetchAlumni();
        } catch (err) {
            console.error('Handled deactivation error:', err);
            alert(`Failed to ${action} request`);
        }
    };

    const columns = [
        {
            header: 'Alumni Name',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success-light text-success flex items-center justify-center font-bold">
                        {(row.name || 'A').charAt(0)}
                    </div>
                    <div>
                        <div className="font-semibold">{row.name}</div>
                        <div className="text-xs text-secondary">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Batch',
            render: (row) => row.batch || row.profile?.batch || 'N/A'
        },
        {
            header: 'Current Company',
            render: (row) => row.currentCompany || row.profile?.company || 'N/A'
        },
        {
            header: 'Status',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <span className={`badge ${row.isVerified ? 'badge-success' : 'badge-warning'}`}>
                        {row.isVerified ? 'Verified' : 'Pending'}
                    </span>
                    {row.accountStatus !== 'active' && (
                        <span className="badge badge-danger text-[10px]">
                            {row.accountStatus?.toUpperCase()}
                        </span>
                    )}
                    {row.deactivationRequest?.status === 'pending' && (
                        <span className="badge badge-error text-[10px] bg-red-100 text-red-700 font-bold border-red-200">
                            DEACTIVATE REQ
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/alumni/${row._id}`);
                        }}
                        className="btn btn-xs btn-outline hover:bg-primary-light"
                        title="View Details"
                    >
                        <ChevronRight size={14} />
                    </button>
                    {!row.isVerified && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleVerifySync(row._id, true);
                            }}
                            className="btn btn-xs btn-success"
                            title="Approve"
                        >
                            <UserCheck size={14} />
                        </button>
                    )}
                    {row.deactivationRequest?.status === 'pending' ? (
                        <>
                            <button
                                onClick={(e) => handleDeactivationAction(row._id, 'approve', e)}
                                className="btn btn-xs btn-success rounded-full px-3"
                                title="Approve Deactivation"
                            >
                                <CheckCircle size={14} className="mr-1" /> Approve
                            </button>
                            <button
                                onClick={(e) => handleDeactivationAction(row._id, 'reject', e)}
                                className="btn btn-xs btn-danger rounded-full px-3"
                                title="Reject Deactivation"
                            >
                                <XCircle size={14} className="mr-1" /> Reject
                            </button>
                        </>
                    ) : (
                        <>
                            {row.accountStatus === 'active' ? (
                                <button
                                    onClick={(e) => handleDeactivate(row._id, e)}
                                    className="btn btn-xs btn-secondary"
                                    title="Deactivate Account"
                                >
                                    <XCircle size={14} />
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => handleActivate(row._id, e)}
                                    className="btn btn-xs btn-success"
                                    title="Activate Account"
                                >
                                    <CheckCircle size={14} />
                                </button>
                            )}
                        </>
                    )}
                    <button
                        onClick={(e) => handleDeleteClick(row, e)}
                        className="btn btn-xs btn-danger"
                        title="Delete Permanently"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 mb-8">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold font-serif">Alumni Management</h2>
                        <span className="sidebar-admin-badge">ADMIN</span>
                        <span className="sidebar-admin-badge" style={{ background: '#3b82f6' }}>ALUMNI</span>
                    </div>
                    <p className="text-secondary">Verify and manage alumni accounts and platform access</p>
                </div>
                <div className="bg-white p-2 rounded-lg border flex gap-4 shadow-sm">
                    <div className="text-center px-4 border-r">
                        <div className="text-sm text-secondary">Total</div>
                        <div className="font-bold text-xl">{alumni.length}</div>
                    </div>
                    <div className="text-center px-4">
                        <div className="text-sm text-secondary text-warning">Pending</div>
                        <div className="font-bold text-xl text-warning">
                            {alumni.filter(a => !a.isVerified).length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="card shadow-sm border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            name="search"
                            className="form-input pl-10 border-gray-200 focus:border-success focus:ring-success"
                            placeholder="Search alumni..."
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <select
                        name="department"
                        className="form-input border-gray-200"
                        value={filters.department}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Departments</option>
                        <option value="BE CSE (Computer Science & Engineering)">BE CSE (Computer Science & Engineering)</option>
                        <option value="BE ECE (Electronics & Communication Engineering)">BE ECE (Electronics & Communication Engineering)</option>
                        <option value="BE EEE (Electrical & Electronics Engineering)">BE EEE (Electrical & Electronics Engineering)</option>
                        <option value="BE MECH (Mechanical Engineering)">BE MECH (Mechanical Engineering)</option>
                        <option value="BE CIVIL (Civil Engineering)">BE CIVIL (Civil Engineering)</option>
                        <option value="BE BME (Biomedical Engineering)">BE BME (Biomedical Engineering)</option>
                        <option value="BE AGRI (Agricultural Engineering)">BE AGRI (Agricultural Engineering)</option>
                        <option value="BE AERO (Aeronautical Engineering)">BE AERO (Aeronautical Engineering)</option>
                        <option value="BE AUTO (Automobile Engineering)">BE AUTO (Automobile Engineering)</option>
                        <option value="BTech IT (Information Technology)">BTech IT (Information Technology)</option>
                        <option value="BTech AI&DS (Artificial Intelligence & Data Science)">BTech AI&DS (Artificial Intelligence & Data Science)</option>
                        <option value="BTech CSBS (Computer Science & Business Systems)">BTech CSBS (Computer Science & Business Systems)</option>
                        <option value="BTech CHEM (Chemical Engineering)">BTech CHEM (Chemical Engineering)</option>
                    </select>
                    <select
                        name="verification"
                        className="form-input border-gray-200"
                        value={filters.verification}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Verification Staus</option>
                        <option value="verified">Verified Only</option>
                        <option value="pending">Pending Only</option>
                    </select>
                    <select
                        name="status"
                        className="form-input border-gray-200"
                        value={filters.status}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Account Status</option>
                        <option value="active">Active</option>
                        <option value="deactivated">Deactivated</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>
            </div>

            {/* Alumni Table */}
            <div className="card shadow-md p-0 overflow-hidden border-gray-100">
                <DataTable
                    columns={columns}
                    data={alumni}
                    onRowClick={(row) => navigate(`/admin/alumni/${row._id}`)}
                />
                {!loading && alumni.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        <ShieldAlert className="mx-auto mb-2 opacity-20" size={48} />
                        <p>No alumni matching your filters were found.</p>
                    </div>
                )}
                {loading && (
                    <div className="p-8 text-center text-secondary">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-success mx-auto mb-2"></div>
                        Refreshing alumni record...
                    </div>
                )}
            </div>

            {/* Delete Modal - Consistent Review Style Design */}
            {deleteModal.show && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setDeleteModal({ show: false, user: null });
                            setDeleteFeedback('');
                        }
                    }}
                >
                    <div
                        className="bg-white rounded-[2rem] p-8 w-full max-w-[400px] shadow-2xl relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => {
                                setDeleteModal({ show: false, user: null });
                                setDeleteFeedback('');
                            }}
                            className="absolute top-8 right-8 w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all group"
                        >
                            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-[24px] font-bold text-gray-900 mb-6 font-serif leading-tight">Delete Alumni</h3>

                        <div className="flex items-center gap-4 mb-8 pb-2">
                            <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-red-200">
                                {(deleteModal.user?.name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-lg text-gray-900 leading-tight">{deleteModal.user?.name}</p>
                                <p className="text-[15px] text-gray-500 mt-0.5">Alumni</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-[17px] font-semibold text-gray-800">Why are you removing this alumni record?</p>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-500 mb-3">
                                Provide deletion reason
                            </label>
                            <textarea
                                className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all h-32 resize-none text-[15px] text-gray-900 placeholder-gray-400"
                                value={deleteFeedback}
                                onChange={(e) => setDeleteFeedback(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <button
                            onClick={confirmDelete}
                            disabled={!deleteFeedback.trim()}
                            className="w-full py-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold rounded-full disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-[17px]"
                        >
                            Confirm Deletion
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlumniManagement;
