import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Briefcase, Users, Search, Lightbulb } from 'lucide-react';

const Landing = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                color: 'white',
                padding: '6rem 0',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 className="text-2xl" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
                        Welcome to Alumni Portal
                    </h1>
                    <p className="text-xl" style={{ marginBottom: '3rem', opacity: 0.9 }}>
                        Select your role to continue
                    </p>

                    <div className="flex gap-8" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                        {/* Student Option */}
                        <div className="card role-card" style={{
                            background: 'white',
                            color: 'var(--text-dark)',
                            padding: '2.5rem',
                            minWidth: '280px',
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease',
                            border: 'none',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>
                                <GraduationCap size={48} />
                            </div>
                            <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Student</h2>
                            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                                Access jobs, internships, and network with seniors.
                            </p>
                            <Link to="/auth/student" className="btn" style={{ display: 'block' }}>
                                Continue as Student
                            </Link>
                        </div>

                        {/* Alumni Option */}
                        <div className="card role-card" style={{
                            background: 'white',
                            color: 'var(--text-dark)',
                            padding: '2.5rem',
                            minWidth: '280px',
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease',
                            border: 'none',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--secondary)' }}>
                                <Briefcase size={48} />
                            </div>
                            <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Alumni</h2>
                            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                                Share opportunities, mentor students, and stay connected.
                            </p>
                            <Link to="/auth/alumni" className="btn" style={{ display: 'block' }}>
                                Continue as Alumni
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container" style={{ padding: '4rem 0' }}>
                <h2 className="text-2xl" style={{ textAlign: 'center', marginBottom: '3rem' }}>Why Join?</h2>
                <div className="flex" style={{ gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>

                    <div className="card" style={{ flex: '1 1 300px' }}>
                        <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl">Network</h3>
                        <p className="mt-4 text-secondary">
                            Find batchmates, seniors, and industry experts. Connect with people from your department.
                        </p>
                    </div>

                    <div className="card" style={{ flex: '1 1 300px' }}>
                        <div style={{ color: 'var(--success)', marginBottom: '1rem' }}>
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl">Jobs & Internships</h3>
                        <p className="mt-4 text-secondary">
                            Get referred by alumni working in top companies. Apply to exclusive job postings.
                        </p>
                    </div>

                    <div className="card" style={{ flex: '1 1 300px' }}>
                        <div style={{ color: 'var(--warning)', marginBottom: '1rem' }}>
                            <Lightbulb size={32} />
                        </div>
                        <h3 className="text-xl">Mentorship</h3>
                        <p className="mt-4 text-secondary">
                            Get guidance from experienced professionals. One-on-one sessions and career advice.
                        </p>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default Landing;
