import React from 'react';

const AdminDashboard = () => {
    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 className="text-2xl">Admin Dashboard</h1>
            <p>Manage users and events.</p>
            <div className="card mt-4">
                <h3>Pending Verifications</h3>
                <p>No pending verifications.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
