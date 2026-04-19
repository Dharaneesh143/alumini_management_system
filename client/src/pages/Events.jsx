import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import api, { API_ENDPOINTS, getFileUrl } from '../config/api';
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
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: '', mode: '', search: '' });

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
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-100 mb-8 pt-10 px-4">
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
                                        src={getFileUrl(event.imageUrl) || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=800&auto=format&fit=crop'}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=800&auto=format&fit=crop';
                                            e.target.onerror = null;
                                        }}
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
                                                type="button"
                                                onClick={() => navigate(`/events/${event._id}`)}
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
        </div>
    );
};

export default Events;
