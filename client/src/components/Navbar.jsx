import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Calendar,
    Briefcase,
    LayoutDashboard,
    LogOut,
    LogIn,
    UserPlus,
    GraduationCap
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
            <div className="container flex justify-between items-center">
                <Link to="/" className="text-xl" style={{ color: 'var(--primary)' }}>
                    AlumniPortal
                </Link>
                <div className="flex gap-4 items-center">
                    <Link to="/events" className="text-secondary flex items-center gap-1 hover:text-primary transition-colors">
                        <Calendar size={18} />
                        Events
                    </Link>
                    <Link to="/jobs" className="text-secondary flex items-center gap-1 hover:text-primary transition-colors">
                        <Briefcase size={18} />
                        Jobs
                    </Link>

                    {user ? (
                        <>
                            <Link to="/dashboard" className="text-secondary flex items-center gap-1 hover:text-primary transition-colors">
                                <LayoutDashboard size={18} />
                                Dashboard
                            </Link>
                            <span className="text-sm flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full" style={{ fontWeight: 600 }}>
                                <GraduationCap size={16} className="text-primary" />
                                {user.name} ({user.role})
                            </span>
                            <button onClick={handleLogout} className="btn-outline flex items-center gap-1 py-1 px-3">
                                <LogOut size={16} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-outline flex items-center gap-1 px-4 py-1">
                                <LogIn size={16} />
                                Login
                            </Link>
                            <Link to="/register" className="btn flex items-center gap-1 px-4 py-1">
                                <UserPlus size={16} />
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
