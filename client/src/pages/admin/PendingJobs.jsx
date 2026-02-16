import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, Briefcase, FileText } from 'lucide-react';
import api from '../../config/api';
import DataTable from '../../components/DataTable';

const PendingJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPendingJobs();
    }, []);

    const fetchPendingJobs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/pending-jobs');
            setJobs(res.data);
        } catch (err) {
            console.error('Error fetching pending jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (jobId, status) => {
        if (!confirm(`Are you sure you want to ${status} this job?`)) return;
        try {
            await api.patch(`/api/jobs/${jobId}/approve`, { status });
            alert(`Job ${status} successfully`);
            fetchPendingJobs();
        } catch (err) {
            console.error('Approval error:', err);
            alert(`Failed to ${status} job`);
        }
    };

    const columns = [
        {
            header: 'Position & Company',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Briefcase size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800">{row.title}</div>
                        <div className="text-xs text-slate-500">{row.company}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Posted By',
            render: (row) => (
                <div>
                    <div className="text-sm font-medium text-slate-700">{row.postedBy?.name || 'Deleted Alumni'}</div>
                    <div className="text-xs text-slate-400">{row.postedBy?.email}</div>
                </div>
            )
        },
        {
            header: 'Type',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${row.opportunityType === 'Job' ? 'bg-indigo-100 text-indigo-700' : 'bg-cyan-100 text-cyan-700'
                    }`}>
                    {row.opportunityType}
                </span>
            )
        },
        {
            header: 'Date Posted',
            render: (row) => <span className="text-slate-500 text-sm">{new Date(row.createdAt).toLocaleDateString()}</span>
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleApproval(row._id, 'approved')}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                        title="Approve"
                    >
                        <CheckCircle size={18} />
                    </button>
                    <button
                        onClick={() => handleApproval(row._id, 'rejected')}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                        title="Reject"
                    >
                        <XCircle size={18} />
                    </button>
                    <button
                        onClick={() => window.open(`/jobs/${row._id}`, '_blank')}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <Eye size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Pending Job Approvals</h1>
                    <p className="text-slate-500 text-sm">Review and moderate new job postings from alumni</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center gap-4">
                    <FileText size={24} className="text-indigo-500" />
                    <div>
                        <div className="text-[10px] uppercase font-bold text-indigo-400">Total Pending</div>
                        <div className="text-xl font-bold text-indigo-700">{jobs.length} Posts</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2  bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                            placeholder="Search by title or company..."
                            
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                </div>

                <DataTable
                    columns={columns}
                    data={jobs.filter(j =>
                        j.title.toLowerCase().includes(search.toLowerCase()) ||
                        j.company.toLowerCase().includes(search.toLowerCase())
                    )}
                    loading={loading}
                />

                {jobs.length === 0 && !loading && (
                    <div className="p-12 text-center text-slate-500 italic">
                        No job postings are currently waiting for approval.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingJobs;
