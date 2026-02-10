import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, LabelList
} from "recharts";
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
    AlertTriangle
} from "lucide-react";
import StatCard from "../components/StatCard";
import api, { API_ENDPOINTS } from '../config/api';

const COLORS = ["#6366F1", "#06B6D4", "#10B981", "#8B5CF6"];

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (!stats) {
        return (
            <div className="p-12 text-center bg-red-50 rounded-2xl border border-red-100">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-red-900 mb-2">Technical Malfunction</h3>
                <p className="text-red-700 mb-6">We couldn't retrieve the system diagnostics. Please try again later.</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary">Retry Connection</button>
            </div>
        );
    }

    // Data Transformation
    const userDistributionData = [
        { name: "Students", value: stats.userDistribution?.students || 950 },
        { name: "Alumni", value: stats.userDistribution?.alumni || 200 },
        { name: "Admins", value: stats.userDistribution?.admins || 50 }
    ];

    const getMonthName = (m) => {
        return new Date(2000, m - 1).toLocaleString('default', { month: 'short' });
    };

    const formatTrendData = (trend) => {
        if (!trend || trend.length === 0) {
            // Placeholder data matching image trend
            return [
                { month: 'Jan', students: 50, alumni: 40 },
                { month: 'Feb', students: 80, alumni: 45 },
                { month: 'Mar', students: 100, alumni: 50 },
                { month: 'Apr', students: 120, alumni: 55 },
                { month: 'May', students: 150, alumni: 60 },
                { month: 'Jun', students: 180, alumni: 70 },
                { month: 'Jul', students: 210, alumni: 80 },
                { month: 'Aug', students: 250, alumni: 100 },
            ];
        }
        const monthsMap = {};
        trend.forEach(item => {
            if (!item._id) return;
            const key = getMonthName(item._id.month);
            if (!monthsMap[key]) monthsMap[key] = { month: key, students: 0, alumni: 0 };
            if (item._id.role === 'student') monthsMap[key].students = item.count;
            else if (item._id.role === 'alumni') monthsMap[key].alumni = item.count;
        });
        return Object.values(monthsMap);
    };

    const monthlyRegistrationsData = formatTrendData(stats.registrationTrend || []);

    const mentorshipStatsData = [
        { name: "Requested", value: 120 },
        { name: "Accepted", value: 30 },
        { name: "Active", value: 50 },
        { name: "Active", value: 50 },
        { name: "Completed", value: 55 }
    ];

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500" style={{ background: '#f8fafc', margin: '-2rem', padding: '2rem' }}>
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
                    value={(stats.totalUsers || 1200).toLocaleString()}
                    icon={Users}
                    color="primary"
                />
                <StatCard
                    title="Total Students"
                    value={(stats.totalStudents || 950).toLocaleString()}
                    icon={GraduationCap}
                    color="purple"
                />
                <StatCard
                    title="Verified Alumni"
                    value={(stats.verifiedAlumni || 200).toLocaleString()}
                    icon={UserCheck}
                    color="success"
                />
                <StatCard
                    title="Total Jobs"
                    value={(stats.totalJobs || 25).toLocaleString()}
                    icon={Briefcase}
                    color="indigo"
                />
            </div>

            {/* SECOND ROW: DISTRIBUTION AND ATTENTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* USER DISTRIBUTION CARD */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">User Distribution</h3>
                        <MoreHorizontal size={20} className="text-slate-400 cursor-pointer" />
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-12 flex-1">
                        <div className="relative w-44 h-44 flex-shrink-0" style={{ width: '176px', height: '176px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={userDistributionData}
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {userDistributionData.map((entry, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-extrabold text-slate-800">{stats.totalUsers || 1200}</span>
                                <div className="flex flex-col items-center text-[10px] uppercase font-bold text-slate-400 tracking-tighter leading-tight mt-1">
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Students
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div> Alumni
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Admin
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full h-56" style={{ height: '224px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyRegistrationsData}>
                                    <XAxis dataKey="month" hide />
                                    <YAxis hide />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="students" stroke="#6366F1" strokeWidth={4} dot={{ r: 5, fill: '#6366F1' }} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="alumni" stroke="#06B6D4" strokeWidth={4} dot={{ r: 5, fill: '#06B6D4' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-8 mt-6 text-xs font-bold text-slate-500">
                                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500"></div> Students</span>
                                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-500"></div> Alumni</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ATTENTION REQUIRED */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-bold text-slate-800 mb-8">Attention Required</h3>
                    <div className="space-y-6">
                        <AttentionItem
                            label="Pending Alumni Verifications"
                            count={stats.insights?.pendingAlumniVerifications || 5}
                            color="orange"
                            icon={CheckCircle}
                        />
                        <AttentionItem
                            label="Inactive Mentors (30+ days)"
                            count={3}
                            color="rose"
                            icon={AlertTriangle}
                        />
                        <AttentionItem
                            label="Reported Accounts"
                            count={2}
                            color="amber"
                            icon={Flag}
                        />
                        <AttentionItem
                            label="Flagged Posts"
                            count={1}
                            color="indigo"
                            icon={Bell}
                        />
                    </div>
                </div>
            </div>

            {/* THIRD ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* MONTHLY REGISTRATIONS */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">Monthly Registrations</h3>
                        <MoreHorizontal size={20} className="text-slate-400" />
                    </div>
                    <div className="h-56" style={{ height: '224px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyRegistrationsData}>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="students" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="alumni" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4 text-[11px] font-bold text-slate-400">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Students</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Alumni</span>
                    </div>
                </div>

                {/* MENTORSHIP PROGRAM ACTIVITY */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">Mentorship Program Activity</h3>
                        <MoreHorizontal size={20} className="text-slate-400" />
                    </div>
                    <div className="h-56" style={{ height: '224px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mentorshipStatsData} margin={{ top: 20 }}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                                <YAxis hide />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
                                    {mentorshipStatsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366F1' : '#06B6D4'} />
                                    ))}
                                    <LabelList dataKey="value" position="top" style={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4 text-[11px] font-bold text-slate-400">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Requested</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Active</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Completed</span>
                    </div>
                </div>

                {/* RECENT ACTIVITIES */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">Recent Activities</h3>
                        <MoreHorizontal size={20} className="text-slate-400" />
                    </div>
                    <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {activities.length > 0 ? activities.map((activity, idx) => (
                            <ActivityItem
                                key={idx}
                                title={activity.feedback}
                                time={new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                date={new Date(activity.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            />
                        )) : (
                            <>
                                <ActivityItem title="Mentorship request accepted by Rahul S." time="9:15 AM" date="Today" />
                                <ActivityItem title="Verified alumni Priya A. (Batch: 202x)" time="3:30 PM" date="Yesterday" />
                                <ActivityItem title="Mentorship requested by Ravi K." time="3:30 PM" date="April 21, 2023" />
                                <ActivityItem title="New admin account created: Karthik" time="10:10 AM" date="April 21, 2023" />
                            </>
                        )}
                    </div>
                    <button className="mt-4 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 text-right uppercase tracking-wider">View All Items</button>
                </div>
            </div>
        </div>
    );
}

const AttentionItem = ({ label, count, color, icon: Icon }) => {
    const colorClasses = {
        orange: 'bg-orange-50 text-orange-500 border-orange-100',
        rose: 'bg-rose-50 text-rose-500 border-rose-100',
        amber: 'bg-amber-50 text-amber-500 border-amber-100',
        indigo: 'bg-indigo-50 text-indigo-500 border-indigo-100'
    };

    return (
        <div className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-xl transition-colors">
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

const ActivityItem = ({ title, time, date }) => (
    <div className="flex gap-4 items-start group">
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
            <CheckCircle size={18} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
                <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{title}</p>
                <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{date}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">{date}, {time}</p>
        </div>
    </div>
);
