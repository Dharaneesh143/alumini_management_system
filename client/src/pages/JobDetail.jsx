import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext.jsx';
import {
    MapPin, Building, Briefcase, Calendar,
    DollarSign, Clock, CheckCircle, FileText,
    ArrowLeft, User, Phone, Globe, MessageSquare,
    Upload, Download, AlertCircle, Trash2, Edit,
    Info, GraduationCap
} from 'lucide-react';

const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Application Form State
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [applying, setApplying] = useState(false);
    const [resume, setResume] = useState(null);
    const [appData, setAppData] = useState({
        phone: '',
        portfolioUrl: '',
        coverLetter: ''
    });

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.GET_JOB(id));
            setJob(res.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to load opportunity');
            setLoading(false);
        }
    };

    const handleApproveJob = async (status) => {
        try {
            await api.patch(`/api/jobs/${job._id}/approve`, { status });
            alert(`Job ${status} successfully`);
            fetchJob();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to update job status');
        }
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        if (!resume) return alert('Please upload your resume PDF');

        setApplying(true);
        const formData = new FormData();
        formData.append('resume', resume);
        formData.append('phone', appData.phone);
        formData.append('portfolioUrl', appData.portfolioUrl);
        formData.append('coverLetter', appData.coverLetter);

        try {
            await api.post(API_ENDPOINTS.APPLY_JOB(id), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Application submitted successfully!');
            setShowApplyForm(false);
            fetchJob(); // Refresh
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to submit application');
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div className="container py-20 text-center animate-pulse">Loading amazing opportunity...</div>;
    if (error) return (
        <div className="container py-20 text-center">
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl inline-block max-w-md">
                <AlertCircle size={40} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold">{error}</h3>
                <button onClick={() => navigate('/jobs')} className="mt-4 text-sm font-bold underline">Back to listings</button>
            </div>
        </div>
    );

    const isJob = job.opportunityType === 'Job';

    const isEligible = () => {
        if (!user || user.role !== 'student') return true;

        const userDept = user.profile?.department || user.department;
        const deptEligible = !job?.departmentsEligible || job.departmentsEligible.length === 0 || job.departmentsEligible.includes('Any') || job.departmentsEligible.includes(userDept);

        const userCgpa = user.profile?.cgpa || 0;
        const cgpaEligible = !job?.minCgpa || (parseFloat(userCgpa) >= parseFloat(job.minCgpa));

        return deptEligible && cgpaEligible;
    };

    const eligible = isEligible();

    return (
        <div>
            {/* Top Bar Navigation */}
            <div className="bg-white border-b border-gray-100 -mx-8 -mt-8 px-8 py-6 mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors">
                        <ArrowLeft size={20} />
                        Back to Career Portal
                    </button>
                    <div className="flex flex-wrap gap-3">
                        {user?.role === 'admin' && job.approvalStatus === 'pending' && (
                            <>
                                <button
                                    onClick={() => handleApproveJob('approved')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md active:scale-95"
                                >
                                    <CheckCircle size={18} /> Approve
                                </button>
                                <button
                                    onClick={() => handleApproveJob('rejected')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95"
                                >
                                    <Trash2 size={18} /> Reject
                                </button>
                            </>
                        )}
                        {(user?.role === 'admin' || (user?.role === 'alumni' && job.postedBy?._id === user.id)) && (
                            <>
                                <Link to={`/jobs/edit/${job._id}`} className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all">
                                    <Edit size={18} /> Edit
                                </Link>
                                <Link to={`/jobs/${job._id}/applicants`} className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all">
                                    <User size={18} /> Applicants
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Detail Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Header Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-24 h-24 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                                {job.companyLogo ? (
                                    <img src={`${api.defaults.baseURL}${job.companyLogo}`} alt={job.company} className="w-full h-full object-contain" />
                                ) : (
                                    <Building className="w-12 h-12 text-blue-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${isJob ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                                        }`}>
                                        {job.opportunityType}
                                    </span>
                                    {job.status !== 'active' && (
                                        <span className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                            {job.status}
                                        </span>
                                    )}
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${job.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                        job.approvalStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {job.approvalStatus}
                                    </span>
                                </div>
                                <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                                    {job.title}
                                </h1>
                                <p className="text-2xl font-bold text-blue-600 mt-2">{job.company}</p>

                                <div className="flex flex-wrap gap-x-8 gap-y-4 mt-8">
                                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                                        <MapPin size={20} className="text-blue-500" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                                        <Clock size={20} className="text-blue-500" />
                                        {isJob ? job.employmentType : job.duration}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                                        <DollarSign size={20} className="text-blue-500" />
                                        {isJob ? job.salaryRange : `${job.stipend} / mo`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description & Details */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Info className="text-blue-600" /> Description
                        </h3>
                        <div className="prose prose-blue max-w-none text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                            {job.description}
                        </div>

                        <hr className="my-10 border-gray-100" />

                        <div className="grid md:grid-cols-2 gap-10">
                            <div>
                                <h4 className="font-bold text-gray-900 mb-4 inline-block border-b-2 border-blue-600 pb-1">Required Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {job.requiredSkills?.map((skill, i) => (
                                        <span key={i} className="bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold border border-gray-100 shadow-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-4 inline-block border-b-2 border-blue-600 pb-1">Eligible Departments</h4>
                                <div className="flex flex-wrap gap-2">
                                    {job.departmentsEligible?.map((dept, i) => (
                                        <span key={i} className="bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold border border-gray-100 shadow-sm">
                                            {dept}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {job.jdPdf && (
                            <div className="mt-12 bg-blue-50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-100">
                                <div className="flex items-center gap-4 text-blue-600">
                                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                        <FileText />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm uppercase tracking-widest">Formal JD Document</p>
                                        <p className="text-blue-800 font-bold">Full Job Description.pdf</p>
                                    </div>
                                </div>
                                <a
                                    href={`${api.defaults.baseURL}${job.jdPdf}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 border border-blue-100"
                                >
                                    <Download size={18} /> Download
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar / Apply Widget */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 sticky top-10">
                        {user?.role === 'student' ? (
                            <>
                                {job.hasApplied ? (
                                    <div className="text-center p-6 bg-green-50 rounded-3xl border border-green-100">
                                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                                            <CheckCircle size={32} />
                                        </div>
                                        <h4 className="text-xl font-bold text-green-900">Application Submitted</h4>
                                        <p className="text-green-700 text-sm mt-1">Recruiter has been notified</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 text-center">
                                        <div className="space-y-2">
                                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Apply Now</p>
                                            <h4 className="text-2xl font-bold text-gray-900">Interested in this?</h4>
                                            <p className="text-gray-500 text-sm">Applications close on {new Date(job.deadline).toLocaleDateString()}</p>
                                        </div>

                                        {!showApplyForm ? (
                                            eligible ? (
                                                <button
                                                    onClick={() => setShowApplyForm(true)}
                                                    className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95 text-lg"
                                                >
                                                    Start Application
                                                </button>
                                            ) : (
                                                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-left">
                                                    <div className="flex items-center gap-3 mb-2 text-amber-800">
                                                        <AlertCircle size={20} />
                                                        <h4 className="font-bold">Not Eligible</h4>
                                                    </div>
                                                    <p className="text-amber-700 text-sm leading-relaxed">
                                                        {(!job.departmentsEligible?.includes(user.profile?.department || user.department) && job.departmentsEligible?.length > 0) && (
                                                            <span className="block mb-1">
                                                                • Department mismatch: Requires <strong>{job.departmentsEligible.join(', ')}</strong>
                                                            </span>
                                                        )}
                                                        {job.minCgpa && (parseFloat(user.profile?.cgpa || 0) < job.minCgpa) && (
                                                            <span className="block">
                                                                • CGPA mismatch: Requires <strong>{job.minCgpa}+</strong> (You have {user.profile?.cgpa || 'N/A'})
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            )
                                        ) : (
                                            <form onSubmit={handleApplySubmit} className="text-left space-y-5 animate-in slide-in-from-bottom-4 duration-300">
                                                <div>
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Resume / Proof of Work (PDF or Image)</label>
                                                    <div className="mt-2 relative">
                                                        <input
                                                            type="file"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(e) => setResume(e.target.files[0])}
                                                            className="hidden"
                                                            id="resume-upload"
                                                        />
                                                        <label
                                                            htmlFor="resume-upload"
                                                            className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-gray-200 rounded-3xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group overflow-hidden"
                                                        >
                                                            {resume ? (
                                                                <div className="text-center px-4 w-full">
                                                                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-2 max-h-32 flex items-center justify-center overflow-hidden mx-auto w-fit">
                                                                        {resume.type === 'application/pdf' ? (
                                                                            <FileText size={32} className="text-red-500" />
                                                                        ) : (
                                                                            <img
                                                                                src={URL.createObjectURL(resume)}
                                                                                alt="Selected Preview"
                                                                                className="max-h-24 object-contain rounded-lg"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs font-bold text-gray-900 truncate max-w-full">{resume.name}</p>
                                                                    <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">Tap to change file</p>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <Upload size={24} className="text-gray-300 group-hover:text-blue-500 mb-2" />
                                                                    <span className="text-xs font-bold text-gray-400 group-hover:text-blue-700">
                                                                        Choose File (PDF/Image)
                                                                    </span>
                                                                </>
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <Phone className="absolute left-4 top-4 text-gray-400" size={18} />
                                                        <input
                                                            type="tel"
                                                            placeholder="Phone Number"
                                                            required
                                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-sm"
                                                            value={appData.phone}
                                                            onChange={(e) => setAppData({ ...appData, phone: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <Globe className="absolute left-4 top-4 text-gray-400" size={18} />
                                                        <input
                                                            type="url"
                                                            placeholder="Portfolio / LinkedIn URL"
                                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-sm"
                                                            value={appData.portfolioUrl}
                                                            onChange={(e) => setAppData({ ...appData, portfolioUrl: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <MessageSquare className="absolute left-4 top-4 text-gray-400" size={18} />
                                                        <textarea
                                                            placeholder="Short Pitch / Cover Letter (Optional)"
                                                            rows="3"
                                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-sm resize-none"
                                                            value={appData.coverLetter}
                                                            onChange={(e) => setAppData({ ...appData, coverLetter: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={applying}
                                                    className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:bg-gray-200 disabled:shadow-none"
                                                >
                                                    {applying ? 'Submitting...' : 'Complete Application'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setShowApplyForm(false)}
                                                    className="w-full text-sm font-bold text-gray-400 hover:text-gray-900"
                                                >
                                                    Cancel
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                <h4 className="text-lg font-bold text-blue-900">Poster View</h4>
                                <p className="text-blue-700 text-sm mt-1">Log in as a student to apply</p>
                                <Link to={`/jobs/${job._id}/applicants`} className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-md">
                                    Check Applicant Pool
                                </Link>
                            </div>
                        )}

                        <div className="mt-10 border-t border-gray-100 pt-8">
                            <h5 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-6 py-6">Opportunity Snapshot</h5>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 flex-shrink-0">
                                        <Calendar className="text-blue-500" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Availability</p>
                                        <p className="font-bold text-gray-900">Starts {new Date(job.startDate || job.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 flex-shrink-0">
                                        <GraduationCap className="text-blue-500" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Eligibility</p>
                                        <p className="font-bold text-gray-900">{job.minQualification || 'Open'}</p>
                                        {job.minCgpa && <p className="text-xs text-blue-600 font-bold mt-1">Min CGPA: {job.minCgpa}</p>}
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 flex-shrink-0">
                                        <Briefcase className="text-blue-500" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Openings</p>
                                        <p className="font-bold text-gray-900">{job.openingsCount} Positions</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posted By Widget */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <h5 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-6">Posted By</h5>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-200">
                                {job.postedBy?.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-black text-gray-900 text-lg leading-tight">{job.postedBy?.name}</p>
                                <p className="text-gray-500 text-sm font-bold">Verified Alumni</p>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col gap-2">
                            <p className="text-xs text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                                <CheckCircle size={14} className="text-blue-500" /> Member since {new Date(job.postedBy?.createdAt || Date.now()).getFullYear()}
                            </p>
                            <button className="mt-4 w-full py-4 text-sm font-bold text-blue-600 border border-blue-100 rounded-2xl hover:bg-blue-50 transition-all">
                                View Full Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;
