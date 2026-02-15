import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext.jsx';
import {
    Search, Briefcase, Clock, MapPin,
    Filter, Building2, DollarSign,
    Calendar, CheckCircle, TrendingUp,
    Sparkles, Plus, Trash2, Edit, X, ArrowRight
} from 'lucide-react';

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedJobForDelete, setSelectedJobForDelete] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, [activeTab]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (activeTab !== 'All') query.append('type', activeTab);
            if (searchQuery) query.append('search', searchQuery);

            const res = await api.get(`${API_ENDPOINTS.GET_JOBS}?${query.toString()}`);
            setJobs(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    const handleDeleteClick = (job, e) => {
        e.stopPropagation();
        setSelectedJobForDelete(job);
        setShowDeleteModal(true);
    };

    const confirmDeleteJob = async () => {
        try {
            await api.delete(`${API_ENDPOINTS.GET_JOBS}/${selectedJobForDelete._id}`);
            setShowDeleteModal(false);
            fetchJobs();
        } catch (err) {
            alert('Failed to delete job');
        }
    };

    const OpportunityCard = ({ job }) => {
        const isJob = job.opportunityType === 'Job';

        return (
            <div
                className="group bg-white rounded-3xl p-7 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 cursor-pointer relative overflow-hidden"
                onClick={() => navigate(`/jobs/${job._id}`)}
            >
                {/* Gradient accent on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex gap-6">
                    {/* Enhanced Logo */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border-2 border-blue-100 flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                        {job.companyLogo ? (
                            <img src={`${api.defaults.baseURL}${job.companyLogo}`} alt={job.company} className="w-full h-full object-contain p-2" />
                        ) : (
                            <Building2 className="w-9 h-9 text-blue-500" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-1 truncate">
                                    {job.title}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Building2 size={16} className="flex-shrink-0" />
                                    <p className="font-semibold truncate">{job.company}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 justify-end">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${isJob
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                        : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                                    }`}>
                                    {job.opportunityType}
                                </span>
                                {job.approvalStatus && job.approvalStatus !== 'approved' && (user?.role === 'admin' || (user?.role === 'alumni' && job.postedBy?._id === user.id)) && (
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${job.approvalStatus === 'pending'
                                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                            : 'bg-red-100 text-red-700 border border-red-200'
                                        }`}>
                                        {job.approvalStatus}
                                    </span>
                                )}
                                {job.hasApplied && (
                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
                                        <CheckCircle size={14} /> APPLIED
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Job Details Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5 mb-5">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <MapPin size={16} className="text-blue-600" />
                                </div>
                                <span className="text-gray-700 font-medium truncate">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                                    <DollarSign size={16} className="text-green-600" />
                                </div>
                                <span className="text-gray-700 font-medium truncate">
                                    {isJob ? (job.salaryRange || 'Competitive') : `${job.stipend || 'Unpaid'}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                    <Clock size={16} className="text-purple-600" />
                                </div>
                                <span className="text-gray-700 font-medium truncate">
                                    {isJob ? job.employmentType : job.duration}
                                </span>
                            </div>
                            {job.deadline && (
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                                        <Calendar size={16} className="text-orange-600" />
                                    </div>
                                    <span className="text-orange-700 font-semibold truncate">
                                        {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Skills Tags */}
                        {job.requiredSkills?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {job.requiredSkills.slice(0, 5).map((skill, i) => (
                                    <span key={i} className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 hover:border-blue-300 transition-colors">
                                        {skill}
                                    </span>
                                ))}
                                {job.requiredSkills.length > 5 && (
                                    <span className="text-xs text-blue-600 font-bold px-2 py-1.5">
                                        +{job.requiredSkills.length - 5} more
                                    </span>
                                )}
                            </div>
                        )}

                        {/* View Details Arrow */}
                        <div className="absolute bottom-7 right-7 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                                <ArrowRight size={20} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role Specific Actions */}
                <div className="absolute top-7 right-7 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    {(user?.role === 'admin' || (user?.role === 'alumni' && job.postedBy?._id === user.id)) && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/jobs/edit/${job._id}`); }}
                                className="p-2.5 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 shadow-lg transition-all duration-200 hover:scale-110"
                                title="Edit Job"
                            >
                                <Edit size={18} className="text-gray-700" />
                            </button>
                            <button
                                onClick={(e) => handleDeleteClick(job, e)}
                                className="p-2.5 bg-white rounded-xl border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 shadow-lg transition-all duration-200 hover:scale-110"
                                title="Delete Job"
                            >
                                <Trash2 size={18} className="text-red-600" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            {/* Enhanced Header with Gradient */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 -mx-8 -mt-8 px-8 py-16 mb-10 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                        <div className="text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                                    Career Opportunities
                                </h1>
                            </div>
                            <p className="text-blue-100 text-lg font-medium">
                                Discover exclusive jobs and internships from your alumni network
                            </p>
                        </div>
                        {user?.role === 'alumni' && (
                            <Link
                                to="/jobs/create"
                                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl active:scale-95 hover:scale-105 duration-200"
                            >
                                <Plus size={22} strokeWidth={3} />
                                Post Opportunity
                            </Link>
                        )}
                    </div>

                    {/* Enhanced Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-5xl mx-auto">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                                <input
                                    type="text"
                                    placeholder="Search by job title, company, location, or skills..."
                                    className="w-full pl-14 pr-6 py-5 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-white/30 focus:border-white transition-all outline-none text-gray-800 placeholder-gray-400 font-medium shadow-xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-black transition-all shadow-xl hover:shadow-2xl active:scale-95 hover:scale-105 duration-200"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-8 pb-16">
                {/* Enhanced Tabs */}
                <div className="flex items-center justify-between mb-10 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                    <div className="flex gap-2">
                        {['All', 'Job', 'Internship'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 text-sm font-bold tracking-wide rounded-xl transition-all duration-200 ${activeTab === tab
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {tab === 'All' ? '🌟 All Opportunities' : tab === 'Job' ? '💼 Full-Time Jobs' : '🎓 Internships'}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 pr-4">
                        <TrendingUp size={18} className="text-blue-600" />
                        <span className="text-gray-900">{jobs.length}</span> Opportunities
                    </div>
                </div>

                {/* Job Cards Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-white/50 rounded-3xl border border-gray-100" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {jobs.length > 0 ? (
                            jobs.map(job => <OpportunityCard key={job._id} job={job} />)
                        ) : (
                            <div className="col-span-full py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mb-6 border-4 border-blue-100">
                                    <Briefcase size={40} className="text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">No opportunities found</h2>
                                <p className="text-gray-500 text-lg max-w-md">
                                    Try adjusting your search filters or check back later for new postings.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Enhanced Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <Trash2 size={32} className="text-red-600" />
                        </div>

                        <h2 className="text-2xl font-bold mb-3 text-center text-gray-900">Delete Job Posting?</h2>
                        <p className="text-gray-600 mb-8 text-center leading-relaxed">
                            This will permanently remove <span className="font-semibold text-gray-900">"{selectedJobForDelete?.title}"</span>. This action cannot be undone.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDeleteJob}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-2xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                            >
                                Yes, Delete Permanently
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobList;
