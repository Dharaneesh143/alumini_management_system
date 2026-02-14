import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    User,
    BookOpen,
    Shield,
    Mail,
    Phone,
    Calendar,
    GraduationCap,
    Trash2,
    Ban,
    CheckCircle,
    Edit3,
    Clock,
    Download,
    FileText,
    UserMinus,
    Users,
    Eye
} from 'lucide-react';
import api, { API_BASE_URL } from '../../config/api';

const StudentDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [deleteModal, setDeleteModal] = useState({ show: false, mode: 'delete' });
    const [deleteFeedback, setDeleteFeedback] = useState('');
    const [mentorship, setMentorship] = useState(null);
    const [loadingMentorship, setLoadingMentorship] = useState(false);

    useEffect(() => {
        fetchStudent();
        fetchMentorship();
    }, [id]);

    const fetchStudent = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/admin/students/${id}`);
            setStudent(res.data);
            setFormData(res.data);
        } catch (err) {
            console.error('Error fetching student details:', err);
            alert('Failed to load student details');
        } finally {
            setLoading(false);
        }
    };

    const fetchMentorship = async () => {
        try {
            setLoadingMentorship(true);
            const res = await api.get(`/api/admin/students/${id}/mentorship`);
            setMentorship(res.data);
        } catch (err) {
            // No mentorship found is okay
            setMentorship(null);
        } finally {
            setLoadingMentorship(false);
        }
    };

    const handleEndMentorship = async () => {
        if (!mentorship) return;
        setDeleteModal({ show: true, mode: 'endMentorship' });
    };

    const handleStatusToggle = async () => {
        const mode = student.accountStatus === 'active' ? 'deactivate' : 'activate';
        setDeleteModal({ show: true, mode });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/admin/students/${id}/update`, formData);
            setStudent(formData);
            setIsEditing(false);
            alert('Student details updated successfully');
        } catch (err) {
            console.error('Error updating student:', err);
            alert('Failed to update student details');
        }
    };

    const handleDeleteClick = () => {
        setDeleteModal({ show: true, mode: 'delete' });
    };

    const confirmAction = async () => {
        if (!deleteFeedback.trim()) return alert('Feedback is required');

        try {
            if (deleteModal.mode === 'delete') {
                await api.post('/api/admin/delete-user', {
                    userId: id,
                    feedback: deleteFeedback
                });
                alert('Student deleted permanently');
                navigate('/admin/students');
            } else if (deleteModal.mode === 'endMentorship') {
                await api.post('/api/admin/students/end-mentorship', {
                    mentorshipId: mentorship._id,
                    feedback: deleteFeedback
                });
                alert('Mentorship ended successfully');
                fetchMentorship();
            } else if (deleteModal.mode === 'deactivate' || deleteModal.mode === 'activate') {
                const newStatus = deleteModal.mode === 'deactivate' ? 'blocked' : 'active';
                await api.put(`/api/admin/students/${id}/status`, {
                    status: newStatus,
                    feedback: deleteFeedback
                });
                setStudent({ ...student, accountStatus: newStatus });
                alert(`Student account ${newStatus} successfully`);
            }
            setDeleteModal({ show: false, mode: 'delete' });
            setDeleteFeedback('');
        } catch (err) {
            console.error('Action error:', err);
            alert(err.response?.data?.msg || 'Action failed');
        }
    };

    const handleDelete = async () => {
        // Legacy function, using modal now
        handleDeleteClick();
    };

    if (loading) return <div className="p-8 text-center text-secondary">Loading student profile...</div>;
    if (!student) return <div className="p-8 text-center text-danger">Student not found</div>;

    return (
        <div className="space-y-8 mb-8">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <button onClick={() => navigate('/admin/students')} className="flex items-center gap-2 text-secondary hover:text-primary">
                    <ChevronLeft size={20} />
                    Back to Students
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`btn btn-sm ${isEditing ? 'btn-secondary' : 'btn-outline'}`}
                    >
                        <Edit3 size={16} className="mr-2" />
                        {isEditing ? 'Cancel Edit' : 'Edit Details'}
                    </button>
                    <button
                        onClick={handleStatusToggle}
                        className={`btn btn-sm ${student.accountStatus === 'active' ? 'btn-warning' : 'btn-success'}`}
                    >
                        {student.accountStatus === 'active' ? <Ban size={16} className="mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                        {student.accountStatus === 'active' ? 'Block Student' : 'Unblock Student'}
                    </button>
                    <button onClick={handleDeleteClick} className="btn btn-sm btn-danger">
                        <Trash2 size={16} className="mr-2" />
                        Delete Permanently
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Summary & Quick Info */}
                <div className="space-y-6">
                    <div className="card text-center flex flex-col items-center justify-center py-8">
                        <div className="w-24 h-24 rounded-full bg-primary-light text-primary flex items-center justify-center text-4xl font-bold mx-auto mb-4 border-4 border-white shadow-sm">
                            {(student?.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold">{student.name}</h2>
                        <p className="text-secondary">{student.email}</p>
                        <div className="mt-4 flex justify-center gap-2">
                            <span className={`badge ${student.accountStatus === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                {student.accountStatus?.toUpperCase()}
                            </span>
                            <span className="badge badge-info">STUDENT</span>
                        </div>
                    </div>

                    <div className="card space-y-4">
                        <h3 className="font-bold flex items-center gap-2 border-b pb-2 text-primary">
                            <Shield size={18} />
                            Account Metadata
                        </h3>
                        <div className="space-y-3 text-sm ">
                            <div className="flex justify-between p-2">
                                <span className="text-secondary flex items-center gap-2"><Calendar size={14} /> Registered</span>
                                <span className="font-medium">{new Date(student.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between p-2">
                                <span className="text-secondary flex items-center gap-2"><Clock size={14} /> Role</span>
                                <span className="font-medium">{student.role.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between p-2">
                                <span className="text-secondary">Student ID</span>
                                <span className="font-mono text-xs">{student._id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Tabs/Sections */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleUpdate} className="card space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <User className="text-primary" />
                                Comprehensive Student Profile
                            </h3>
                            {isEditing && (
                                <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-secondary border-l-4 border-primary pl-2">Personal Information</h4>
                                <div className="space-y-3">
                                    <div className="form-group">
                                        <label className="text-xs font-semibold text-secondary">Full Name</label>
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            className="form-input border-none bg-gray-50 disabled:bg-transparent px-0 font-medium"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-semibold text-secondary">Email Address</label>
                                        <input
                                            type="email"
                                            disabled={!isEditing}
                                            className="form-input border-none bg-gray-50 disabled:bg-transparent px-0 font-medium"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-semibold text-secondary">Phone Number</label>
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            className="form-input border-none bg-gray-50 disabled:bg-transparent px-0 font-medium"
                                            value={formData.phoneNumber || 'Not Provided'}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Info */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-secondary border-l-4 border-info pl-2">Academic Details</h4>
                                <div className="space-y-3">
                                    <div className="form-group">
                                        <label className="text-xs font-semibold text-secondary">Register Number</label>
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            className="form-input border-none bg-gray-50 disabled:bg-transparent px-0 font-medium"
                                            value={formData.registerNumber}
                                            onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-semibold text-secondary">Department</label>
                                        <select
                                            disabled={!isEditing}
                                            className="form-input border-none bg-gray-50 disabled:bg-transparent px-0 font-medium"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        >
                                            <option value="">Select Department</option>
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
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="form-group flex-1">
                                            <label className="text-xs font-semibold text-secondary">Batch / Year</label>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                className="form-input border-none bg-gray-50 disabled:bg-transparent px-0 font-medium"
                                                value={formData.batch}
                                                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Sections (Activity simulation) */}
                        <div className="pt-6 border-t grid grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h5 className="text-sm font-bold flex items-center gap-2 mb-2">
                                    <GraduationCap size={16} /> Mentorship Status
                                </h5>
                                {loadingMentorship ? (
                                    <div className="text-xs text-secondary">Loading...</div>
                                ) : mentorship ? (
                                    <div className="space-y-2">
                                        <p className="text-xs text-secondary">Currently connected to:</p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-semibold">{mentorship.alumni?.name || 'Unknown'}</div>
                                                <div className="text-xs text-secondary">{mentorship.alumni?.currentCompany || 'N/A'}</div>
                                            </div>
                                            <button
                                                onClick={handleEndMentorship}
                                                className="btn btn-sm btn-danger flex items-center gap-1"
                                                title="End Mentorship"
                                            >
                                                <UserMinus size={14} />
                                                End
                                            </button>
                                        </div>
                                        {mentorship.mentorshipTopic && (
                                            <div className="text-xs text-secondary mt-2">
                                                Topic: <span className="font-medium">{mentorship.mentorshipTopic}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs text-secondary">Currently connected to:</p>
                                        <div className="mt-2 text-sm font-semibold text-gray-500">Not enrolled in mentorship programme</div>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h5 className="text-sm font-bold flex items-center gap-2 mb-2">
                                    <FileText size={16} /> Resume / Documents
                                </h5>
                                {(student?.profile?.resumeUrl || student?.resumeUrl) ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium">
                                                {(student?.profile?.resumeUrl || student?.resumeUrl).split('/').pop()}
                                            </span>
                                            <a
                                                href={`${API_BASE_URL}${student?.profile?.resumeUrl || student?.resumeUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:text-primary-dark"
                                                title="View Resume"
                                            >
                                                <Download size={14} />
                                            </a>
                                        </div>
                                        <a
                                            href={`${API_BASE_URL}${student?.profile?.resumeUrl || student?.resumeUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline w-full flex items-center justify-center gap-2"
                                        >
                                            <Eye size={14} /> View Resume
                                        </a>
                                    </div>
                                ) : (
                                    <div className="text-xs text-secondary italic">No resume uploaded</div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Universal Confirmation Modal - Refined Review Style Design */}
            {deleteModal.show && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setDeleteModal({ show: false, mode: 'delete' });
                            setDeleteFeedback('');
                        }
                    }}
                >
                    <div
                        className="bg-white rounded-[2rem] p-8 w-full max-w-[400px] shadow-2xl relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setDeleteModal({ show: false, mode: 'delete' });
                                setDeleteFeedback('');
                            }}
                            className="absolute top-8 right-8 w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all group"
                        >
                            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Title Section */}
                        <h3 className="text-[24px] font-bold text-gray-900 mb-6 font-serif leading-tight">
                            {deleteModal.mode === 'delete' ? 'Delete Student' :
                                deleteModal.mode === 'endMentorship' ? 'End Mentorship' :
                                    deleteModal.mode === 'deactivate' ? 'Block Student' : 'Unblock Student'}
                        </h3>

                        {/* User Identity Section */}
                        <div className="flex items-center gap-4 mb-8 pb-2">
                            <div className={`w-14 h-14 ${deleteModal.mode === 'activate' ? 'bg-green-600' : 'bg-red-600'} rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg`}>
                                {student?.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-lg text-gray-900 leading-tight">{student?.name}</p>
                                <p className="text-[15px] text-gray-500 mt-0.5">Student</p>
                            </div>
                        </div>

                        {/* Question Header */}
                        <div className="mb-6">
                            <p className="text-[17px] font-semibold text-gray-800">
                                {deleteModal.mode === 'delete' ? 'Why are you deleting this student?' :
                                    deleteModal.mode === 'endMentorship' ? 'Reason for ending mentorship?' :
                                        deleteModal.mode === 'deactivate' ? 'Why are you blocking this student?' : 'Reason for unblocking?'}
                            </p>
                        </div>

                        {/* Feedback Input Block */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-500 mb-3">
                                Describe the reason
                            </label>
                            <textarea
                                className={`w-full border-2 border-gray-200 rounded-2xl p-4 focus:ring-2 ${deleteModal.mode === 'activate' ? 'focus:ring-green-500 focus:border-green-500' : 'focus:ring-red-500 focus:border-red-500'} outline-none transition-all h-32 resize-none text-[15px] text-gray-900 placeholder-gray-400`}
                                placeholder=""
                                value={deleteFeedback}
                                onChange={(e) => setDeleteFeedback(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={confirmAction}
                            disabled={!deleteFeedback.trim()}
                            className={`w-full py-4 ${deleteModal.mode === 'activate' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#1a73e8] hover:bg-[#1557b0]'} text-white font-bold rounded-full disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-[17px]`}
                        >
                            {deleteModal.mode === 'delete' ? 'Confirm Deletion' :
                                deleteModal.mode === 'endMentorship' ? 'Confirm Removal' :
                                    deleteModal.mode === 'deactivate' ? 'Confirm Block' : 'Confirm Unblock'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDetailView;
