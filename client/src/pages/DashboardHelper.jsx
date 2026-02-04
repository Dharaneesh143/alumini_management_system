import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import StudentDashboard from './StudentDashboard';
import AlumniDashboard from './AlumniDashboard'; // To be created
import AdminDashboard from './AdminDashboard'; // To be created

const DashboardHelper = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Please log in</div>;

    if (user.role === 'student') return <StudentDashboard />;
    if (user.role === 'alumni') return <AlumniDashboard />;
    if (user.role === 'admin') return <AdminDashboard />;

    return <div>Unknown Role</div>;
};

export default DashboardHelper;
