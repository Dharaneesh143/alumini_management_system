import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, UserPlus, FileText, ChevronRight, Trash2 } from 'lucide-react';
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

    const columns = [
        {
            header: 'Student Name',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold">
                        {row.name.charAt(0)}
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
        <div className="space-y-6">
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
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="MECH">MECH</option>
                        <option value="CIVIL">CIVIL</option>
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
            <div className="card shadow-md p-0 overflow-hidden">
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

            {/* Delete Feedback Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 text-danger mb-4">
                            <Trash2 size={24} />
                            <h3 className="text-xl font-bold">Confirm Permanent Deletion</h3>
                        </div>
                        <p className="text-secondary mb-4">
                            Are you sure you want to permanently delete <strong>{deleteModal.user.name}</strong>?
                            This action will remove them from MongoDB and cannot be undone.
                        </p>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Reason for deletion (Feedback)</label>
                            <textarea
                                className="form-input w-full min-h-[100px]"
                                placeholder="Please provide a reason for removing this account..."
                                value={deleteFeedback}
                                onChange={(e) => setDeleteFeedback(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setDeleteModal({ show: false, user: null });
                                    setDeleteFeedback('');
                                }}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="btn btn-danger"
                                disabled={!deleteFeedback.trim()}
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

export default StudentManagement;
