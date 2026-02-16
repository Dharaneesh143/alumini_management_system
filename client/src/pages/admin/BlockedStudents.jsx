import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Mail } from 'lucide-react';
import api from '../../config/api';
import DataTable from '../../components/DataTable';

const BlockedStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchBlockedStudents();
    }, []);

    const fetchBlockedStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/blocked-students');
            setStudents(res.data);
        } catch (err) {
            console.error('Error fetching blocked students:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (userId) => {
        if (!confirm('Are you sure you want to reactivate this student?')) return;
        try {
            await api.post(`/api/admin/users/${userId}/activate`);
            alert('Student account reactivated successfully');
            fetchBlockedStudents();
        } catch (err) {
            console.error('Activation error:', err);
            alert('Failed to activate account');
        }
    };

    const columns = [
        {
            header: 'Student',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                        {(row.name || 'S').charAt(0)}
                    </div>
                    <div>
                        <div className="font-semibold text-slate-800">{row.name}</div>
                        <div className="text-xs text-slate-500">{row.registerNumber || 'N/A'} • {row.email}</div>
                    </div>
                </div>
            )
        },
        { header: 'Department', accessor: 'department' },
        { header: 'Batch', accessor: 'batch' },
        {
            header: 'Status',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${row.accountStatus === 'blocked' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                    {row.accountStatus || 'Blocked'}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleActivate(row._id)}
                        className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                    >
                        <UserCheck size={14} />
                        Activate
                    </button>
                    <button
                        onClick={() => window.location.href = `mailto:${row.email}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        <Mail size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Blocked Students</h1>
                    <p className="text-slate-500 text-sm">Review and manage restricted student accounts</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center gap-4">
                    <UserX size={24} className="text-amber-500" />
                    <div>
                        <div className="text-[10px] uppercase font-bold text-amber-400">Total Blocked</div>
                        <div className="text-xl font-bold text-amber-700">{students.length} Students</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm"
                            placeholder="Search students..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))}
                    loading={loading}
                />

                {students.length === 0 && !loading && (
                    <div className="p-12 text-center text-slate-500 italic">
                        No students are currently blocked.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlockedStudents;
