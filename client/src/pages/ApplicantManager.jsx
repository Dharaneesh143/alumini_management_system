import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { API_ENDPOINTS } from '../config/api';
import {
    User, FileText, Download, CheckCircle,
    XCircle, Phone, Globe, MessageSquare,
    ArrowLeft, Calendar, Mail, Search,
    Filter, ChevronRight, Briefcase
} from 'lucide-react';

const ApplicantManager = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [jobRes, appRes] = await Promise.all([
                api.get(API_ENDPOINTS.GET_JOB(id)),
                api.get(API_ENDPOINTS.GET_JOB_APPLICANTS(id))
            ]);
            setJob(jobRes.data);
            setApplicants(appRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (appId, status) => {
        try {
            await api.patch(`/api/jobs/applications/${appId}/status`, { status });
            setApplicants(applicants.map(app =>
                app._id === appId ? { ...app, status } : app
            ));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const filteredApplicants = applicants.filter(app => {
        const matchesSearch = app.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'All' || app.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) return <div className="p-20 text-center animate-pulse">Loading applicants...</div>;

    return (
        <div>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 -mx-8 -mt-8 px-8 py-10 mb-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-4">
                    <ArrowLeft size={16} /> Back to Opportunity
                </button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                Recruiter Dashboard
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                            {job?.title}
                        </h1>
                        <p className="text-gray-500 text-lg mt-1 font-medium">
                            Reviewing <span className="text-blue-600 font-bold">{applicants.length}</span> candidates for {job?.company}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center min-w-[120px]">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total</p>
                            <p className="text-2xl font-black text-gray-900">{applicants.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center min-w-[120px]">
                            <p className="text-xs font-black text-green-400 uppercase tracking-widest">Shortlisted</p>
                            <p className="text-2xl font-black text-green-600">
                                {applicants.filter(a => a.status === 'Shortlisted').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main>
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find character in candidates..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200">
                        {['All', 'Applied', 'Shortlisted', 'Rejected'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filterStatus === s ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Applicants Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {filteredApplicants.length > 0 ? (
                        filteredApplicants.map(app => (
                            <div key={app._id} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Student Profile Info */}
                                    <div className="flex gap-6 min-w-[300px]">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2rem] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-100">
                                            {app.studentId?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900">{app.studentId?.name}</h3>
                                            <div className="space-y-1 mt-2">
                                                <p className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                                    <Briefcase size={14} className="text-blue-500" />
                                                    {app.studentId?.department} • Batch {app.studentId?.batch}
                                                </p>
                                                <p className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                                    <Calendar size={14} className="text-blue-500" />
                                                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Application Details */}
                                    <div className="flex-1 grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-4 lg:py-0 border-y lg:border-y-0 lg:border-l border-gray-100 lg:pl-8">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact & Links</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                    <Phone size={14} /> {app.additionalDetails?.phone || 'Not provided'}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                    <Mail size={14} /> {app.studentId?.email}
                                                </div>
                                                {app.additionalDetails?.portfolioUrl && (
                                                    <a href={app.additionalDetails.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                                                        <Globe size={14} /> Portfolio / LinkedIn
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4 col-span-1 lg:col-span-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pitch / Message</p>
                                            <p className="text-sm text-gray-600 leading-relaxed italic line-clamp-3">
                                                "{app.additionalDetails?.coverLetter || "No cover letter provided."}"
                                            </p>
                                        </div>

                                        <div className="flex flex-col justify-center gap-3">
                                            {/* Preview & Download */}
                                            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-center justify-center h-20 overflow-hidden mb-1">
                                                {app.resumeUrl?.toLowerCase().endsWith('.pdf') ? (
                                                    <div className="flex items-center gap-2">
                                                        <FileText size={20} className="text-red-500" />
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">PDF Resume</span>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={`${api.defaults.baseURL}${app.resumeUrl}`}
                                                        alt="Candidate Resume"
                                                        className="max-h-full object-contain rounded-lg shadow-sm"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/100?text=Preview';
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            <a
                                                href={`${api.defaults.baseURL}${app.resumeUrl}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-md active:scale-95 text-xs"
                                            >
                                                <Download size={14} /> Download File
                                            </a>
                                        </div>
                                    </div>

                                    {/* Status Controls */}
                                    <div className="min-w-[180px] flex flex-row lg:flex-col justify-center items-center lg:items-end gap-3 lg:border-l border-gray-100 lg:pl-8">
                                        <div className="hidden lg:block mb-2">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Status</p>
                                            <span className={`mt-1 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${app.status === 'Shortlisted' ? 'bg-green-100 text-green-600' :
                                                app.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleStatusUpdate(app._id, 'Shortlisted')}
                                            disabled={app.status === 'Shortlisted'}
                                            className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all border border-green-100 disabled:opacity-50"
                                            title="Shortlist Candidate"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                                            disabled={app.status === 'Rejected'}
                                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50"
                                            title="Reject Candidate"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
                            <User size={40} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">No candidates match your criteria</h3>
                            <p className="text-gray-500 mt-1">Try resetting the status filter or search term</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ApplicantManager;
