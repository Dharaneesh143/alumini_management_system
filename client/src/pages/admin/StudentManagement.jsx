import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, UserPlus, FileText, ChevronRight, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../config/api';
import DataTable from '../../components/DataTable';

const StudentManagement = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        department: '',
        batch: '',
        status: ''
    });

    const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
    const [deleteFeedback, setDeleteFeedback] = useState('');

    useEffect(() => {
        fetchStudents();
    }, [filters]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.department) queryParams.append('department', filters.department);
            if (filters.batch) queryParams.append('batch', filters.batch);
            if (filters.status) queryParams.append('status', filters.status);

            const res = await api.get(`/api/admin/students?${queryParams.toString()}`);
            setStudents(res.data);
        } catch (err) {
            console.error('Error fetching students:', err);
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
            fetchStudents();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete user');
        }
    };

    const handleActivate = async (userId, e) => {
        e.stopPropagation();
        try {
            await api.post(`/api/admin/users/${userId}/activate`);
            alert('Account activated successfully');
            fetchStudents();
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
            fetchStudents();
        } catch (err) {
            console.error('Deactivate error:', err);
            alert('Failed to deactivate account');
        }
    };

    const columns = [
        {
            header: 'Student Name',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold">
                        {(row.name || 'S').charAt(0)}
                    </div>
                    <div>
                        <div className="font-semibold">{row.name}</div>
                        <div className="text-xs text-secondary">{row.email}</div>
                    </div>
                </div>
            )
        },
        { header: 'Reg No', accessor: 'registerNumber' },
        { header: 'Department', accessor: 'department' },
        { header: 'Passout Year', accessor: 'batch' },
        {
            header: 'Status',
            render: (row) => (
                <span className={`badge ${row.accountStatus === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {row.accountStatus?.toUpperCase() || 'ACTIVE'}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/students/${row._id}`);
                        }}
                        className="btn btn-xs btn-outline flex items-center gap-1"
                    >
                        <ChevronRight size={14} />
                    </button>
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
                    <button
                        onClick={(e) => handleDeleteClick(row, e)}
                        className="btn btn-xs btn-danger flex items-center"
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
                    <h2 className="text-2xl font-bold">Student Management</h2>
                    <p className="text-secondary">View and manage all registered student accounts</p>
                </div>
                <div className="bg-white p-2 rounded-lg border flex gap-4">
                    <div className="text-center px-4 border-r">
                        <div className="text-sm text-secondary">Total</div>
                        <div className="font-bold text-xl">{students.length}</div>
                    </div>
                    <div className="text-center px-4">
                        <div className="text-sm text-secondary">Active</div>
                        <div className="font-bold text-xl text-success">
                            {students.filter(s => s.accountStatus === 'active').length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="card shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                        <input
                            type="text"
                            name="search"
                            className="form-input pl-10"
                            placeholder="Search name, email, reg no..."
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <select
                        name="department"
                        className="form-input"
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
                        name="batch"
                        className="form-input"
                        value={filters.batch}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Batch Years</option>
                        {[2023, 2024, 2025, 2026, 2027].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <select
                        name="status"
                        className="form-input"
                        value={filters.status}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>
            </div>

            {/* Students Table */}
            <div className="card shadow-md p-0 overflow-hidden pb-8" style={{ paddingBottom: '2rem' }}>
                <DataTable
                    columns={columns}
                    data={students}
                    onRowClick={(row) => navigate(`/admin/students/${row._id}`)}
                />
                {loading && (
                    <div className="p-8 text-center text-secondary">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        Refreshing student data...
                    </div>
                )}
            </div>

            {/* Delete Modal - Refined Review Style Design */}
            {deleteModal.show && (
                <div
                    className="fixed inset-0 bg-opacity-30 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setDeleteModal({ show: false, user: null });
                            setDeleteFeedback('');
                        }
                    }}
                >
                    <div
                        className="bg-white rounded-[2rem] p-6 w-full max-w-[400px] shadow-2xl relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button - Top Right (Circle style) */}
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

                        {/* Title Section */}
                        <h3 className="text-[24px] font-bold text-gray-900 mb-6 font-serif leading-tight">Delete Student</h3>

                        {/* User Identity Section */}
                        <div className="flex items-center gap-4 mb-8 pb-2">
                            <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-red-200">
                                {(deleteModal.user?.name || 'S').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-lg text-gray-900 leading-tight">{deleteModal.user?.name}</p>
                                <p className="text-[15px] text-gray-500 mt-0.5">Student</p>
                            </div>
                        </div>

                        {/* Question Header */}
                        <div className="mb-6">
                            <p className="text-[17px] font-semibold text-gray-800">Why are you deleting this student?</p>
                        </div>

                        {/* Feedback Input Block */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-500 mb-3">
                                Describe the reason
                            </label>
                            <textarea
                                className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-32 resize-none text-[15px] text-gray-900 placeholder-gray-400"
                                placeholder=""
                                value={deleteFeedback}
                                onChange={(e) => setDeleteFeedback(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={confirmDelete}
                            disabled={!deleteFeedback.trim()}
                            className="w-full py-4 bg-[#1a73e8] hover:bg-[#1557b0] h-12.5 text-white font-bold rounded-full disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-[17px]"
                        >
                            Confirm Deletion
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;
