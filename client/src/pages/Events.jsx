import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import api, { API_ENDPOINTS } from '../config/api';
import {
    Calendar as CalendarIcon,
    MapPin,
    Video,
    Users,
    Clock,
    Search,
    Filter,
    ChevronRight,
    Star,
    CheckCircle,
    Timer,
    ExternalLink,
    Image as ImageIcon
} from 'lucide-react';

const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft.days && !timeLeft.hours && !timeLeft.minutes && !timeLeft.seconds) {
        return <span className="text-green-500 font-bold">Live Now!</span>;
    }

    return (
        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Clock size={12} />
            <span>Starts in: {timeLeft.days > 0 && `${timeLeft.days}d `}{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
        </div>
    );
};

const Events = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: '', mode: '', search: '' });
    const [selectedEvent, setSelectedEvent] = useState(null);

    const categories = ['Hackathon', 'Company', 'College Event', 'Other'];

    useEffect(() => {
        fetchEvents();
    }, [filters]);

    const fetchEvents = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.mode) params.append('mode', filters.mode);
            if (filters.search) params.append('search', filters.search);

            const res = await api.get(`${API_ENDPOINTS.EVENTS}?${params.toString()}`);
            setEvents(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching events:', err);
            setLoading(false);
        }
    };

    const handleRegister = async (eventId) => {
        try {
            await api.post(API_ENDPOINTS.REGISTER_EVENT(eventId));
            alert('Successfully registered!');
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.msg || 'Registration failed');
        }
    };

    const isUpcoming = (event) => {
        return new Date(event.date) > new Date();
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-100 mb-8 pt-10 pb-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Alumni <span className="text-primary italic">Events</span> & Connect
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Join exclusive webinars, seminars, and networking sessions hosted by our distinguished alumni.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">


                {/* Event Cards */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="mt-4 text-gray-500 font-medium">Loading amazing events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
                        <CalendarIcon size={64} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No events found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {events.map(event => (
                            <div key={event._id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col">
                                {/* Image / Poster Area */}
                                <div className="h-56 relative overflow-hidden">
                                    <img
                                        src={event.imageUrl || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=800&auto=format&fit=crop'}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-lg ${event.mode === 'Online' ? 'bg-blue-500/80' : 'bg-orange-500/80'}`}>
                                            {event.mode}
                                        </span>
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                                            {event.type}
                                        </span>
                                    </div>

                                    {isUpcoming(event) && (
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <CountdownTimer targetDate={event.date} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                                            <p className="text-secondary font-medium text-sm flex items-center gap-1 mt-1">
                                                By <span className="text-gray-900 font-bold">{event.organizer || event.speaker?.name}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-secondary text-sm">
                                            <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-primary/5 transition-colors">
                                                <CalendarIcon size={16} className="text-primary" />
                                            </div>
                                            <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-secondary text-sm">
                                            <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-primary/5 transition-colors">
                                                <Clock size={16} className="text-primary" />
                                            </div>
                                            <span>{event.time} ({event.duration || '60 mins'})</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-secondary text-sm">
                                            <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-primary/5 transition-colors">
                                                {event.mode === 'Online' ? <Video size={16} className="text-primary" /> : <MapPin size={16} className="text-primary" />}
                                            </div>
                                            <span className="truncate">{event.mode === 'Online' ? 'Zoom/Meet Session' : event.venue}</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none mb-1">Registered</span>
                                            <span className="text-sm font-black text-gray-900">{event.registeredParticipants?.length || 0} <span className="text-gray-400 font-medium">/ {event.maxParticipants}</span></span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedEvent(event)}
                                                className="p-3 bg-gray-50 text-gray-600 hover:bg-primary hover:text-white rounded-2xl transition-all"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                            {((user?.role === 'student' && event.type === 'Company') || 
                                             (user?.role === 'alumni' && ['Company', 'Hackathon', 'College Event'].includes(event.type))) ? (
                                                <button
                                                    onClick={() => handleRegister(event._id)}
                                                    disabled={event.registeredParticipants?.some(p => (p.user?._id || p.user) === user?.id)}
                                                    className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${event.registeredParticipants?.some(p => (p.user?._id || p.user) === user?.id)
                                                        ? 'bg-green-50 text-green-600 shadow-none cursor-default'
                                                        : 'bg-primary text-white shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95'
                                                        }`}
                                                >
                                                    {event.registeredParticipants?.some(p => (p.user?._id || p.user) === user?.id) ? 'Registered' : 'Register Now'}
                                                </button>
                                            ) : (
                                                <span className="px-4 py-2 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase rounded-xl">View Only</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detailed Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in slide-in-from-bottom-12 duration-700">
                        {/* Left Side: Visual/Quick Info */}
                        <div className="md:w-[40%] bg-gray-900 relative">
                            <img
                                src={selectedEvent.imageUrl || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=800&auto=format&fit=crop'}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent p-12 flex flex-col justify-end">
                                <div className="mb-6">
                                    <span className="px-4 py-2 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-2xl text-xs font-bold text-primary-light tracking-widest uppercase">
                                        {selectedEvent.category}
                                    </span>
                                </div>
                                <h2 className="text-4xl font-black text-white mb-6 leading-tight">{selectedEvent.title}</h2>

                                <div className="space-y-6">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                                            <CalendarIcon size={20} className="text-primary-light" />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Date & Time</p>
                                            <p className="text-white font-medium">{new Date(selectedEvent.date).toLocaleDateString()} • {selectedEvent.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                                            {selectedEvent.mode === 'Online' ? <Video size={20} className="text-primary-light" /> : <MapPin size={20} className="text-primary-light" />}
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Location</p>
                                            <p className="text-white font-medium">{selectedEvent.mode === 'Online' ? 'Video Webcast' : selectedEvent.venue}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Detailed Info */}
                        <div className="md:w-[60%] p-12 overflow-y-auto flex flex-col bg-white">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Users className="text-primary" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Presenter</p>
                                        <p className="text-sm font-bold text-gray-900">{selectedEvent.speaker?.name || selectedEvent.organizer}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
                                >
                                    <Clock size={24} className="rotate-45" />
                                </button>
                            </div>

                            <div className="mb-10 flex-1">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Event Overview</h3>
                                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                                    {selectedEvent.description}
                                </p>
                            </div>

                            {/* Meeting Link only if registered and online */}
                            {selectedEvent.mode === 'Online' && selectedEvent.meetingLink && (
                                <div className="mb-10 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                            <Video size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-blue-900">Virtual Access</h4>
                                            <p className="text-xs text-blue-700">Link active joining the session.</p>
                                        </div>
                                    </div>
                                    <a
                                        href={selectedEvent.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                                    >
                                        Join Now <ExternalLink size={14} />
                                    </a>
                                </div>
                            )}

                            <div className="flex gap-4">
                                    {((user?.role === 'student' && selectedEvent.type === 'Company') || 
                                      (user?.role === 'alumni' && ['Company', 'Hackathon', 'College Event'].includes(selectedEvent.type))) ? (
                                        <button
                                            onClick={() => handleRegister(selectedEvent._id)}
                                            disabled={selectedEvent.registeredParticipants?.some(p => (p.user?._id || p.user) === user?.id)}
                                            className={`flex-1 py-5 rounded-3xl font-black text-lg transition-all shadow-xl ${selectedEvent.registeredParticipants?.some(p => (p.user?._id || p.user) === user?.id)
                                                ? 'bg-green-50 text-green-600 shadow-none'
                                                : 'bg-primary text-white shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1'
                                                }`}
                                        >
                                            {selectedEvent.registeredParticipants?.some(p => (p.user?._id || p.user) === user?.id)
                                                ? 'You are Registered'
                                                : 'Confirm My Spot'
                                            }
                                        </button>
                                    ) : (
                                        <div className="flex-1 py-5 rounded-3xl bg-gray-50 text-gray-400 font-bold text-center">
                                            {user?.role === 'student' ? 'Placement/Company Drive Only (View Only)' : 'Informational Event (View Only)'}
                                        </div>
                                    )}
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="px-10 py-5 bg-gray-50 text-gray-500 font-bold rounded-3xl hover:bg-gray-100 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;
