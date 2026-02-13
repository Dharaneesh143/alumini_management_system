import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import api, { API_ENDPOINTS } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, FileText, Download, Upload } from 'lucide-react';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        profile: {
            department: '',
            batch: '',
            cgpa: '',
            company: '',
            designation: '',
            skills: '',
            linkedin: '',
            github: ''
        },
        isMentor: false,
        mentorSettings: {
            capacity: 3,
            mentorshipAreas: '',
            resumeReview: true
        }
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivateFeedback, setDeactivateFeedback] = useState('');

    useEffect(() => {
        if (user) {
            console.log('Profile User Data:', JSON.stringify(user, null, 2)); // Debug Log
            setFormData({
                name: user.name || '',
                phoneNumber: user.phoneNumber || user.phone_number || '',
                profile: {
                    department: user.profile?.department || user.department || '',
                    batch: user.profile?.batch || user.batch || '',
                    cgpa: (user.profile?.cgpa && !isNaN(user.profile?.cgpa)) ? user.profile.cgpa : '',
                    company: user.profile?.company || '',
                    designation: user.profile?.designation || '',
                    skills: user.profile?.skills?.join(', ') || '',
                    linkedin: user.profile?.linkedin || '',
                    github: user.profile?.github || ''
                },
                isMentor: user.isMentor || false,
                mentorSettings: {
                    capacity: user.mentorSettings?.capacity || 3,
                    mentorshipAreas: user.mentorSettings?.mentorshipAreas?.join(', ') || '',
                    resumeReview: user.mentorSettings?.resumeReview !== undefined ? user.mentorSettings.resumeReview : true
                }
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name' || name === 'phoneNumber') {
            setFormData({ ...formData, [name]: value });
        } else if (name === 'isMentor') {
            setFormData({ ...formData, isMentor: e.target.checked });
        } else if (['capacity', 'mentorshipAreas', 'resumeReview'].includes(name)) {
            setFormData({
                ...formData,
                mentorSettings: {
                    ...formData.mentorSettings,
                    [name]: name === 'resumeReview' ? e.target.checked : value
                }
            });
        } else {
            setFormData({
                ...formData,
                profile: { ...formData.profile, [name]: value }
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const updateData = {
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                profile: {
                    ...formData.profile,
                    cgpa: formData.profile.cgpa,
                    skills: formData.profile.skills
                        .split(',')
                        .map(s => s.trim())
                        .filter(s => s)
                },
                isMentor: formData.isMentor,
                mentorSettings: {
                    ...formData.mentorSettings,
                    mentorshipAreas: formData.mentorSettings.mentorshipAreas
                        .split(',')
                        .map(s => s.trim())
                        .filter(s => s)
                }
            };

            console.log('Sending Update Payload:', JSON.stringify(updateData, null, 2)); // Debug Log

            const res = await api.put(API_ENDPOINTS.UPDATE_PROFILE, updateData);
            console.log('Server Response:', JSON.stringify(res.data, null, 2)); // Debug Log

            setMessage('Profile updated successfully!');

            // Refresh page after 1 second
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setMessage(err.response?.data?.msg || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Edit Profile</h2>
                <p className="text-secondary">Update your personal and professional information</p>
            </div>

            {/* Message */}
            {message && (
                <div className={`card mb-6 ${message.includes('success') ? 'bg-success-light' : 'bg-danger-light'}`}>
                    <p className="m-0">{message}</p>
                </div>
            )}

            {/* Profile Form */}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="form-group">
                            <label className="form-label">Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number *</label>
                            <input
                                type="number"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., 9876543210"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Department *</label>
                            <select
                                name="department"
                                value={formData.profile.department}
                                onChange={handleChange}
                                className="form-input"
                                required
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

                        <div className="form-group">
                            <label className="form-label">Batch/Year *</label>
                            <input
                                type="text"
                                name="batch"
                                value={formData.profile.batch}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., 2020"
                            />
                        </div>

                        {user?.role === 'student' && (
                            <div className="form-group">
                                <label className="form-label">CGPA (0-10)</label>
                                <input
                                    type="number"
                                    name="cgpa"
                                    value={formData.profile.cgpa}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., 8.5"
                                    min="0"
                                    max="10"
                                    step="0.01"
                                />
                            </div>
                        )}

                        {/* Professional Information (for Alumni) */}
                        {user?.role === 'alumni' && (
                            <>

                                <div className="form-group">
                                    <label className="form-label">Company</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.profile.company}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="e.g., Google"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Designation</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={formData.profile.designation}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="e.g., Software Engineer"
                                    />
                                </div>
                            </>
                        )}

                        {/* Skills */}
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Skills (comma-separated)</label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.profile.skills}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., JavaScript, React, Node.js"
                            />
                        </div>

                        {/* Social Links */}
                        <div className="form-group">
                            <label className="form-label">LinkedIn Profile</label>
                            <input
                                type="url"
                                name="linkedin"
                                value={formData.profile.linkedin}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="https://linkedin.com/in/username"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">GitHub Profile</label>
                            <input
                                type="url"
                                name="github"
                                value={formData.profile.github}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="https://github.com/username"
                            />
                        </div>
                    </div>

                    {/* Mentorship Settings (for Alumni) */}
                    {user?.role === 'alumni' && (
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="bg-primary-light p-2 rounded-lg">🎓</span>
                                Mentorship Settings
                            </h3>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200/60">
                                    <div>
                                        <p className="font-bold text-gray-900">Willing to Mentor</p>
                                        <p className="text-sm text-secondary">Enable this to show up in the mentor discovery list for students.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isMentor"
                                            checked={formData.isMentor}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {formData.isMentor && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="form-group">
                                            <label className="form-label">Mentorship Capacity</label>
                                            <input
                                                type="number"
                                                name="capacity"
                                                min="1"
                                                max="10"
                                                value={formData.mentorSettings.capacity}
                                                onChange={handleChange}
                                                className="form-input"
                                                placeholder="Number of students"
                                            />
                                            <p className="text-[10px] text-secondary mt-1">Recommended: 1-5 students at a time.</p>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Resume Review</label>
                                            <div className="flex items-center gap-3 mt-3">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="resumeReview"
                                                        checked={formData.mentorSettings.resumeReview}
                                                        onChange={handleChange}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                                                </label>
                                                <span className="text-sm font-medium text-gray-600">Provide resume feedback</span>
                                            </div>
                                        </div>

                                        <div className="form-group md:col-span-2">
                                            <label className="form-label">Mentorship Areas (comma-separated)</label>
                                            <input
                                                type="text"
                                                name="mentorshipAreas"
                                                value={formData.mentorSettings.mentorshipAreas}
                                                onChange={handleChange}
                                                className="form-input"
                                                placeholder="e.g., Coding, Placement, Higher Studies"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Resume / Portfolio Section */}
                    {user?.role === 'student' && (
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="text-xl font-bold mb-4">Resume / Proof of Work</h3>
                            <div className="card bg-gray-50 border-dashed border-2 border-gray-200 rounded-[2rem] p-6">
                                <div className="flex flex-col items-center justify-center py-4">
                                    {(user.profile?.resumeUrl || user.resumeUrl) ? (
                                        <div className="mb-6 text-center w-full max-w-sm mx-auto">
                                            <p className="text-success font-bold mb-4 flex items-center justify-center gap-2">
                                                <CheckCircle size={18} /> File Uploaded Successfully
                                            </p>

                                            {/* Dynamic Preview */}
                                            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-4 h-48 flex items-center justify-center overflow-hidden">
                                                {(user.profile?.resumeUrl || user.resumeUrl).toLowerCase().endsWith('.pdf') ? (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <FileText size={48} className="text-red-500" />
                                                        <span className="text-sm font-bold text-gray-500">PDF Document</span>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={`${api.defaults.baseURL}${user.profile?.resumeUrl || user.resumeUrl}`}
                                                        alt="Resume Preview"
                                                        className="max-h-full object-contain rounded-xl"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/150?text=File+Preview';
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            <a
                                                href={`${api.defaults.baseURL}${user.profile?.resumeUrl || user.resumeUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-white px-6 py-2 rounded-full font-bold hover:bg-primary-dark transition-all shadow-md"
                                            >
                                                <Download size={16} /> View/Download File
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Upload size={24} className="text-gray-400" />
                                            </div>
                                            <p className="text-secondary italic">No file uploaded yet (PDF or Images, max 5MB)</p>
                                        </div>
                                    )}

                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;

                                                const formData = new FormData();
                                                formData.append('resume', file);

                                                try {
                                                    setLoading(true);
                                                    await api.post('/api/student/resume', formData, {
                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                    });
                                                    setMessage('File uploaded successfully!');
                                                    // Immediately refresh user data or reload
                                                    setTimeout(() => window.location.reload(), 1000);
                                                } catch (err) {
                                                    setMessage(err.response?.data?.msg || 'Failed to upload file');
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <button className="btn btn-primary rounded-full px-8 group-hover:bg-primary-dark transition-colors">
                                            {loading ? 'Uploading...' : (user.profile?.resumeUrl || user.resumeUrl) ? 'Replace File' : 'Upload Resume/Image'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 mt-6">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-outline"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Account Security / Deactivation */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="text-xl font-bold text-danger mt-4 mb-2">Account Security</h3>
                        <p className="text-secondary mb-4">Deactivating your account will disable your access to the portal. Your data will be preserved if you wish to reactivate later.</p>
                        <button
                            type="button"
                            onClick={() => setShowDeactivateModal(true)}
                            className="btn btn-danger "
                            disabled={loading}
                        >
                            Deactivate Account
                        </button>
                    </div>
                </form>
            </div>

            {/* Deactivate Account Modal - Refined Review Style Design */}
            {showDeactivateModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowDeactivateModal(false);
                            setDeactivateFeedback('');
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
                                setShowDeactivateModal(false);
                                setDeactivateFeedback('');
                            }}
                            className="absolute top-8 right-8 w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-red-400 transition-all group"
                            x                       >
                            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Title Section */}
                        <h3 className="text-[24px] font-bold text-gray-900 mb-6 font-serif leading-tight">Deactivate Account</h3>

                        {/* User Identity Section */}
                        <div className="flex items-center gap-4 mb-8 pb-2">
                            <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-red-200">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-lg text-gray-900 leading-tight">{user?.name}</p>
                                <p className="text-[15px] text-gray-500 mt-0.5">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</p>
                            </div>
                        </div>

                        {/* Question Header */}
                        <div className="mb-6">
                            <p className="text-[17px] font-semibold text-gray-800">Why are you deactivating?</p>
                        </div>

                        {/* Feedback Input Block */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium mb-4 text-gray-500 mb-3">
                                Share your reason (optional)
                            </label>
                            <textarea
                                className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all h-32 resize-none text-[15px] text-gray-900 placeholder-gray-400"
                                placeholder="I'm leaving because..."
                                value={deactivateFeedback}
                                onChange={(e) => setDeactivateFeedback(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {/* Action Button */}
                        {user?.deactivationRequest?.status === 'pending' ? (
                            <div className="text-center p-6 bg-yellow-50 rounded-3xl border border-yellow-100">
                                <p className="text-yellow-800 font-bold">Request Pending</p>
                                <p className="text-yellow-600 text-xs mt-1">An administrator is reviewing your deactivation request.</p>
                            </div>
                        ) : (
                            <button
                                onClick={async () => {
                                    try {
                                        setLoading(true);
                                        const res = await api.post('/api/users/deactivate', { reason: deactivateFeedback });
                                        alert(res.data.msg || 'Your request has been sent to the administrator.');
                                        // Update local context or just close modal as it's now pending
                                        setShowDeactivateModal(false);
                                        setDeactivateFeedback('');
                                        // Refresh page to see new status
                                        window.location.reload();
                                    } catch (err) {
                                        alert(err.response?.data?.msg || 'Failed to send deactivation request');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-[17px]"
                            >
                                Confirm Request
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
