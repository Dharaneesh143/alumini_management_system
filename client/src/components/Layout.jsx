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
    Clock,
    Calendar,
    ChevronRight,
    ArrowRight,
    Info
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';
import api, { API_ENDPOINTS } from '../config/api';
import './Layout.css';

const Layout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [activeMentorship, setActiveMentorship] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfilePreview, setShowProfilePreview] = useState(false);

    useEffect(() => {
        if (user) {
            fetchMentorshipStatus();
            fetchNotifications();
        }
    }, [user]);

    const fetchMentorshipStatus = async () => {
        try {
            if (user?.role === 'student' || user?.role === 'alumni') {
                const res = await api.get(API_ENDPOINTS.GET_MENTORSHIP_REQUESTS);
                const active = res.data.find(r => r.status === 'accepted');
                setActiveMentorship(active);
            }
        } catch (err) {
            console.error('Error fetching mentorship status:', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.GET_NOTIFICATIONS);
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put(API_ENDPOINTS.MARK_ALL_READ);
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
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
                { path: '/admin/mentorships', label: 'Mentorships', icon: Users },
                { path: '/jobs', label: 'Jobs', icon: Briefcase },
                { path: '/events', label: 'Events', icon: Calendar }
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
                    {user?.role && (
                        <div className="sidebar-admin-badge">{user.role.toUpperCase()}</div>
                    )}
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

                <div className="sidebar-footer-card">
                    <Link to="/profile" className="sidebar-user-link">
                        <div className="sidebar-user">
                            <div className="sidebar-user-avatar">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="sidebar-user-info">
                                <div className="sidebar-user-name">{user?.name}</div>
                                <div className="sidebar-user-email">
                                    <span className={`status-dot ${user?.accountStatus === 'active' ? 'bg-success' : 'bg-danger'}`}></span>
                                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} • {user?.approvalStatus || 'Active'}
                                </div>
                            </div>
                            <div className="sidebar-user-chevron" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowProfilePreview(true);
                            }}>
                                <Info size={16} />
                            </div>
                        </div>
                    </Link>
                    <div className="sidebar-actions flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <button onClick={() => navigate('/profile')} className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-800 transition-colors">
                            Manage Identity
                        </button>
                        <button onClick={handleLogout} className="sidebar-logout-btn-mini" title="Logout session">
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="main-content">
                {/* Top Bar */}
                <header className="topbar">
                    <div className="topbar-content">
                        <div className="topbar-title">
                            <h1 className="m-0 text-xl font-semibold">
                                {location.pathname === '/dashboard' ? 'Dashboard' :
                                    location.pathname === '/jobs' ? 'Job Opportunities' :
                                        location.pathname === '/jobs/create' ? 'Post a Job' :
                                            location.pathname === '/events' ? 'College Events' :
                                                'Alumni Portal'}
                            </h1>
                        </div>
                        <div className="topbar-actions">
                            {/* Notifications Dropdown */}
                            <div className="notification-wrapper" style={{ position: 'relative' }}>
                                <button
                                    className="topbar-icon-btn"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--text-secondary)' }}
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="notification-badge" style={{
                                            position: 'absolute',
                                            top: '0',
                                            right: '0',
                                            background: '#ef4444',
                                            color: 'white',
                                            fontSize: '0.65rem',
                                            padding: '2px 5px',
                                            borderRadius: '10px',
                                            minWidth: '18px',
                                            border: '2px solid white'
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="notification-dropdown" style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: '0',
                                        width: '320px',
                                        background: 'white',
                                        boxShadow: 'var(--shadow-lg)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-light)',
                                        zIndex: 1000,
                                        marginTop: '0.5rem',
                                        maxHeight: '400px',
                                        overflowY: 'auto'
                                    }}>
                                        <div className="flex justify-between items-center p-3 border-b">
                                            <h4 className="m-0 text-sm font-semibold">Notifications</h4>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer' }}
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                        <div className="notification-list">
                                            {notifications.length === 0 ? (
                                                <p className="p-4 text-center text-secondary text-sm">No notifications</p>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={n._id}
                                                        className={`p-3 border-b hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50' : ''}`}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${n.type === 'job_application' ? 'bg-primary' : 'bg-success'}`}>
                                                                {n.type === 'job_application' ? <Briefcase size={14} /> : <Users size={14} />}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="m-0 text-sm font-semibold">{n.title}</p>
                                                                <p className="m-0 text-xs text-secondary mt-1">{n.content}</p>
                                                                <p className="m-0 text-xs text-secondary opacity-60 mt-2">{new Date(n.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="topbar-user">
                                <span className="text-sm text-secondary">Welcome, {user?.name}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="content-wrapper" style={{ paddingBottom: '100px' }}>
                    {children}
                </main>

                {/* Profile Preview Modal */}
                {showProfilePreview && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowProfilePreview(false)}>
                        <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative">
                                <button onClick={() => setShowProfilePreview(false)} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors">
                                    <PlusCircle size={24} className="rotate-45" />
                                </button>
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl font-black border border-white/30">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black m-0">{user?.name}</h2>
                                        <p className="opacity-80 text-sm font-bold uppercase tracking-widest mt-1">{user?.role}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                        <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Department</p>
                                        <p className="text-sm font-bold text-gray-900">{user?.department || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Batch</p>
                                        <p className="text-sm font-bold text-gray-900">{user?.batch || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-sm font-bold text-success flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
                                            {user?.accountStatus?.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Member Since</p>
                                        <p className="text-sm font-bold text-gray-900">{new Date(user?.createdAt).getFullYear() || '2024'}</p>
                                    </div>
                                </div>

                                {user?.role === 'alumni' && (
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Mentorship Overview</p>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-blue-900">{user?.isMentor ? 'Willing to Mentor' : 'Not Mentoring'}</span>
                                            {user?.isMentor && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">ACTIVE</span>}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowProfilePreview(false);
                                            navigate('/profile');
                                        }}
                                        className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2"
                                    >
                                        <Settings size={18} /> Edit Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-14 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl flex items-center justify-center transition-all"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Layout;
