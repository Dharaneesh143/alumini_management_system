import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_ENDPOINTS } from '../config/api';
import { AuthContext } from '../context/AuthContext.jsx';

const CreateJob = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        company: '',
        location: '',
        type: 'Full-time'
    });
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(API_ENDPOINTS.CREATE_JOB, formData);
            alert('Job posted successfully!');
            navigate('/jobs');
        } catch (err) {
            alert('Failed to post job');
        }
    };

    if (user?.role !== 'alumni') {
        return <div className="container" style={{ padding: '2rem 0' }}>Only alumni can post jobs.</div>;
    }

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 className="text-2xl" style={{ marginBottom: '1.5rem' }}>Post a Job</h2>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Job Title"
                        required
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                    <textarea
                        placeholder="Job Description"
                        required
                        rows="5"
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Company Name"
                        required
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Location (optional)"
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                    <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    >
                        <option value="Full-time">Full-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                    </select>
                    <button type="submit" className="btn w-full">Post Job</button>
                </form>
            </div>
        </div>
    );
};

export default CreateJob;
