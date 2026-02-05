import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    GraduationCap,
    UserCheck,
    PlusCircle,
    LogOut,
    User,
    Settings,
    Bell,
    Clock
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';
import api, { API_ENDPOINTS } from '../config/api';
import './Layout.css';

const Layout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [activeMentorship, setActiveMentorship] = useState(null);

    useEffect(() => {
        if (user?.role === 'student' || user?.role === 'alumni') {
            fetchMentorshipStatus();
        }
    }, [user]);

    const fetchMentorshipStatus = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.GET_MENTORSHIP_REQUESTS);
            const active = res.data.find(r => r.status === 'accepted');
            setActiveMentorship(active);
        } catch (err) {
            console.error('Error fetching mentorship status:', err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Role-based navigation items
    const getNavItems = () => {
        const commonItems = [
            { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/jobs', label: 'Jobs', icon: Briefcase }
        ];

        if (user?.role === 'admin') {
            return [
                { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
                { path: '/admin/students', label: 'Students', icon: GraduationCap },
                { path: '/admin/alumni', label: 'Alumni', icon: UserCheck },
                { path: '/admin/users', label: 'All Users', icon: Users },
                { path: '/jobs', label: 'Jobs', icon: Briefcase }
            ];
        }

        if (user?.role === 'alumni') {
            return [
                ...commonItems,
                { path: '/mentorship/requests', label: 'Mentorship Requests', icon: GraduationCap },
                { path: '/mentorship/chats', label: 'My Students', icon: Users },
                { path: '/jobs/create', label: 'Post Job', icon: PlusCircle }
            ];
        }

        if (user?.role === 'student') {
            return [
                ...commonItems,
                activeMentorship
                    ? { path: `/mentorship/conversation/${activeMentorship._id}`, label: 'My Mentor', icon: GraduationCap }
                    : { path: '/mentorship', label: 'Find Mentors', icon: GraduationCap },
                { path: '/mentorship/requests', label: 'My Requests', icon: Clock }
            ];
        }

        return commonItems;
    };

    const navItems = getNavItems();

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-logo">AlumniPortal</h2>
                    <div className="sidebar-role-badge">
                        <span className={`badge badge-${user?.role === 'admin' ? 'danger' : user?.role === 'alumni' ? 'info' : 'success'}`}>
                            {user?.role?.toUpperCase()}
                        </span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="sidebar-nav-icon">
                                {React.createElement(item.icon, { size: 20 })}
                            </span>
                            <span className="sidebar-nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name}</div>
                            <div className="sidebar-user-email">{user?.email}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline w-full btn-sm flex items-center justify-center gap-2">
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="main-content">
                {/* Top Bar */}
                <header className="topbar">
                    <div className="topbar-content">
                        <div className="topbar-title">
                            <h1 className="m-0 text-xl font-semibold">
                                {location.pathname === '/dashboard' ? `${user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Dashboard` :
                                    location.pathname === '/jobs' ? 'Job Opportunities' :
                                        location.pathname === '/jobs/create' ? 'Post a Job' :
                                            'Alumni Portal'}
                            </h1>
                        </div>
                        <div className="topbar-actions">
                            <div className="topbar-user">
                                <span className="text-sm text-secondary">Welcome, {user?.name}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="content-wrapper">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
