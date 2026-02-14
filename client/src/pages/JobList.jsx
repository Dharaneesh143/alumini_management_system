import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext.jsx';
import {
    Search, Briefcase, Clock, MapPin,
    Filter, GraduationCap, DollarSign,
    Calendar, CheckCircle, ChevronRight,
    Bookmark, Plus, Info, Check, Trash2, Edit
} from 'lucide-react';

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All'); // All, Job, Internship
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedJobForDelete, setSelectedJobForDelete] = useState(null);
    const [deleteFeedback, setDeleteFeedback] = useState('');

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
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer relative group"
                onClick={() => navigate(`/jobs/${job._id}`)}
            >
                <div className="flex gap-5">
                    {/* Logo Placeholder or Image */}
                    <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0 overflow-hidden">
                        {job.companyLogo ? (
                            <img src={`${api.defaults.baseURL}${job.companyLogo}`} alt={job.company} className="w-full h-full object-contain" />
                        ) : (
                            <Briefcase className="w-8 h-8 text-gray-400" />
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {job.title}
                                </h3>
                                <p className="text-gray-600 font-medium">{job.company}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isJob ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                    }`}>
                                    {job.opportunityType}
                                </span>
                                {job.approvalStatus && job.approvalStatus !== 'approved' && (user?.role === 'admin' || (user?.role === 'alumni' && job.postedBy?._id === user.id)) && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${job.approvalStatus === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {job.approvalStatus}
                                    </span>
                                )}
                                {job.hasApplied && (
                                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <CheckCircle size={12} /> APPLIED
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 mt-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <MapPin size={16} className="text-gray-400" />
                                {job.location}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <DollarSign size={16} className="text-gray-400" />
                                {isJob ? (job.salaryRange || 'Competitive') : `${job.stipend || 'Unpaid'} / mo`}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock size={16} className="text-gray-400" />
                                {isJob ? job.employmentType : job.duration}
                            </div>
                            {job.deadline && (
                                <div className="flex items-center gap-1.5 text-orange-600 font-medium">
                                    <Calendar size={16} />
                                    Expiring {new Date(job.deadline).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        {job.requiredSkills?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {job.requiredSkills.slice(0, 4).map((skill, i) => (
                                    <span key={i} className="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-100">
                                        {skill}
                                    </span>
                                ))}
                                {job.requiredSkills.length > 4 && (
                                    <span className="text-xs text-gray-400 font-medium">+{job.requiredSkills.length - 4} more</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Role Specific Actions */}
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(user?.role === 'admin' || (user?.role === 'alumni' && job.postedBy?._id === user.id)) && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/jobs/edit/${job._id}`); }}
                                className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 shadow-sm"
                            >
                                <Edit size={16} className="text-gray-600" />
                            </button>
                            <button
                                onClick={(e) => handleDeleteClick(job, e)}
                                className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-100 shadow-sm"
                            >
                                <Trash2 size={16} className="text-red-500" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Header / Search Hero */}
            <div className="bg-white border-b border-gray-200 -mx-8 -mt-8 px-8 py-10 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 text-center tracking-tight">
                            Career Opportunities
                        </h1>
                        <p className="text-gray-500 mt-1 text-center text-lg">
                            Explore jobs and internships shared by your alumni network
                        </p>
                    </div>
                    {user?.role === 'alumni' && (
                        <Link
                            to="/jobs/create"
                            className="inline-flex items-center  gap-2 bg-blue-600 text-white px-6 py-3 mb-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                        >
                            <Plus size={20} />
                            Post Opportunity
                        </Link>
                    )}
                </div>

                <form onSubmit={handleSearch} className="mt-10 max-w-4xl flex gap-3">
                <div className='w-full flex justify-center'>
                    <div>
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title, company, or skills..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        </div>
                    </div>
                    <button type="submit" className="bg-gray-900 text-white px-8 rounded-2xl font-bold hover:bg-black transition-colors">
                        Search
                    </button>
                </form>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200 mb-8">
                <div className="flex gap-8">
                    {['All', 'Job', 'Internship'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-bold tracking-wide transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {tab === 'All' ? 'Discover All' : `${tab}s`}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Filter size={16} />
                    Sort by: <span className="text-gray-900 cursor-pointer">Relevance</span>
                </div>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {jobs.length > 0 ? (
                        jobs.map(job => <OpportunityCard key={job._id} job={job} />)
                    ) : (
                        <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Briefcase size={32} className="text-gray-300" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">No opportunities found</h2>
                            <p className="text-gray-500 mt-1 max-w-xs">
                                Try adjusting your search filters or check back later for new updates.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-4">Are you sure?</h2>
                        <p className="text-gray-600 mb-8">
                            You are about to remove this posting. This action cannot be undone.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDeleteJob}
                                className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all"
                            >
                                Yes, Delete Posting
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
