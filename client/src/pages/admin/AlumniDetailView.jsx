import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    User,
    Briefcase,
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
    MapPin,
    Globe,
    Linkedin,
    FileText,
    Users,
    UserMinus,
    Target
} from 'lucide-react';
import api from '../../config/api';

const AlumniDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [alumni, setAlumni] = useState(null);
    const [mentorships, setMentorships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [deleteModal, setDeleteModal] = useState({ show: false, mode: 'delete', targetId: null });
    const [deleteFeedback, setDeleteFeedback] = useState('');

    useEffect(() => {
        fetchAlumni();
    }, [id]);

    const fetchAlumni = async () => {
        try {
            setLoading(true);
            const [alumniRes, mentorshipsRes] = await Promise.all([
                api.get(`/api/admin/alumni/${id}`),
                api.get(`/api/admin/alumni/${id}/mentorships`)
            ]);
            setAlumni(alumniRes.data);
            setFormData(alumniRes.data);
            setMentorships(mentorshipsRes.data);
        } catch (err) {
            console.error('Error fetching alumni details:', err);
            alert('Failed to load alumni details');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (isVerified) => {
        if (!isVerified) {
            setDeleteModal({ show: true, mode: 'reject', targetId: id });
            return;
        }

        try {
            await api.post('/api/admin/verify-alumni', { userId: id, isVerified: true });
            setAlumni({ ...alumni, approvalStatus: 'approved' });
            alert('Alumni verified successfully');
        } catch (err) {
            console.error('Error verifying alumni:', err);
            alert('Failed to verify alumni');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/admin/alumni/${id}/update`, formData);
            setAlumni(formData);
            setIsEditing(false);
            alert('Alumni details updated successfully');
        } catch (err) {
            console.error('Error updating alumni:', err);
            alert('Failed to update alumni details');
        }
    };

    const handleEndMentorship = (requestId) => {
        setDeleteModal({ show: true, mode: 'endMentorship', targetId: requestId });
    };

    const confirmAction = async () => {
        if (!deleteFeedback.trim()) return alert('Feedback is required');

        try {
            if (deleteModal.mode === 'delete') {
                await api.post('/api/admin/delete-user', {
                    userId: id,
                    feedback: deleteFeedback
                });
                alert('Alumni deleted permanently');
                navigate('/admin/users');
            } else if (deleteModal.mode === 'reject') {
                await api.post('/api/admin/verify-alumni', {
                    userId: id,
                    isVerified: false,
                    feedback: deleteFeedback
                });
                setAlumni({ ...alumni, approvalStatus: 'rejected' });
                alert('Alumni rejected successfully');
            } else if (deleteModal.mode === 'endMentorship') {
                await api.post('/api/admin/students/end-mentorship', {
                    mentorshipId: deleteModal.targetId,
                    feedback: deleteFeedback
                });
                alert('Mentorship ended successfully');
                fetchAlumni();
            }
            setDeleteModal({ show: false, mode: 'delete', targetId: null });
            setDeleteFeedback('');
        } catch (err) {
            console.error('Action error:', err);
            alert(err.response?.data?.msg || 'Action failed');
        }
    };

    if (loading) return <div className="p-8 text-center text-secondary">Loading alumni profile...</div>;
    if (!alumni) return <div className="p-8 text-center text-danger">Alumni not found</div>;

    return (
        <div className="space-y-8 mb-8">
            <div className="flex justify-between items-center">
                <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 text-secondary hover:text-primary">
                    <ChevronLeft size={20} />
                    Back to Users
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`btn btn-sm ${isEditing ? 'btn-secondary' : 'btn-outline'}`}
                    >
                        <Edit3 size={16} className="mr-2" />
                        {isEditing ? 'Cancel Edit' : 'Edit Details'}
                    </button>
                    {alumni.approvalStatus === 'pending' && (
                        <>
                            <button onClick={() => handleVerify(true)} className="btn btn-sm btn-success">
                                <CheckCircle size={16} className="mr-2" /> Approve
                            </button>
                            <button onClick={() => handleVerify(false)} className="btn btn-sm btn-danger">
                                <Ban size={16} className="mr-2" /> Reject
                            </button>
                        </>
                    )}
                    <button onClick={() => setDeleteModal({ show: true })} className="btn btn-sm btn-danger">
                        <Trash2 size={16} className="mr-2" /> Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <div className="card text-center py-8">
                        <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-4xl font-bold mx-auto mb-4 border-4 border-white shadow-sm">
                            {(alumni?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold">{alumni.name}</h2>
                        <p className="text-secondary">{alumni.email}</p>
                        <div className="mt-4 flex justify-center gap-2">
                            <span className={`badge ${alumni.approvalStatus === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                                {alumni.approvalStatus?.toUpperCase()}
                            </span>
                            <span className="badge badge-primary">ALUMNI</span>
                        </div>
                    </div>

                    <div className="card space-y-4 text-sm">
                        <h3 className="font-bold flex items-center gap-2 border-b pb-2 text-primary">
                            <Briefcase size={18} /> Professional Info
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-secondary">Company</span>
                                <span className="font-medium">{alumni.currentCompany || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary">Role</span>
                                <span className="font-medium">{alumni.jobRole || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary">Batch</span>
                                <span className="font-medium">{alumni.batch || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card space-y-4 text-sm">
                        <h3 className="font-bold flex items-center gap-2 border-b pb-2 text-success">
                            <GraduationCap size={18} /> Mentorship Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-secondary">Available</span>
                                <span className={`badge ${alumni.isMentor ? 'badge-success' : 'badge-gray'}`}>
                                    {alumni.isMentor ? 'YES' : 'NO'}
                                </span>
                            </div>
                            {alumni.isMentor && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-secondary">Capacity</span>
                                        <span className="font-medium">{alumni.mentorSettings?.capacity || 3} Students</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-secondary block">Expertise Areas:</span>
                                        <div className="flex flex-wrap gap-1">
                                            {alumni.mentorSettings?.mentorshipAreas?.length > 0 ? (
                                                alumni.mentorSettings.mentorshipAreas.map(area => (
                                                    <span key={area} className="badge badge-primary text-[10px]">{area}</span>
                                                ))
                                            ) : (
                                                <span className="text-xs italic">No areas specified</span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleUpdate} className="card space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Shield className="text-primary" /> Comprehensive Alumni Profile
                            </h3>
                            {isEditing && (
                                <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-bold text-xs uppercase text-secondary">Personal</h4>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    className="form-input w-full"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Name"
                                />
                                <input
                                    type="email"
                                    disabled={!isEditing}
                                    className="form-input w-full"
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Email"
                                />
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-xs uppercase text-secondary">Professional & Academic</h4>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    className="form-input w-full"
                                    value={formData.currentCompany || ''}
                                    onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                                    placeholder="Company"
                                />
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    className="form-input w-full"
                                    value={formData.jobRole || ''}
                                    onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                                    placeholder="Job Role"
                                />
                                <select
                                    disabled={!isEditing}
                                    className="form-input w-full"
                                    value={formData.department || ''}
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
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    className="form-input w-full"
                                    value={formData.batch || ''}
                                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                    placeholder="Batch / Year"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t">
                            <h4 className="font-bold text-sm mb-4">Mentorship Settings</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded">
                                    <div className="text-xs text-secondary">Mentor Capacity</div>
                                    <div className="font-bold">{alumni.mentorSettings?.capacity || 0} students</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded">
                                    <div className="text-xs text-secondary">Mentor Status</div>
                                    <div className="font-bold">{alumni.isMentor ? 'Active' : 'Inactive'}</div>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Mentorship Management Section */}
                    {alumni.isMentor && (
                        <div className="card">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
                                <Users className="text-primary" /> Mentorship Management
                            </h3>

                            {/* Active Mentees */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <CheckCircle size={16} className="text-success" />
                                    Active Mentees ({mentorships.filter(m => m.status === 'accepted').length})
                                </h4>
                                <div className="space-y-3">
                                    {mentorships.filter(m => m.status === 'accepted').length === 0 ? (
                                        <p className="text-secondary text-sm italic py-4 bg-gray-50 rounded-lg text-center">
                                            No active students currently.
                                        </p>
                                    ) : (
                                        mentorships.filter(m => m.status === 'accepted').map(m => (
                                            <div key={m._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-indigo-50 rounded-lg border border-green-200 hover:shadow-md transition-all">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white shadow-md">
                                                        {(m.student?.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-sm text-gray-900">{m.student?.name || 'Unknown'}</h4>
                                                        <p className="text-xs text-secondary mt-1">
                                                            {m.student?.department || 'N/A'} • Batch {m.student?.graduationYear || m.student?.batch || 'N/A'}
                                                        </p>
                                                        {m.mentorshipTopic && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Target size={12} className="text-indigo-600" />
                                                                <span className="text-xs text-indigo-600 font-medium">{m.mentorshipTopic}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleEndMentorship(m._id)}
                                                    className="btn btn-sm btn-danger flex items-center gap-1 ml-4"
                                                    title="End Mentorship"
                                                >
                                                    <UserMinus size={14} />
                                                    End
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Pending Requests */}
                            {mentorships.filter(m => m.status === 'pending').length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Clock size={16} className="text-warning" />
                                        Pending Requests ({mentorships.filter(m => m.status === 'pending').length})
                                    </h4>
                                    <div className="space-y-3">
                                        {mentorships.filter(m => m.status === 'pending').map(m => (
                                            <div key={m._id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center font-bold text-yellow-700">
                                                        {(m.student?.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm">{m.student?.name || 'Unknown'}</h4>
                                                        <p className="text-xs text-secondary">
                                                            {m.student?.department || 'N/A'} • Batch {m.student?.graduationYear || m.student?.batch || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="badge badge-warning text-xs">Pending</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Mentorships Summary */}
                            <div className="pt-4 border-t">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-indigo-600">{mentorships.filter(m => m.status === 'accepted').length}</div>
                                        <div className="text-xs text-secondary mt-1">Active</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-yellow-600">{mentorships.filter(m => m.status === 'pending').length}</div>
                                        <div className="text-xs text-secondary mt-1">Pending</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-600">{mentorships.filter(m => m.status === 'rejected' || m.status === 'removed').length}</div>
                                        <div className="text-xs text-secondary mt-1">Ended</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Universal Confirmation Modal - Refined Review Style Design */}
            {deleteModal.show && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setDeleteModal({ show: false, mode: 'delete', targetId: null });
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
                                setDeleteModal({ show: false, mode: 'delete', targetId: null });
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
                            {deleteModal.mode === 'delete' ? 'Delete Alumni' : 'End Mentorship'}
                        </h3>

                        {/* User Identity Section */}
                        <div className="flex items-center gap-4 mb-8 pb-2">
                            <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-red-200">
                                {(alumni?.name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-lg text-gray-900 leading-tight">{alumni?.name}</p>
                                <p className="text-[15px] text-gray-500 mt-0.5">Alumni</p>
                            </div>
                        </div>

                        {/* Question Header */}
                        <div className="mb-6">
                            <p className="text-[17px] font-semibold text-gray-800">
                                {deleteModal.mode === 'delete' ? 'Why are you deleting this alumni?' :
                                    deleteModal.mode === 'reject' ? 'Why are you rejecting this alumni?' : 'Reason for ending mentorship?'}
                            </p>
                        </div>

                        {/* Feedback Input Block */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-500 mb-3">
                                Describe the reason
                            </label>
                            <textarea
                                className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all h-32 resize-none text-[15px] text-gray-900 placeholder-gray-400"
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
                            className="w-full py-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold rounded-full disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-[17px]"
                        >
                            {deleteModal.mode === 'delete' ? 'Confirm Deletion' :
                                deleteModal.mode === 'reject' ? 'Confirm Rejection' : 'Confirm Removal'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlumniDetailView;
