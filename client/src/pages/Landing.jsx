import React from 'react';
import { Link } from 'react-router-dom';

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
                        Connect, Mentor, Grow
                    </h1>
                    <p className="text-xl" style={{ marginBottom: '2rem', opacity: 0.9 }}>
                        The official Alumni Management Portal. Helping students and alumni stay connected forever.
                    </p>
                    <div className="flex gap-4" style={{ justifyContent: 'center' }}>
                        <Link to="/register" className="btn" style={{ background: 'white', color: 'var(--primary)' }}>
                            Join Network
                        </Link>
                        <Link to="/login" className="btn-outline" style={{ borderColor: 'white', color: 'white' }}>
                            Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container" style={{ padding: '4rem 0' }}>
                <h2 className="text-2xl" style={{ textAlign: 'center', marginBottom: '3rem' }}>Why Join?</h2>
                <div className="flex" style={{ gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>

                    <div className="card" style={{ flex: '1 1 300px' }}>
                        <h3 className="text-xl">Network</h3>
                        <p className="mt-4 text-secondary">
                            Find batchmates, seniors, and industry experts. Connect with people from your department.
                        </p>
                    </div>

                    <div className="card" style={{ flex: '1 1 300px' }}>
                        <h3 className="text-xl">Jobs & Internships</h3>
                        <p className="mt-4 text-secondary">
                            Get referred by alumni working in top companies. Apply to exclusive job postings.
                        </p>
                    </div>

                    <div className="card" style={{ flex: '1 1 300px' }}>
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
