import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import api, { API_ENDPOINTS, getFileUrl } from '../config/api';
import {
    Calendar,
    Clock,
    MapPin,
    Video,
    Users,
    ExternalLink,
    ArrowLeft,
    CheckCircle,
    Share2,
    Bell,
    Copy,
    Mail,
    Download,
    Trash2,
    Edit,
    AlertCircle,
    Wifi,
    Timer,
    Tag,
    User,
    Phone,
    ChevronRight,
    Zap,
    Globe
} from 'lucide-react';

// ─── Countdown Hook ───────────────────────────────────────────────────────────
function useCountdown(targetDate) {
    const getTimeLeft = () => {
        const diff = new Date(targetDate) - new Date();
        if (diff <= 0) return null;
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
        };
    };
    const [timeLeft, setTimeLeft] = useState(getTimeLeft);
    useEffect(() => {
        const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
        return () => clearInterval(id);
    }, [targetDate]);
    return timeLeft;
}

// ─── Timer Status ─────────────────────────────────────────────────────────────
function getEventStatus(event) {
    const now = new Date();
    const start = event.startDate ? new Date(`${event.startDate.split('T')[0]}T${event.startTime || '00:00'}`) : new Date(`${event.date?.split('T')[0]}T${event.time || '00:00'}`);
    const end = event.endDate ? new Date(`${event.endDate.split('T')[0]}T${event.endTime || '23:59'}`) : new Date(start.getTime() + (parseInt(event.duration) || 60) * 60 * 1000);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'live';
    return 'ended';
}

// ─── Pad helper ───────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');

// ─── Share Modal ──────────────────────────────────────────────────────────────
const ShareModal = ({ event, onClose }) => {
    const url = window.location.href;
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () =>
        window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this event: ${event.title} - ${url}`)}`);

    const shareEmail = () =>
        window.open(`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(`Join me at: ${url}`)}`);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200] p-4" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-8 duration-500" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Share Event</h3>
                <p className="text-sm text-gray-400 mb-8">Spread the word about this event</p>

                <div className="flex gap-4 mb-8">
                    <button onClick={shareWhatsApp} className="flex-1 py-4 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition flex items-center justify-center gap-2">
                        <Globe size={20} /> WhatsApp
                    </button>
                    <button onClick={shareEmail} className="flex-1 py-4 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 transition flex items-center justify-center gap-2">
                        <Mail size={20} /> Email
                    </button>
                </div>

                <div className="flex gap-3 items-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="flex-1 text-sm text-gray-500 truncate font-mono">{url}</p>
                    <button onClick={copy} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        {copied ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                    </button>
                </div>

                <button onClick={onClose} className="mt-6 w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition">Close</button>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const EventDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [reminderSet, setReminderSet] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [fullScreenImage, setFullScreenImage] = useState(null);

    useEffect(() => { fetchEventDetails(); }, [id]);

    const fetchEventDetails = async () => {
        try {
            const res = await api.get(`${API_ENDPOINTS.EVENTS}/${id}`);
            setEvent(res.data);
        } catch (err) {
            console.error('Error fetching event:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!user) { navigate('/login'); return; }
        setRegistering(true);
        try {
            await api.post(API_ENDPOINTS.REGISTER_EVENT(id));
            await fetchEventDetails();
        } catch (err) {
            alert(err.response?.data?.msg || 'Registration failed');
        } finally {
            setRegistering(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this event permanently?')) return;
        try {
            await api.delete(`${API_ENDPOINTS.EVENTS}/${id}`);
            navigate(-1);
        } catch (err) {
            alert('Could not delete event');
        }
    };

    // ── Countdown ──────────────────────────────────────────────────────────────
    const startDateStr = event ? (event.startDate ? `${event.startDate.split('T')[0]}T${event.startTime || '00:00'}` : `${event.date?.split('T')[0]}T${event.time || '00:00'}`) : null;
    const countdown = useCountdown(startDateStr);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium">Loading event details...</p>
            </div>
        </div>
    );

    if (!event) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={40} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Event Not Found</h2>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition">
                <ArrowLeft size={20} /> Go Back
            </button>
        </div>
    );

    const status = getEventStatus(event);
    const isRegistered = event.registeredParticipants?.some(p => (p.user?._id || p.user) === user?.id);
    const isFull = (event.registeredParticipants?.length || 0) >= (event.maxParticipants || 100);
    const seatsLeft = (event.maxParticipants || 100) - (event.registeredParticipants?.length || 0);
    const isAdmin = user?.role === 'admin';
    const canRegister = !isRegistered && !isFull && status !== 'ended';

    const startDate = event.startDate ? new Date(`${event.startDate.split('T')[0]}T${event.startTime || '00:00'}`) : new Date(`${event.date?.split('T')[0]}T${event.time || '00:00'}`);
    const endDate = event.endDate ? new Date(`${event.endDate.split('T')[0]}T${event.endTime || '23:59'}`) : new Date(startDate.getTime() + (parseInt(event.duration) || 60) * 60 * 1000);

    const statusConfig = {
        upcoming: { label: 'Event Starts In', bg: 'from-violet-500 to-purple-600', dot: 'bg-violet-400' },
        live: { label: '🔴 Live Now', bg: 'from-red-500 to-rose-600', dot: 'bg-red-400 animate-pulse' },
        ended: { label: 'Event Ended', bg: 'from-gray-400 to-gray-500', dot: 'bg-gray-300' },
    }[status];

    const tabs = ['overview', 'details', ...(isAdmin ? ['participants'] : [])];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-24">

            {/* ── Hero Banner ─────────────────────────────────────────────────── */}
            <div className="relative h-80 md:h-96 overflow-hidden">
                <img
                    src={getFileUrl(event.imageUrl) || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=1200&auto=format&fit=crop'}
                    alt={event.title}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                    onClick={() => setFullScreenImage(getFileUrl(event.imageUrl) || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=1200&auto=format&fit=crop')}
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=1200&auto=format&fit=crop';
                        e.target.onerror = null;
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 hover:bg-white/25 transition"
                >
                    <ArrowLeft size={18} /> Back
                </button>

                {/* Action buttons */}
                <div className="absolute top-6 right-6 flex gap-3">
                    <button onClick={() => setShowShare(true)} className="p-3 bg-white/15 backdrop-blur-md text-white rounded-2xl border border-white/20 hover:bg-white/25 transition" title="Share">
                        <Share2 size={20} />
                    </button>
                    {!isAdmin && status === 'upcoming' && (
                        <button
                            onClick={() => setReminderSet(r => !r)}
                            className={`p-3 backdrop-blur-md text-white rounded-2xl border transition ${reminderSet ? 'bg-yellow-500/80 border-yellow-400' : 'bg-white/15 border-white/20 hover:bg-white/25'}`}
                            title="Set Reminder"
                        >
                            <Bell size={20} />
                        </button>
                    )}
                    {isAdmin && (
                        <>
                            <button onClick={() => navigate(`/admin/events/edit/${id}`)} className="p-3 bg-white/15 backdrop-blur-md text-white rounded-2xl border border-white/20 hover:bg-white/25 transition" title="Edit">
                                <Edit size={20} />
                            </button>
                            <button onClick={handleDelete} className="p-3 bg-red-500/70 backdrop-blur-md text-white rounded-2xl border border-red-400/50 hover:bg-red-600/80 transition" title="Delete">
                                <Trash2 size={20} />
                            </button>
                        </>
                    )}
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-primary/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
                            {event.category || event.type}
                        </span>
                        <span className={`px-3 py-1 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 ${status === 'live' ? 'bg-red-500/80' : status === 'upcoming' ? 'bg-violet-500/80' : 'bg-gray-500/70'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                            {status === 'live' ? 'Live' : status === 'ended' ? 'Ended' : 'Upcoming'}
                        </span>
                        <span className={`px-3 py-1 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 ${event.mode === 'Online' ? 'bg-blue-500/80' : 'bg-emerald-500/80'}`}>
                            {event.mode === 'Online' ? <Wifi size={12} /> : <MapPin size={12} />}
                            {event.mode}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">{event.title}</h1>
                    <p className="text-white/70 mt-2 font-medium">Organized by {event.organizer || event.speaker?.name || 'University'}</p>
                </div>
            </div>

            {/* ── Countdown Timer ──────────────────────────────────────────────── */}
            <div className={`bg-gradient-to-r ${statusConfig.bg} text-white`}>
                <div className="max-w-6xl mx-auto px-6 py-6">
                    {status === 'upcoming' && countdown ? (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">Event Starts In</p>
                                <div className="flex items-center gap-4">
                                    {[['Days', countdown.days], ['Hours', countdown.hours], ['Mins', countdown.minutes], ['Secs', countdown.seconds]].map(([label, val]) => (
                                        <div key={label} className="text-center">
                                            <div className="text-3xl md:text-4xl font-black tabular-nums w-16 md:w-20 h-14 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                                {pad(val)}
                                            </div>
                                            <div className="text-[9px] font-bold uppercase tracking-widest text-white/60 mt-1">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Timer size={20} className="text-white/70" />
                                <div>
                                    <p className="text-xs text-white/60 font-bold uppercase tracking-widest">Event Date</p>
                                    <p className="font-black">{startDate.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    <p className="text-sm text-white/70">{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        </div>
                    ) : status === 'live' ? (
                        <div className="flex items-center justify-center gap-4 py-2">
                            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
                            <p className="text-xl font-black tracking-wide">🎉 This Event is Live Right Now!</p>
                            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-3 py-2">
                            <AlertCircle size={20} className="text-white/70" />
                            <p className="font-bold text-white/90">This event has ended. Thank you to all who participated!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Content ─────────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 mt-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ── Left Column ─────────────────────────────────────────── */}
                    <div className="flex-1 min-w-0">

                        {/* Tabs */}
                        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-8 w-fit">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition ${activeTab === tab ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* ── OVERVIEW TAB ──────────────────────────────────────── */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                {/* Description */}
                                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                                    <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                        <Tag size={14} /> About This Event
                                    </h2>
                                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">{event.description}</p>
                                </div>

                                {/* Date & Time */}
                                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                                    <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                                        <Clock size={14} /> Date & Time
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex gap-4 items-center p-4 bg-violet-50 rounded-2xl">
                                            <div className="w-12 h-12 bg-violet-500 rounded-2xl flex items-center justify-center">
                                                <Calendar size={22} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start</p>
                                                <p className="font-black text-gray-900">{startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                                <p className="text-sm text-gray-500">{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center p-4 bg-rose-50 rounded-2xl">
                                            <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center">
                                                <Clock size={22} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">End</p>
                                                <p className="font-black text-gray-900">{endDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                                <p className="text-sm text-gray-500">{endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm text-gray-400 flex items-center gap-2">
                                        <Timer size={14} /> Duration: {event.duration || '60 mins'}
                                    </p>
                                </div>

                                {/* Location / Meeting */}
                                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                                    <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                                        {event.mode === 'Online' ? <Video size={14} /> : <MapPin size={14} />}
                                        {event.mode === 'Online' ? 'Online Session' : 'Venue'}
                                    </h2>
                                    {event.mode === 'Online' ? (
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/30">
                                                <Video size={28} className="text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-blue-900 text-lg">Online Virtual Session</p>
                                                <p className="text-blue-600 text-sm font-medium">Join from anywhere in the world</p>
                                                {event.meetingLink && (
                                                    <p className="text-xs font-mono text-blue-400 mt-1 truncate">{event.meetingLink}</p>
                                                )}
                                            </div>
                                            {event.meetingLink && (
                                                <a href={event.meetingLink} target="_blank" rel="noopener noreferrer"
                                                    className="px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 flex items-center gap-2 flex-shrink-0">
                                                    Join Now <ExternalLink size={16} />
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            <div className="flex gap-4 items-start">
                                                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-600/30">
                                                    <MapPin size={28} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-emerald-900 text-lg">{event.venue || 'Venue TBA'}</p>
                                                    <p className="text-emerald-600 text-sm font-medium mt-1">Physical / On-campus Event</p>
                                                    {event.venue && (
                                                        <a href={`https://maps.google.com/?q=${encodeURIComponent(event.venue)}`} target="_blank" rel="noopener noreferrer"
                                                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition">
                                                            <Globe size={14} /> View on Google Maps <ChevronRight size={14} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── DETAILS TAB ───────────────────────────────────────── */}
                        {activeTab === 'details' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                {/* Speaker / Organizer */}
                                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                                    <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                                        <User size={14} /> Organizer & Speaker
                                    </h2>
                                    <div className="flex gap-6 items-center p-6 bg-gray-50 rounded-2xl">
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
                                            {(event.organizer || event.speaker?.name || 'U')[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-xl">{event.speaker?.name || event.organizer || 'University Administration'}</p>
                                            <p className="text-gray-500 text-sm">{event.speaker?.designation || 'Event Organizer'}</p>
                                            {event.speaker?.linkedIn && (
                                                <a href={event.speaker.linkedIn} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold mt-1 hover:underline flex items-center gap-1">
                                                    LinkedIn Profile <ExternalLink size={12} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Agenda */}
                                {event.agenda && (
                                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                                        <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                            <Zap size={14} /> Agenda
                                        </h2>
                                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{event.agenda}</p>
                                    </div>
                                )}

                                {/* Requirements & Benefits */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {event.requirements && (
                                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                                            <h2 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">Requirements</h2>
                                            <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{event.requirements}</p>
                                        </div>
                                    )}
                                    {event.benefits && (
                                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                                            <h2 className="text-xs font-black uppercase tracking-widest text-green-600 mb-4">Benefits</h2>
                                            <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{event.benefits}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Contact */}
                                {event.contactEmail && (
                                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                                        <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                            <Phone size={14} /> Contact
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <Mail size={18} className="text-gray-400" />
                                            <a href={`mailto:${event.contactEmail}`} className="text-primary font-bold hover:underline">{event.contactEmail}</a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── PARTICIPANTS TAB (Admin only) ─────────────────────── */}
                        {activeTab === 'participants' && isAdmin && (
                            <div className="animate-in fade-in duration-300">
                                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900">Registered Participants</h2>
                                            <p className="text-sm text-gray-400 mt-1">{event.registeredParticipants?.length || 0} people registered</p>
                                        </div>
                                        <button className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:opacity-90 transition text-sm">
                                            <Download size={16} /> Export CSV
                                        </button>
                                    </div>
                                    {event.registeredParticipants?.length > 0 ? (
                                        <div className="divide-y divide-gray-50">
                                            {event.registeredParticipants.map((p, i) => (
                                                <div key={i} className="flex items-center gap-4 px-8 py-4 hover:bg-gray-50/60 transition">
                                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/80 to-purple-600 text-white font-black flex items-center justify-center">
                                                        {(p.user?.name || p.name || `U${i + 1}`)[0]}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900">{p.user?.name || p.name || `Participant ${i + 1}`}</p>
                                                        <p className="text-xs text-gray-400">{p.user?.email || p.email || ''}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-300 font-mono">#{i + 1}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                                            <Users size={48} className="mb-3" />
                                            <p className="font-bold">No participants yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right Sidebar ────────────────────────────────────────── */}
                    <div className="lg:w-80 space-y-6">

                        {/* Seats Card */}
                        <div className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2"><Users size={14} /> Participation</h3>
                            <div className="flex justify-between items-end mb-3">
                                <div>
                                    <p className="text-4xl font-black text-gray-900 tabular-nums">{event.registeredParticipants?.length || 0}</p>
                                    <p className="text-xs text-gray-400 font-bold">Registered</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-gray-300 tabular-nums">{event.maxParticipants || 100}</p>
                                    <p className="text-xs text-gray-400 font-bold">Total Seats</p>
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : seatsLeft < 10 ? 'bg-orange-400' : 'bg-primary'}`}
                                    style={{ width: `${Math.min(100, ((event.registeredParticipants?.length || 0) / (event.maxParticipants || 100)) * 100)}%` }}
                                ></div>
                            </div>
                            <p className={`text-xs font-bold mt-2 ${isFull ? 'text-red-500' : seatsLeft < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                                {isFull ? '⚠ Event Full' : `${seatsLeft} seats available`}
                            </p>
                        </div>

                        {/* Registration Card */}
                        <div className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-5">Registration</h3>

                            {!user ? (
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-4">You need to login to register for this event.</p>
                                    <button onClick={() => navigate('/login')} className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition shadow-lg shadow-primary/25">
                                        Login to Register
                                    </button>
                                </div>
                            ) : isRegistered ? (
                                <div className="flex flex-col items-center gap-3 py-2">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle size={30} className="text-green-500" />
                                    </div>
                                    <p className="font-black text-green-700 text-lg">You're Registered!</p>
                                    <p className="text-xs text-gray-400 text-center">We'll send you a reminder before the event starts.</p>
                                </div>
                            ) : isFull ? (
                                <div className="flex flex-col items-center gap-3 py-2">
                                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertCircle size={30} className="text-red-500" />
                                    </div>
                                    <p className="font-black text-red-600 text-lg">Event Full</p>
                                    <p className="text-xs text-gray-400 text-center">No more seats are available for this event.</p>
                                </div>
                            ) : status === 'ended' ? (
                                <div className="flex flex-col items-center gap-3 py-2">
                                    <p className="font-bold text-gray-400">Registration Closed</p>
                                    <p className="text-xs text-gray-300 text-center">This event has already ended.</p>
                                </div>
                            ) : isAdmin ? (
                                <div className="flex flex-col items-center gap-3 py-2">
                                    <p className="font-bold text-gray-400 text-sm text-center">Admin view — registration not applicable.</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRegister}
                                    disabled={registering}
                                    className="w-full py-5 bg-gradient-to-r from-primary to-purple-600 text-white font-black rounded-2xl hover:opacity-90 active:scale-[0.98] transition shadow-2xl shadow-primary/30 text-lg flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {registering ? (
                                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Registering...</>
                                    ) : (
                                        <>Confirm Participation <ChevronRight size={20} /></>
                                    )}
                                </button>
                            )}

                            {/* External Registration Link */}
                            {event.registration_link && (
                                <div className="mt-6 pt-6 border-t border-gray-50">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">External Portal</p>
                                    <a 
                                        href={event.registration_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full py-4 bg-white border-2 border-primary text-primary font-black rounded-2xl hover:bg-primary hover:text-white transition flex items-center justify-center gap-2 group"
                                    >
                                        Register on External Site <ExternalLink size={18} className="group-hover:scale-110 transition-transform" />
                                    </a>
                                </div>
                            )}

                            {reminderSet && status === 'upcoming' && (
                                <div className="mt-4 flex items-center gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                                    <Bell size={14} className="text-yellow-600" />
                                    <p className="text-xs font-bold text-yellow-700">Reminder set for 1 hour before</p>
                                </div>
                            )}
                        </div>

                        {/* Quick Info */}
                        <div className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><Tag size={14} /> Quick Info</h3>
                            {[
                                { label: 'Category', value: event.category || event.type, icon: Tag },
                                { label: 'Mode', value: event.mode, icon: event.mode === 'Online' ? Wifi : MapPin },
                                { label: 'Duration', value: event.duration || '60 mins', icon: Clock },
                                { label: 'Organizer', value: event.organizer || 'University', icon: User },
                            ].map(({ label, value, icon: Icon }) => (
                                <div key={label} className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center">
                                            <Icon size={14} className="text-gray-400" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 text-right">{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Share Button */}
                        <button onClick={() => setShowShare(true)} className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-xl shadow-gray-900/20">
                            <Share2 size={18} /> Share This Event
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Share Modal ──────────────────────────────────────────────────── */}
            {showShare && <ShareModal event={event} onClose={() => setShowShare(false)} />}

            {/* ── Full-Screen Image Viewer ──────────────────────────────────────── */}
            {fullScreenImage && (
                <div
                    className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setFullScreenImage(null)}
                >
                    <button
                        onClick={() => setFullScreenImage(null)}
                        className="absolute top-6 right-6 z-[10000] bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/20"
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={fullScreenImage}
                        alt="Full screen view"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Event Poster
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetailView;
