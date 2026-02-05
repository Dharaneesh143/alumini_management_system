import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import api, { API_ENDPOINTS } from '../config/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        profile: {
            department: '',
            batch: '',
            company: '',
            designation: '',
            skills: '',
            linkedin: '',
            github: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                profile: {
                    department: user.profile?.department || '',
                    batch: user.profile?.batch || '',
                    company: user.profile?.company || '',
                    designation: user.profile?.designation || '',
                    skills: user.profile?.skills?.join(', ') || '',
                    linkedin: user.profile?.linkedin || '',
                    github: user.profile?.github || ''
                }
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') {
            setFormData({ ...formData, name: value });
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
                profile: {
                    ...formData.profile,
                    skills: formData.profile.skills
                        .split(',')
                        .map(s => s.trim())
                        .filter(s => s)
                }
            };

            await api.put(API_ENDPOINTS.UPDATE_PROFILE, updateData);
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
                            <label className="form-label">Department *</label>
                            <input
                                type="text"
                                name="department"
                                value={formData.profile.department}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., Computer Science"
                            />
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

                    {/* Resume Section */}
                    {user?.role === 'student' && (
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="text-xl font-bold mb-4">Resume (PDF)</h3>
                            <div className="card bg-gray-50 border-dashed">
                                <div className="flex flex-col items-center justify-center py-4">
                                    {user.resumeUrl ? (
                                        <div className="mb-4 text-center">
                                            <p className="text-success font-medium mb-2">✅ Resume Uploaded</p>
                                            <a
                                                href={`${api.defaults.baseURL}${user.resumeUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                View Current Resume
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-secondary mb-4 italic">No resume uploaded yet (PDF only, max 5MB)</p>
                                    )}
                                    <input
                                        type="file"
                                        accept=".pdf"
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
                                                setMessage('Resume uploaded successfully!');
                                                setTimeout(() => window.location.reload(), 1000);
                                            } catch (err) {
                                                setMessage(err.response?.data?.msg || 'Failed to upload resume');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary hover:file:text-white transition-all"
                                    />
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
                </form>
            </div>
        </div>
    );
};

export default Profile;
