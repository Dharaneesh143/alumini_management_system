import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/jobs');
            setJobs(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleApply = async (jobId) => {
        try {
            await axios.post(`http://localhost:5000/api/jobs/${jobId}/apply`);
            alert('Applied successfully!');
            fetchJobs(); // Refresh
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to apply');
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem 0' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h1 className="text-2xl">Jobs & Internships</h1>
                {user?.role === 'alumni' && (
                    <Link to="/jobs/create" className="btn">Post a Job</Link>
                )}
            </div>

            <div className="flex flex-col gap-4">
                {jobs.length === 0 ? (
                    <div className="card">No jobs posted yet.</div>
                ) : (
                    jobs.map(job => (
                        <div key={job._id} className="card">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl">{job.title}</h3>
                                    <p className="text-secondary">{job.company} • {job.location || 'Remote'} • {job.type}</p>
                                    <p className="mt-4">{job.description.substring(0, 150)}...</p>
                                    <p className="text-sm text-secondary mt-4">Posted by {job.postedBy?.name}</p>
                                </div>
                                <div>
                                    {user?.role === 'student' && (
                                        <button
                                            onClick={() => handleApply(job._id)}
                                            className="btn"
                                            disabled={job.applicants?.some(a => a.user === user.id)}
                                        >
                                            {job.applicants?.some(a => a.user === user.id) ? 'Applied' : 'Apply'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default JobList;
