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
    FileText
} from 'lucide-react';
import api from '../../config/api';

const StudentDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [deleteModal, setDeleteModal] = useState({ show: false });
    const [deleteFeedback, setDeleteFeedback] = useState('');

    useEffect(() => {
        fetchStudent();
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

    const handleStatusToggle = async () => {
        const newStatus = student.accountStatus === 'active' ? 'blocked' : 'active';
        if (!window.confirm(`Are you sure you want to ${newStatus} this student?`)) return;

        try {
            await api.put(`/api/admin/students/${id}/status`, { status: newStatus });
            setStudent({ ...student, accountStatus: newStatus });
            alert(`Student account ${newStatus} successfully`);
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
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
        setDeleteModal({ show: true });
    };

    const confirmDelete = async () => {
        if (!deleteFeedback.trim()) return alert('Feedback is required for deletion');

        try {
            await api.post('/api/admin/delete-user', {
                userId: id,
                feedback: deleteFeedback
            });
            alert('Student deleted permanently');
            setDeleteModal({ show: false });
            navigate('/admin/students');
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete student');
        }
    };

    const handleDelete = async () => {
        // Legacy function, using modal now
        handleDeleteClick();
    };

    if (loading) return <div className="p-8 text-center text-secondary">Loading student profile...</div>;
    if (!student) return <div className="p-8 text-center text-danger">Student not found</div>;

    return (
        <div className="space-y-6">
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
                    <div className="card text-center py-8">
                        <div className="w-24 h-24 rounded-full bg-primary-light text-primary flex items-center justify-center text-4xl font-bold mx-auto mb-4 border-4 border-white shadow-sm">
                            {student.name.charAt(0)}
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
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-secondary flex items-center gap-2"><Calendar size={14} /> Registered</span>
                                <span className="font-medium">{new Date(student.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary flex items-center gap-2"><Clock size={14} /> Role</span>
                                <span className="font-medium">{student.role.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
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
                                            <option value="CSE">Computer Science & Engineering</option>
                                            <option value="IT">Information Technology</option>
                                            <option value="ECE">Electronics & Communication</option>
                                            <option value="MECH">Mechanical Engineering</option>
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
                                <p className="text-xs text-secondary">Currently connected to:</p>
                                <div className="mt-2 text-sm font-semibold">Not enrolled in mentorship programme</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h5 className="text-sm font-bold flex items-center gap-2 mb-2">
                                    <FileText size={16} /> Documents
                                </h5>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium">Resume.pdf</span>
                                    <button className="text-primary hover:text-primary-dark"><Download size={14} /></button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Delete Feedback Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 text-danger mb-4">
                            <Trash2 size={24} />
                            <h3 className="text-xl font-bold">Confirm Permanent Deletion</h3>
                        </div>
                        <p className="text-secondary mb-4">
                            Are you sure you want to permanently delete <strong>{student.name}</strong>?
                            This action will remove them from MongoDB and cannot be undone.
                        </p>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Reason for deletion (Feedback)</label>
                            <textarea
                                className="form-input w-full min-h-[100px]"
                                placeholder="Please provide a reason for removing this account..."
                                value={deleteFeedback}
                                onChange={(e) => setDeleteFeedback(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setDeleteModal({ show: false });
                                    setDeleteFeedback('');
                                }}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="btn btn-danger"
                                disabled={!deleteFeedback.trim()}
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDetailView;
