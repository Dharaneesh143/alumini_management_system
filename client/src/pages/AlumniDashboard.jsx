import React from "react";
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { Link, useNavigate } from 'react-router-dom';
import api, { API_ENDPOINTS } from "../config/api";
import { AuthContext } from '../context/AuthContext.jsx';


ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

const AlumniDashboard = () => {
    const [stats, setStats] = React.useState({
        activeMentees: 0,
        pendingRequests: 0,
        completedSessions: 0,
        jobReferrals: 0,
        jobReferrals: 0,
        monthlyData: []
    });
    const [alumniRequests, setAlumniRequests] = React.useState([]); // New Request State
    const [loading, setLoading] = React.useState(true);
    const { user } = React.useContext(AuthContext);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get(API_ENDPOINTS.GET_ALUMNI_STATS);
                setStats(res.data);

                // Fetch Pending Requests
                const reqRes = await api.get('/api/events/alumni/requests');
                setAlumniRequests(reqRes.data);
            } catch (err) {
                console.error('Error fetching alumni stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="dashboard-container"><p>Loading dashboard...</p></div>;
    }

    return (
        <div className="dashboard-container">

            {/* HEADER */}
            <div className="dashboard-header">
                <h1>Alumni Dashboard</h1>
                <p>Mentorship, activity and engagement overview</p>
            </div>

            {/* MENTORSHIP STATUS ALERT */}
            {!user?.isMentor && (
                <div className="bg-orange-50 border-2 border-orange-100 rounded-[2rem] p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                            💡
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Enable Mentorship</h3>
                            <p className="text-gray-600 mt-1">You haven't enabled your mentorship profile yet. Students cannot find you for guidance.</p>
                        </div>
                    </div>
                    <Link
                        to="/profile"
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        Enable Now
                    </Link>
                </div>
            )}

            {/* PENDING EVENT REQUESTS ALERT */}
            {alumniRequests.length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-100 rounded-[2rem] p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                            📅
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">You have {alumniRequests.length} Pending Event Request{alumniRequests.length > 1 ? 's' : ''}</h3>
                            <p className="text-gray-600 mt-1">The college has requested you to schedule these events.</p>
                        </div>
                    </div>
                    <Link
                        to="/events"
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        View & Schedule
                    </Link>
                </div>
            )}

            {/* STAT CARDS */}
            <div className="stats-grid">
                <StatCard title="Active Mentees" value={stats.activeMentees} icon="👨🎓" color="blue" />
                <StatCard title="Mentorship Requests" value={stats.pendingRequests} icon="📩" color="orange" />
                <StatCard title="Completed Sessions" value={stats.completedSessions} icon="✅" color="green" />
                <StatCard title="Job Referrals" value={stats.jobReferrals} icon="💼" color="purple" />
            </div>

            {/* CHARTS */}
            <div className="charts-grid">

                <div className="chart-card">
                    <h3>Mentorship Distribution</h3>
                    <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
                        <Pie
                            data={{
                                labels: ["Active", "Completed", "Pending"],
                                datasets: [
                                    {
                                        data: [stats.activeMentees, stats.completedSessions, stats.pendingRequests],
                                        backgroundColor: ["#4f46e5", "#22c55e", "#f59e0b"]
                                    }
                                ]
                            }}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: { boxWidth: 12, font: { size: 11 } }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* BAR */}
                <div className="chart-card wide">
                    <h3>Monthly Mentorship Sessions</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <Bar
                            data={{
                                labels: stats.monthlyData.map(d => d.month),
                                datasets: [
                                    {
                                        label: "Sessions",
                                        data: stats.monthlyData.map(d => d.sessions),
                                        backgroundColor: "#4f46e5"
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>


            {/* BOTTOM SECTION */}
            <div className="bottom-grid">

                <div className="activity-card">
                    <h3>Recent Activity</h3>
                    <ul>
                        <li>✔ Mentorship accepted</li>
                        <li>✔ Resume reviewed</li>
                        <li>✔ Chat session completed</li>
                        <li>✔ Job referred</li>
                    </ul>
                </div>

                <div className="alert-card">
                    <h3>Notifications</h3>
                    <p>Pending Requests: <b>3</b></p>
                    <p>Unread Chats: <b>2</b></p>
                    <p>Upcoming Sessions: <b>1</b></p>
                </div>

            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => {
    return (
        <div className={`stat-card ${color}`}>
            <div>
                <p>{title}</p>
                <h2>{value}</h2>
            </div>
            <span className="icon">{icon}</span>
        </div>
    );
};

export default AlumniDashboard;
