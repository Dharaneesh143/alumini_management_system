import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
                    <Link to="/events" className="text-secondary">Events</Link>
                    <Link to="/jobs" className="text-secondary">Jobs</Link>

                    {user ? (
                        <>
                            <Link to="/dashboard" className="text-secondary">Dashboard</Link>
                            <span className="text-sm" style={{ fontWeight: 600 }}>{user.name} ({user.role})</span>
                            <button onClick={handleLogout} className="btn-outline">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-outline">Login</Link>
                            <Link to="/register" className="btn">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
