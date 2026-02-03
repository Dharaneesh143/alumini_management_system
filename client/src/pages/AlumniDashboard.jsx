import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AlumniDashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 className="text-2xl">Welcome, {user.name}</h1>
            <p className="text-secondary">Alumni Account {user.isVerified ? '(Verified)' : '(Pending Verification)'}</p>

            {!user.isVerified && (
                <div style={{ background: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: 'var(--radius)', marginTop: '1rem' }}>
                    Your account is pending admin verification. Some features may be restricted.
                </div>
            )}

            <div className="flex gap-4 mt-4" style={{ flexWrap: 'wrap' }}>
                <div className="card" style={{ flex: '1 1 300px' }}>
                    <h3 className="text-xl">Post a Job</h3>
                    <p className="mt-4">Share opportunities with students.</p>
                    <Link to="/jobs/create" className="btn mt-4">Post Job</Link>
                </div>
                <div className="card" style={{ flex: '1 1 300px' }}>
                    <h3 className="text-xl">Mentorship Requests</h3>
                    <p className="mt-4">Manage mentorship requests from students.</p>
                    <Link to="/mentorship/requests" className="btn mt-4">View Requests</Link>
                </div>
                <div className="card" style={{ flex: '1 1 300px' }}>
                    <h3 className="text-xl">Profile</h3>
                    <p className="mt-4">Update your current company and skills.</p>
                    <Link to="/profile" className="btn-outline mt-4">Edit Profile</Link>
                </div>
            </div>
        </div>
    );
};

export default AlumniDashboard;
