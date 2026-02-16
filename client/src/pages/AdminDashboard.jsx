import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip as ChartTooltip,
    Legend as ChartLegend
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
    Bell,
    AlertCircle,
    Users,
    GraduationCap,
    UserCheck,
    Briefcase,
    CheckCircle,
    MoreHorizontal,
    Flag,
    AlertTriangle,
    ShieldAlert,
    UserX,
    FileText
} from "lucide-react";

ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    ChartTooltip,
    ChartLegend
);
import StatCard from "../components/StatCard";
import api, { API_ENDPOINTS } from '../config/api';

const COLORS = ["#6366F1", "#06B6D4", "#10B981", "#8B5CF6"];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllActivities, setShowAllActivities] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsRes, activityRes] = await Promise.all([
                    api.get(API_ENDPOINTS.GET_ADMIN_STATS),
                    api.get(API_ENDPOINTS.GET_ADMIN_ACTIVITY)
                ]);
                setStats(statsRes.data);
                setActivities(activityRes.data || []);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setStats(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-secondary font-medium">Loading Dashboard...</p>
            </div>
        );
    }

    // Data Transformation: Ensure we always show the last 6 months chronologically
    const monthlyRegistrationsData = (() => {
        const trend = stats?.registrationTrend || [];
        const result = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            const monthNum = d.getMonth() + 1;
            const yearNum = d.getFullYear();

            const dataPoint = { month: monthName, students: 0, alumni: 0 };

            trend.forEach(item => {
                if (item._id?.month === monthNum && item._id?.year === yearNum) {
                    if (item._id.role === 'student') dataPoint.students = item.count;
                    if (item._id.role === 'alumni') dataPoint.alumni = item.count;
                }
            });
            result.push(dataPoint);
        }
        return result;
    })();

    const userDistributionData = stats ? [
        { name: "Students", value: stats.totalStudents || 0 },
        { name: "Alumni", value: stats.totalAlumni || 0 },
        { name: "Admins", value: stats.userDistribution?.admins || 0 }
    ] : [];

    const mentorshipStatsData = [
        { name: "Requested", value: stats?.mentorshipActivity?.pending || 0 },
        { name: "Active", value: stats?.mentorshipActivity?.accepted || 0 },
        { name: "Rejected", value: stats?.mentorshipActivity?.rejected || 0 },
        { name: "Completed", value: 0 }
    ];


    if (!stats) {
        return (
            <div className="p-12 text-center bg-rose-50 rounded-2xl border border-rose-100 max-w-2xl mx-auto my-12 shadow-sm">
                <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-rose-900 mb-2">Technical Malfunction</h3>
                <p className="text-rose-700 mb-6">We couldn't retrieve the system diagnostics. This might be due to a server connection issue.</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-100">
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Admin Overview</h1>
                    <p className="text-slate-500 text-sm">System Analytics and Summary</p>
                </div>
                <div className="flex items-center gap-6">
                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
                        <Bell size={22} />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-slate-50 rounded-full"></span>
                    </button>
                    <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
                        <span className="text-sm font-semibold text-slate-600">Welcome, System Admin</span>
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">A</div>
                    </div>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={(stats?.totalUsers || 0).toLocaleString()}
                    icon={Users}
                    color="primary"
                />
                <StatCard
                    title="Alumni"
                    value={(stats?.totalAlumni || 0).toLocaleString()}
                    icon={GraduationCap}
                    color="cyan"
                />
                <StatCard
                    title="Verified Alumni"
                    value={(stats?.verifiedAlumni || 0).toLocaleString()}
                    icon={UserCheck}
                    color="success"
                />
                <StatCard
                    title="Total Jobs"
                    value={(stats?.totalJobs || 0).toLocaleString()}
                    icon={Briefcase}
                    color="indigo"
                />
            </div>

            {/* SECOND ROW: DISTRIBUTION AND REGISTRATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* USER DISTRIBUTION CARD (Attractive Compound) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">User Distribution</h3>
                        <MoreHorizontal size={20} className="text-slate-400 cursor-pointer" />
                    </div>

                    <div className="flex flex-col items-center gap-8">
                        {/* Doughnut Chart */}
                        <div className="relative w-48 h-48 flex-shrink-0">
                            <Pie
                                data={{
                                    labels: userDistributionData.map(d => d.name),
                                    datasets: [{
                                        data: userDistributionData.map(d => d.value),
                                        backgroundColor: COLORS,
                                        borderWidth: 0,
                                        cutout: '75%',
                                        hoverOffset: 10
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: '#1e293b',
                                            padding: 12,
                                            titleFont: { size: 14, weight: 'bold' },
                                            bodyFont: { size: 13 }
                                        }
                                    }
                                }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-extrabold text-slate-800">{stats?.totalUsers || 0}</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total users</span>
                            </div>
                        </div>

                        {/* Detailed Breakdown Legend */}
                        <div className="w-full space-y-4">
                            {userDistributionData.map((d, i) => (
                                <div key={i} className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                                            <span className="text-sm font-semibold text-slate-600">{d.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-800">{d.value.toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-slate-400">({Math.round((d.value / (stats?.totalUsers || 1)) * 100)}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${(d.value / (stats?.totalUsers || 1)) * 100}%`,
                                                backgroundColor: COLORS[i]
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MONTHLY REGISTRATIONS (Now Prominent) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-slate-800">Registration Trends</h3>
                            <p className="text-[11px] text-slate-400 font-medium">Monthly user growth across roles</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                                <span className="text-[10px] font-bold text-slate-500">Students</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div>
                                <span className="text-[10px] font-bold text-slate-500">Alumni</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[340px]">
                        <Line
                            data={{
                                labels: monthlyRegistrationsData.map(d => d.month),
                                datasets: [
                                    {
                                        label: "Students",
                                        data: monthlyRegistrationsData.map(d => d.students),
                                        borderColor: "#6366F1",
                                        backgroundColor: "#6366F1",
                                        fill: false,
                                        tension: 0.4,
                                        borderWidth: 3,
                                        pointRadius: 5,
                                        pointHoverRadius: 8,
                                        pointBackgroundColor: "#fff",
                                        pointBorderColor: "#6366F1",
                                        pointBorderWidth: 2
                                    },
                                    {
                                        label: "Alumni",
                                        data: monthlyRegistrationsData.map(d => d.alumni),
                                        borderColor: "#06B6D4",
                                        backgroundColor: "#06B6D4",
                                        fill: false,
                                        tension: 0.4,
                                        borderWidth: 3,
                                        pointRadius: 5,
                                        pointHoverRadius: 8,
                                        pointBackgroundColor: "#fff",
                                        pointBorderColor: "#06B6D4",
                                        pointBorderWidth: 2
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        mode: 'index',
                                        intersect: false,
                                        backgroundColor: '#fff',
                                        titleColor: '#1e293b',
                                        bodyColor: '#475569',
                                        borderColor: '#e2e8f0',
                                        borderWidth: 1,
                                        padding: 12,
                                        boxPadding: 6,
                                        usePointStyle: true
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: "rgba(0,0,0,0.03)", drawBorder: false },
                                        ticks: {
                                            precision: 0,
                                            color: "#94a3b8",
                                            font: { size: 11, weight: 'bold' }
                                        }
                                    },
                                    x: {
                                        grid: { display: false },
                                        ticks: { color: "#94a3b8", font: { size: 11, weight: 'bold' } }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* THIRD ROW: ATTENTION, MENTORSHIP, AND ACTIVITY */}
            <div className="flex justify-center mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.1fr_0.7fr] gap-4 w-full max-w-[1150px]">
                    {/* ATTENTION REQUIRED */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-slate-800 mb-3 text-sm px-1">Attention Required</h3>
                        <div className="space-y-2 pr-1">
                            <AttentionItem
                                label="Alumni Verifications"
                                count={stats?.insights?.pendingAlumniVerifications || 0}
                                color="orange"
                                icon={CheckCircle}
                                path="/admin/alumni"
                            />
                            <AttentionItem
                                label="Blocked Members"
                                count={stats?.insights?.blockedAlumniCount || 0}
                                color="rose"
                                icon={ShieldAlert}
                                path="/admin/blocked-members"
                            />
                            <AttentionItem
                                label="Blocked Students"
                                count={stats?.insights?.blockedStudentsCount || 0}
                                color="amber"
                                icon={UserX}
                                path="/admin/blocked-students"
                            />
                            <AttentionItem
                                label="Pending Approvals"
                                count={stats?.insights?.pendingJobsCount || 0}
                                color="indigo"
                                icon={FileText}
                                path="/admin/pending-approvals"
                            />
                        </div>
                    </div>

                    {/* MENTORSHIP PROGRAM ACTIVITY */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="font-bold text-slate-800 text-sm">Mentorship Activity</h3>
                            <MoreHorizontal size={18} className="text-slate-400" />
                        </div>
                        <div className="h-52 px-1">
                            <Bar
                                data={{
                                    labels: mentorshipStatsData.map(d => d.name),
                                    datasets: [{
                                        data: mentorshipStatsData.map(d => d.value),
                                        backgroundColor: mentorshipStatsData.map((_, i) => i % 2 === 0 ? '#6366F1' : '#06B6D4'),
                                        borderRadius: 6
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: { enabled: true }
                                    },
                                    scales: {
                                        y: { display: false },
                                        x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } }
                                    }
                                }}
                            />
                        </div>
                        <div className="flex justify-center gap-4 mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Requested</span>
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Active</span>
                        </div>
                    </div>

                    {/* RECENT ACTIVITIES */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h3 className="font-bold text-slate-800 text-sm">Recent Activities</h3>
                            <MoreHorizontal size={18} className="text-slate-400" />
                        </div>

                        <div
                            className={`space-y-0 px-1 ${showAllActivities ? 'max-h-[350px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth' : 'overflow-hidden'}`}
                        >
                            {(activities.length > 0 ? (showAllActivities ? activities : activities.slice(0, 5)) : [
                                { feedback: "Mentorship request accepted by Rahul S.", timestamp: new Date() },
                                { feedback: "Verified alumni Priya A. (Batch: 202x)", timestamp: new Date(Date.now() - 86400000) },
                                { feedback: "Mentorship requested by Ravi K.", timestamp: new Date(Date.now() - 86400000 * 2) },
                                { feedback: "New admin account created: Karthik", timestamp: new Date(Date.now() - 86400000 * 2.1) },
                                { feedback: "System backup completed successfully", timestamp: new Date(Date.now() - 86400000 * 3) },
                                { feedback: "Reported post removed by Admin", timestamp: new Date(Date.now() - 86400000 * 3.5) }
                            ].slice(0, showAllActivities ? undefined : 5)).map((activity, idx, arr) => (
                                <ActivityItem
                                    key={idx}
                                    title={activity.feedback}
                                    time={new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    date={new Date(activity.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    isLast={idx === arr.length - 1}
                                />
                            ))}
                        </div>

                        <div className="flex justify-end mt-3 px-1">
                            <button
                                onClick={() => setShowAllActivities(!showAllActivities)}
                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-[0.1em]"
                            >
                                {showAllActivities ? 'Show Less' : 'View All'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const AttentionItem = ({ label, count, color, icon: Icon, path }) => {
    const navigate = useNavigate();
    const colorClasses = {
        orange: 'bg-orange-50 text-orange-500 border-orange-100',
        rose: 'bg-rose-50 text-rose-500 border-rose-100',
        amber: 'bg-amber-50 text-amber-500 border-amber-100',
        indigo: 'bg-indigo-50 text-indigo-500 border-indigo-100'
    };

    return (
        <div
            onClick={() => path && navigate(path)}
            className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-xl transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${colorClasses[color]}`}>
                    <Icon size={20} />
                </div>
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors tracking-tight">{label}</span>
            </div>
            <span className="text-xl font-extrabold text-slate-800">{count}</span>
        </div>
    );
};

const ActivityItem = ({ title, time, date, isLast }) => (
    <div className={`flex gap-3 items-start py-1.5 ${!isLast ? 'border-b border-slate-50' : ''}`}>
        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
            <CheckCircle size={12} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
                <p className="text-[12px] font-bold text-slate-700 leading-tight truncate">{title}</p>
                <span className="text-[9px] text-slate-400 font-extrabold whitespace-nowrap uppercase tracking-tighter text-right mt-0.5">{date}</span>
            </div>
            <p className="text-[9px] text-slate-400 font-medium mt-0.5">{time}</p>
        </div>
    </div>
);
