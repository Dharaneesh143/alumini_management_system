import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 className="text-2xl">Welcome, {user.name}</h1>
            <p className="text-secondary">Student Account</p>

            <div className="flex gap-4 mt-4" style={{ flexWrap: 'wrap' }}>
                <div className="card" style={{ flex: '1 1 300px' }}>
                    <h3 className="text-xl">Jobs & Internships</h3>
                    <p className="mt-4">Browse opportunities posted by alumni.</p>
                    <Link to="/jobs" className="btn mt-4">View Jobs</Link>
                </div>
                <div className="card" style={{ flex: '1 1 300px' }}>
                    <h3 className="text-xl">Mentorship</h3>
                    <p className="mt-4">Find a mentor for career guidance.</p>
                    <Link to="/mentorship" className="btn mt-4">Find Mentor</Link>
                </div>
                <div className="card" style={{ flex: '1 1 300px' }}>
                    <h3 className="text-xl">Profile</h3>
                    <p className="mt-4">Update your skills and resume.</p>
                    <Link to="/profile" className="btn-outline mt-4">Edit Profile</Link>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
