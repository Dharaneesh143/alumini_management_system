import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, Search, Lightbulb } from 'lucide-react';
import alumni from '../assets/alumni.png'

const Landing = () => {
    return (
        <div className="landing-page" style={{ marginBottom: '2rem' }}>
            {/* Hero Section */}
            <section className="animated-gradient-bg" style={{
                color: 'white',
                padding: '6rem 0',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    
                    <h1 className="text-2xl" style={{
                        fontSize: '3rem',
                        marginBottom: '1.5rem',
                        fontWeight: '800',
                        color: 'white',
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}>
                        Welcome to Alumni Portal
                    </h1>
                    <p className="text-xl" style={{
                        marginBottom: '3rem',
                        opacity: 0.95,
                        fontSize: '1.25rem',
                        fontWeight: '400'
                    }}>
                        Select your role to continue
                    </p>

                    <div className="flex gap-8" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                        {/* Student Option */}
                        <div className="card role-card" style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            padding: '2.5rem',
                            minWidth: '280px',
                            cursor: 'pointer',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            borderRadius: '1rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'white' }}>
                                <GraduationCap size={48} strokeWidth={2} />
                            </div>
                            <h2 className="text-xl" style={{ marginBottom: '1rem', fontWeight: '700', color: 'white' }}>Student</h2>
                            <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>
                                Access jobs, internships, and network with seniors.
                            </p>
                            <Link to="/auth/student" className="btn" style={{
                                display: 'block',
                                background: 'rgba(255, 255, 255, 0.25)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                textAlign: 'center'
                            }}>
                                Continue as Student
                            </Link>
                        </div>

                        {/* Alumni Option */}
                        <div className="card role-card" style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            padding: '2.5rem',
                            minWidth: '280px',
                            cursor: 'pointer',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            borderRadius: '1rem'
                        }}>
                            
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                color: 'white',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }}>
                                <img src={alumni} alt='alumni' className='w-15 h-15' />
                                
                            </div>
                            <h2 className="text-xl" style={{ marginBottom: '1rem', fontWeight: '700', color: 'white' }}>Alumni</h2>
                            <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>
                                Share opportunities, mentor students, and stay connected.
                            </p>
                            <Link to="/auth/alumni" className="btn" style={{
                                display: 'block',
                                background: 'rgba(255, 255, 255, 0.25)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                textAlign: 'center'
                            }}>
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
            {/* Footer */}
            <footer style={{
                textAlign: 'center',
                padding: '3rem 0',
                borderTop: '1px solid var(--border)',
                marginTop: '3rem',
                marginBottom: '3rem'
            }}>
                <p className="text-secondary text-sm">
                    &copy; 2026 Alumni Portal. All rights reserved.
                </p>
                <Link to="/auth/admin/login" className="text-xs text-secondary hover:text-primary transition-colors" style={{ opacity: 0.6 }}>
                    Admin Access
                </Link>
            </footer>
        </div>
    );
};

export default Landing;
