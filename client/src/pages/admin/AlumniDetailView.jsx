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
    FileText
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
    const [deleteModal, setDeleteModal] = useState({ show: false });
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
        try {
            await api.post('/api/admin/verify-alumni', { userId: id, isVerified });
            setAlumni({ ...alumni, approvalStatus: isVerified ? 'approved' : 'rejected' });
            alert(`Alumni ${isVerified ? 'verified' : 'rejected'} successfully`);
        } catch (err) {
            console.error('Error verifying alumni:', err);
            alert('Failed to update verification status');
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

    const handleEndMentorship = async (requestId) => {
        if (!window.confirm('Are you sure you want to force-end this mentorship?')) return;
        try {
            await api.post('/api/mentorship/respond', {
                requestId,
                status: 'removed',
                response: 'Mentorship ended by Administrator'
            });
            fetchAlumni();
            alert('Mentorship ended successfully');
        } catch (err) {
            console.error('Error ending mentorship:', err);
            alert('Failed to end mentorship');
        }
    };

    const confirmDelete = async () => {
        if (!deleteFeedback.trim()) return alert('Feedback is required for deletion');

        try {
            await api.post('/api/admin/delete-user', {
                userId: id,
                feedback: deleteFeedback
            });
            alert('Alumni deleted permanently');
            setDeleteModal({ show: false });
            navigate('/admin/users');
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete alumni');
        }
    };

    if (loading) return <div className="p-8 text-center text-secondary">Loading alumni profile...</div>;
    if (!alumni) return <div className="p-8 text-center text-danger">Alumni not found</div>;

    return (
        <div className="space-y-6">
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
                            {alumni.name.charAt(0)}
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
                                <h4 className="font-bold text-xs uppercase text-secondary">Professional</h4>
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

                    {/* Active Mentees Section */}
                    {alumni.isMentor && (
                        <div className="card">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
                                <Users className="text-primary" /> Active Mentees ({mentorships.filter(m => m.status === 'accepted').length})
                            </h3>
                            <div className="space-y-4">
                                {mentorships.filter(m => m.status === 'accepted').length === 0 ? (
                                    <p className="text-secondary text-sm italic py-4">No active students currently.</p>
                                ) : (
                                    mentorships.filter(m => m.status === 'accepted').map(m => (
                                        <div key={m._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                                                    {m.student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm">{m.student.name}</h4>
                                                    <p className="text-[10px] text-secondary">
                                                        {m.student.department} • Batch {m.student.graduationYear}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleEndMentorship(m._id)}
                                                className="btn btn-sm btn-outline-danger py-1 px-3 text-[10px]"
                                            >
                                                End Mentorship
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4 text-danger">Confirm Deletion</h3>
                        <p className="text-secondary mb-4 italic">
                            Reason for deletion (Feedback):
                        </p>
                        <textarea
                            className="form-input w-full mb-4"
                            value={deleteFeedback}
                            onChange={(e) => setDeleteFeedback(e.target.value)}
                            placeholder="Enter reason..."
                        ></textarea>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteModal({ show: false })} className="btn btn-secondary">Cancel</button>
                            <button onClick={confirmDelete} className="btn btn-danger">Confirm Permanent Deletion</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlumniDetailView;
