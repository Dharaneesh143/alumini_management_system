import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, XCircle, Users, MessageSquare, Clock, CheckCircle, ShieldAlert } from 'lucide-react';
import api from '../../config/api';
import DataTable from '../../components/DataTable';

const MentorshipManagement = () => {
    const navigate = useNavigate();
    const [mentorships, setMentorships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        studentDept: ''
    });

    useEffect(() => {
        fetchMentorships();
    }, [filters]);

    const fetchMentorships = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.studentDept) queryParams.append('studentDept', filters.studentDept);

            const res = await api.get(`/api/admin/mentorships?${queryParams.toString()}`);
            setMentorships(res.data);
        } catch (err) {
            console.error('Error fetching mentorships:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleEndMentorship = async (mentorshipId, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to end this mentorship relationship? This will notify both parties.')) return;

        try {
            await api.post('/api/admin/students/end-mentorship', { mentorshipId });
            alert('Mentorship relationship terminated');
            fetchMentorships();
        } catch (err) {
            console.error('Error ending mentorship:', err);
            alert('Failed to end mentorship');
        }
    };

    const columns = [
        {
            header: 'Topic',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{row.mentorshipTopic}</span>
                    <span className="text-xs text-secondary truncate max-w-[200px] italic">"{row.message}"</span>
                </div>
            )
        },
        {
            header: 'Student',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {row.student?.name?.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium text-sm">{row.student?.name}</div>
                        <div className="text-[10px] text-secondary">{row.student?.department} • {row.student?.batch}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Mentor (Alumni)',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-success-light text-success flex items-center justify-center font-bold text-xs">
                        {row.alumni?.name?.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium text-sm">{row.alumni?.name}</div>
                        <div className="text-[10px] text-secondary">{row.alumni?.jobRole} at {row.alumni?.currentCompany}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            render: (row) => (
                <span className={`badge ${['accepted', 'Active'].includes(row.status) ? 'badge-success' :
                    ['pending', 'Pending'].includes(row.status) ? 'badge-warning' :
                        ['completed', 'Completed'].includes(row.status) ? 'bg-blue-100 text-blue-700' :
                            'badge-danger'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Activity',
            render: (row) => (
                <div className="flex items-center gap-2 text-xs text-secondary">
                    <MessageSquare size={14} className="opacity-50" />
                    {row.messages?.length || 0} messages
                </div>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    {['accepted', 'Active'].includes(row.status) && (
                        <button
                            onClick={(e) => handleEndMentorship(row._id, e)}
                            className="btn btn-xs btn-outline-danger"
                            title="End Mentorship"
                        >
                            <XCircle size={14} />
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Admins might want to see the conversation or detail
                            // For now, let's link to student detail or alumni detail
                            navigate(`/admin/students/${row.student?._id}`);
                        }}
                        className="btn btn-xs btn-outline"
                        title="View Participants"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 mb-8">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold font-serif">Mentorship Management</h2>
                        <span className="sidebar-admin-badge">ADMIN</span>
                    </div>
                    <p className="text-secondary">Monitor and moderate mentorship relationships across the platform</p>
                </div>
                <div className="bg-white p-3 rounded-2xl border flex gap-6 shadow-sm">
                    <div className="flex flex-col items-center px-4 border-r">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Sessions</span>
                        <span className="text-xl font-bold text-success">{mentorships.filter(m => ['accepted', 'Active'].includes(m.status)).length}</span>
                    </div>
                    <div className="flex flex-col items-center px-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Requests</span>
                        <span className="text-xl font-bold text-warning">{mentorships.filter(m => ['pending', 'Pending'].includes(m.status)).length}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card shadow-sm border-gray-100 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            name="search"
                            className="form-input pl-10 border-gray-200"
                            placeholder="Search by student, mentor or topic..."
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <select
                        name="status"
                        className="form-input border-gray-200"
                        value={filters.status}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending Requests</option>
                        <option value="accepted">Accepted / Active</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                        <option value="removed">Removed by Admin</option>
                    </select>
                    <select
                        name="studentDept"
                        className="form-input border-gray-200"
                        value={filters.studentDept}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Student Departments</option>
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card shadow-md p-0 overflow-hidden border-transparent">
                <DataTable
                    columns={columns}
                    data={mentorships}
                    onRowClick={(row) => navigate(`/admin/students/${row.student?._id}`)}
                />
                {!loading && mentorships.length === 0 && (
                    <div className="p-20 text-center text-gray-400 bg-gray-50/50">
                        <Users className="mx-auto mb-4 opacity-10" size={64} />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No mentorships found</h3>
                        <p className="text-sm">No records matching your current filter criteria.</p>
                    </div>
                )}
                {loading && (
                    <div className="p-12 text-center text-secondary">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                        Accessing mentorship records...
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentorshipManagement;
