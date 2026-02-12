import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import api, { API_ENDPOINTS } from '../config/api';
import {
    Calendar as CalendarIcon,
    Plus,
    Search,
    Filter,
    MapPin,
    Video,
    Users,
    Clock,
    ChevronRight,
    Edit,
    Trash2,
    Upload,
    FileText,
    Star,
    CheckCircle,
    BarChart2,
    X
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const Events = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [filters, setFilters] = useState({ type: '', status: '', search: '' });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isAlumniRequest, setIsAlumniRequest] = useState(false); // New State

    // Add requests state for alumni
    const [alumniRequests, setAlumniRequests] = useState([]);
    const [showScheduleModal, setShowScheduleModal] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Webinar',
        date: '',
        time: '',
        venue: '',
        speakerName: '',
        alumniId: '', // For selecting specific alumni
        department: '',
        maxParticipants: 100
    });

    useEffect(() => {
        fetchEvents();
        if (user?.role === 'admin') {
            fetchStats();
        }
        if (user?.role === 'alumni') {
            fetchAlumniRequests();
        }
    }, [filters, user]);

    const fetchAlumniRequests = async () => {
        try {
            const res = await api.get('/api/events/alumni/requests');
            setAlumniRequests(res.data);
        } catch (err) {
            console.error('Error fetching alumni requests:', err);
        }
    };

    const fetchEvents = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.status) params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);

            const res = await api.get(`${API_ENDPOINTS.EVENTS}?${params.toString()}`);
            setEvents(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching events:', err);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.EVENT_STATS);
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            // Find alumni ID if needed (For now, assumes speakerName matches an existing alumni name or ID if we implement search)
            // In a real scenario, we would use a search dropdown to get the _id.
            // For MVP, if Admin checks "Ask Alumni", we might need to input the Email or search results.

            // NOTE: Since we don't have an Alumni Search UI here yet, we'll assume speakerName is text, and for "Ask Alumni",
            // we really need the Alumni ID. 
            // Workaround: We will fetch all alumni and filter by name to get ID (simple approach) or 
            // just ask admin to enter ID if we want to be strict.
            // BETTER: Use the existing "Find Mentor" API to simple search.

            let alumniId = null;
            if (isAlumniRequest) {
                // Simple lookup logic or require ID. 
                // For now, let's look for a user with the name.
                const usersRes = await api.get(`/api/users?search=${formData.speakerName}&role=alumni`);
                const found = usersRes.data.find(u => u.name.toLowerCase() === formData.speakerName.toLowerCase());
                if (found) alumniId = found._id;
                else {
                    alert('Alumni not found with that exact name. Please enter exact name.');
                    return;
                }
            }

            const eventData = {
                ...formData,
                speaker: {
                    name: formData.speakerName,
                    alumniId: alumniId
                },
                // If requesting, date/time can be empty
                date: isAlumniRequest ? null : formData.date,
                time: isAlumniRequest ? null : formData.time,
                venue: isAlumniRequest ? null : formData.venue,
            };

            await api.post(API_ENDPOINTS.EVENTS, eventData);
            setShowAddForm(false);
            setFormData({
                title: '', description: '', type: 'Webinar', date: '', time: '', venue: '', speakerName: '', department: '', maxParticipants: 100
            });
            setIsAlumniRequest(false);
            fetchEvents();
            if (user?.role === 'admin') fetchStats();
        } catch (err) {
            alert('Failed to create event: ' + (err.response?.data?.msg || err.message));
        }
    };

    const handleRegister = async (eventId) => {
        try {
            await api.post(API_ENDPOINTS.REGISTER_EVENT(eventId));
            alert('Registered successfully!');
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.msg || 'Registration failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await api.delete(`${API_ENDPOINTS.EVENTS}/${id}`);
            fetchEvents();
            if (user?.role === 'admin') fetchStats();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleScheduleEvent = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/events/${showScheduleModal._id}/schedule`, {
                date: formData.date,
                time: formData.time,
                venue: formData.venue,
                mode: formData.mode || 'Online'
            });
            setShowScheduleModal(null);
            fetchAlumniRequests();
            fetchEvents();
            setFormData({
                title: '', description: '', type: 'Webinar', date: '', time: '', venue: '', speakerName: '', department: '', maxParticipants: 100
            });
            alert('Event Scheduled Successfully!');
        } catch (err) {
            alert('Failed to schedule event');
        }
    };

    const isAdmin = user?.role === 'admin';
    const isAlumni = user?.role === 'alumni';

    return (
        <div className="events-page">
            {/* Alumni Requests Section */}
            {isAlumni && alumniRequests.length > 0 && (
                <div className="mb-10 bg-orange-50 border border-orange-100 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                        <CalendarIcon size={24} /> Pending Event Requests
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alumniRequests.map(request => (
                            <div key={request._id} className="bg-white p-5 rounded-xl shadow-sm border border-orange-100">
                                <h3 className="font-bold text-lg mb-2">{request.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{request.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Pending Schedule</span>
                                    <button
                                        onClick={() => {
                                            setFormData({ ...formData, mode: 'Online' }); // Default
                                            setShowScheduleModal(request);
                                        }}
                                        className="btn btn-sm bg-orange-500 hover:bg-orange-600 text-white border-none"
                                    >
                                        Schedule Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">Schedule Event</h2>
                            <button onClick={() => setShowScheduleModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 bg-gray-50 border-b border-gray-100">
                            <h3 className="font-bold text-lg">{showScheduleModal.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{showScheduleModal.description}</p>
                        </div>
                        <form onSubmit={handleScheduleEvent} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Mode</label>
                                    <select
                                        className="form-input w-full"
                                        value={formData.mode || 'Online'}
                                        onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                                    >
                                        <option value="Online">Online</option>
                                        <option value="Offline">Offline</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="form-input w-full"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Time</label>
                                    <input
                                        required
                                        type="time"
                                        className="form-input w-full"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Venue / Link</label>
                                    <input
                                        required
                                        className="form-input w-full"
                                        placeholder={formData.mode === 'Online' ? "Zoom/Meet Link" : "Room Number / Address"}
                                        value={formData.venue}
                                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mt-8 flex gap-4">
                                <button type="submit" className="btn btn-primary flex-1">Confirm Schedule</button>
                                <button type="button" onClick={() => setShowScheduleModal(null)} className="btn btn-outline flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">College Events & Presentations</h1>
                    <p className="text-secondary mt-2">Discover, participate and share knowledge</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} /> Create New Event
                    </button>
                )}
            </div>

            {/* STATS SECTION (ADMIN ONLY) */}
            {isAdmin && stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-blue-50 border-blue-100">
                        <p className="text-sm font-medium text-blue-600 mb-1">Total Events</p>
                        <h2 className="text-2xl font-bold">{stats.totalEvents}</h2>
                    </div>
                    <div className="card bg-orange-50 border-orange-100">
                        <p className="text-sm font-medium text-orange-600 mb-1">Upcoming</p>
                        <h2 className="text-2xl font-bold text-orange-600">{stats.upcomingEvents}</h2>
                    </div>
                    <div className="card bg-green-50 border-green-100">
                        <p className="text-sm font-medium text-green-600 mb-1">Completed</p>
                        <h2 className="text-2xl font-bold text-green-600">{stats.completedEvents}</h2>
                    </div>
                    <div className="card md:col-span-1 p-4">
                        <div className="h-20 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.analytics}>
                                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* SEARCH & FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search events, speakers, topics..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="border rounded-lg px-4 py-2 outline-none"
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                        <option value="">All Types</option>
                        <option value="Alumni Meet">Alumni Meet</option>
                        <option value="Webinar">Webinar</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Guest Lecture">Guest Lecture</option>
                    </select>
                    <select
                        className="border rounded-lg px-4 py-2 outline-none"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">Any Status</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* EVENT LISTING */}
            {loading ? (
                <div className="text-center py-20">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
                    <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-secondary">No events found matching your criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div key={event._id} className="card group hover:shadow-xl transition-all border-none shadow-sm bg-white overflow-hidden flex flex-col">
                            {/* Card Header with Status Badge */}
                            <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-100 p-6 flex flex-col justify-between relative">
                                <div className="flex justify-between items-start">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.status === 'Upcoming' ? 'bg-orange-400 text-white' :
                                        event.status === 'Ongoing' ? 'bg-green-400 text-white animate-pulse' :
                                            'bg-gray-400 text-white'
                                        }`}>
                                        {event.status}
                                    </span>
                                    {isAdmin && (
                                        <div className="flex gap-1">
                                            <button className="p-1.5 bg-white/20 rounded-md text-white hover:bg-white/40"><Edit size={14} /></button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(event._id); }}
                                                className="p-1.5 bg-white/20 rounded-md text-white hover:bg-red-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white/80 text-xs font-medium uppercase tracking-widest leading-none mb-2">{event.type}</p>
                                    <h3 className="text-white text-xl font-bold leading-tight line-clamp-2">{event.title}</h3>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-secondary text-sm">
                                        <CalendarIcon size={16} className="text-primary" />
                                        <span>
                                            {event.date
                                                ? `${new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at ${event.time}`
                                                : <span className="text-orange-600 font-bold italic">Date & Time TBD</span>
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-secondary text-sm">
                                        {event.venue?.includes('http') ? <Video size={16} className="text-primary" /> : <MapPin size={16} className="text-primary" />}
                                        <span className="truncate">
                                            {event.venue || <span className="text-orange-600 font-bold italic">Venue TBD</span>}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-secondary text-sm">
                                        <Users size={16} className="text-primary" />
                                        <span>{event.speaker?.name || 'Unknown Speaker'} • {event.department || 'General'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase text-gray-400 font-bold">Registration</span>
                                        <span className="text-sm font-bold text-gray-800">{event.registeredParticipants.length} / {event.maxParticipants}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedEvent(event)}
                                            className="px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                        >
                                            Details
                                        </button>
                                        {event.status !== 'Completed' && (
                                            <button
                                                onClick={() => handleRegister(event._id)}
                                                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                                disabled={event.registeredParticipants.some(p => p.user === user?.id)}
                                            >
                                                {event.registeredParticipants.some(p => p.user === user?.id) ? 'Registered' : 'Join Now'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD EVENT MODAL */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-2xl font-bold">Create New Event</h2>
                            <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateEvent} className="p-8 overflow-y-auto max-h-[calc(90vh-160px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 flex items-center gap-2 mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <input
                                        type="checkbox"
                                        id="alumniRequest"
                                        className="w-5 h-5 text-primary rounded"
                                        checked={isAlumniRequest}
                                        onChange={(e) => setIsAlumniRequest(e.target.checked)}
                                    />
                                    <label htmlFor="alumniRequest" className="font-bold text-blue-800 cursor-pointer select-none">
                                        Ask Alumni to Schedule (Book Free Slot)
                                    </label>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold mb-2">Event Title</label>
                                    <input
                                        required
                                        className="form-input w-full"
                                        placeholder="e.g. Annual Alumni Meet 2026"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold mb-2">Description</label>
                                    <textarea
                                        required
                                        className="form-input w-full h-24"
                                        placeholder="What is this event about?"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                {!isAlumniRequest && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Event Type</label>
                                            <select
                                                className="form-input w-full"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option value="Alumni Meet">Alumni Meet</option>
                                                <option value="Webinar">Webinar</option>
                                                <option value="Workshop">Workshop</option>
                                                <option value="Guest Lecture">Guest Lecture</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Department</label>
                                            <input
                                                required
                                                className="form-input w-full"
                                                placeholder="e.g. Computer Science"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Date</label>
                                            <input
                                                required
                                                type="date"
                                                className="form-input w-full"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Time</label>
                                            <input
                                                required
                                                type="time"
                                                className="form-input w-full"
                                                value={formData.time}
                                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Venue / Link</label>
                                            <input
                                                required
                                                className="form-input w-full"
                                                placeholder="Room 101 or Zoom Link"
                                                value={formData.venue}
                                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}

                                {isAlumniRequest && (
                                    <div className="md:col-span-2">
                                        <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg mb-4">
                                            The Alumni will be notified to choose a Date, Time, and Venue/Link for this event.
                                        </div>
                                        <label className="block text-sm font-bold mb-2">Department</label>
                                        <input
                                            required
                                            className="form-input w-full"
                                            placeholder="e.g. Computer Science"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold mb-2">Max Participants</label>
                                    <input
                                        type="number"
                                        className="form-input w-full"
                                        value={formData.maxParticipants}
                                        onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold mb-2">Speaker Name {isAlumniRequest && '(Exact Alumni Name Required)'}</label>
                                    <input
                                        required
                                        className="form-input w-full"
                                        placeholder={isAlumniRequest ? "Enter exact Alumni name to send request" : "Who will be speaking?"}
                                        value={formData.speakerName}
                                        onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mt-10 flex gap-4">
                                <button type="submit" className="btn btn-primary flex-1 py-4 text-lg shadow-xl shadow-primary/20">
                                    {isAlumniRequest ? 'Send Request to Alumni' : 'Create Event'}
                                </button>
                                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-outline flex-1 py-4 text-lg">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EVENT DETAIL VIEW / REGISTRATION MODAL */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in slide-in-from-bottom-10 duration-500">
                        {/* Left Info Panel */}
                        <div className="md:w-2/5 bg-gray-950 p-10 text-white flex flex-col">
                            <div className="mb-8">
                                <span className="px-3 py-1 bg-primary rounded-full text-[10px] font-bold uppercase tracking-widest">{selectedEvent.type}</span>
                            </div>
                            <h2 className="text-3xl font-bold mb-6 leading-tight">{selectedEvent.title}</h2>
                            <div className="space-y-6 mt-4">
                                <div className="p-3 bg-white/10 rounded-2xl"><CalendarIcon size={20} /></div>
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase">When</p>
                                    <p className="font-medium">
                                        {selectedEvent.date
                                            ? `${new Date(selectedEvent.date).toLocaleDateString()} • ${selectedEvent.time}`
                                            : <span className="text-orange-400">To Be Scheduled</span>
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-white/10 rounded-2xl"><MapPin size={20} /></div>
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase">Where</p>
                                    <p className="font-medium">
                                        {selectedEvent.venue || <span className="text-orange-400">To Be Scheduled</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-white/10 rounded-2xl"><Users size={20} /></div>
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase">Speaker</p>
                                    <p className="font-medium text-lg text-primary-light">{selectedEvent.speaker.name}</p>
                                    <p className="text-gray-400 text-xs">{selectedEvent.department} Department</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto pt-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase">Availability</span>
                                <span className="text-xs font-bold text-primary">{selectedEvent.registeredParticipants.length} / {selectedEvent.maxParticipants}</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-primary h-full transition-all duration-1000"
                                    style={{ width: `${(selectedEvent.registeredParticipants.length / selectedEvent.maxParticipants) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Right scrollable content */}
                    <div className="md:w-3/5 p-10 overflow-y-auto flex flex-col bg-white">
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-10">
                            <h4 className="text-xs uppercase font-extrabold tracking-widest text-primary mb-4">About the Event</h4>
                            <p className="text-secondary leading-relaxed text-lg">{selectedEvent.description}</p>
                        </div>

                        {/* Presentation Files Section */}
                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-xs uppercase font-extrabold tracking-widest text-primary">Presentations</h4>
                                {(isAdmin || (isAlumni && selectedEvent.speaker.alumniId === user.id)) && (
                                    <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                                        <Upload size={14} /> Upload New
                                    </button>
                                )}
                            </div>
                            {selectedEvent.presentations.length === 0 ? (
                                <div className="p-6 border-2 border-dashed rounded-3xl text-center text-gray-400">
                                    <FileText size={24} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No materials shared yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedEvent.presentations.map((file, idx) => (
                                        <a
                                            key={idx}
                                            href={file.fileUrl}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/30 transition-all"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{file.fileName}</p>
                                                    <p className="text-[10px] text-gray-400">Shared on {new Date(file.uploadedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-auto flex gap-4 pt-4 border-t">
                            {selectedEvent.status !== 'Completed' ? (
                                <button
                                    onClick={() => handleRegister(selectedEvent._id)}
                                    className="btn btn-primary flex-1 py-4 text-lg shadow-xl shadow-primary/20"
                                    disabled={selectedEvent.registeredParticipants.some(p => p.user._id === user?.id || p.user === user?.id)}
                                >
                                    {selectedEvent.registeredParticipants.some(p => p.user._id === user?.id || p.user === user?.id) ? 'Already Registered' : 'Confirm Registration'}
                                </button>
                            ) : (
                                <button className="btn btn-outline flex-1 py-4 text-lg">Leave Feedback</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;
