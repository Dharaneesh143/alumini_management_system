import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import api, { API_ENDPOINTS, getFileUrl } from '../config/api';
import {
    Plus,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Video,
    Users,
    CheckCircle,
    XCircle,
    Bell,
    Settings,
    ChevronRight,
    Search,
    Filter,
    Image as ImageIcon
} from 'lucide-react';

const AlumniEvents = () => {
    const { user } = useContext(AuthContext);
    const [myEvents, setMyEvents] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Hackathon', // Use 'category' to map to 'type' in backend
        type: 'Hackathon', // Ensure it matches backend enum
        mode: 'Online',
        date: '',
        time: '',
        duration: '60 mins',
        venue: '',
        meetingLink: '',
        registration_link: '',
        maxParticipants: 100,
        imageUrl: ''
    });

    useEffect(() => {
        if (user?.id) {
            fetchInitialData();
        }
    }, [user]);

    const fetchInitialData = async () => {
        try {
            const [eventsRes, invitesRes] = await Promise.all([
                api.get(`${API_ENDPOINTS.EVENTS}?alumniId=${user.id}`),
                api.get('/api/events/invitations/me')
            ]);
            setMyEvents(eventsRes.data);
            setInvitations(invitesRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching alumni data:', err);
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const eventData = {
                ...formData,
                type: formData.category, // Backend uses 'type' for the enum
                speaker: { name: user.name, alumniId: user.id },
                organizer: user.currentCompany || user.name,
                department: user.department || 'General'
            };
            await api.post(API_ENDPOINTS.EVENTS, eventData);
            setShowAddForm(false);
            fetchInitialData();
            alert('Event created successfully!');
        } catch (err) {
            alert('Failed to create event');
        }
    };

    const handleInviteAction = async (inviteId, status) => {
        try {
            await api.put(`/api/events/invitations/${inviteId}`, { status });
            fetchInitialData();
            alert(`Invitation ${status}`);
        } catch (err) {
            alert('Failed to respond to invitation');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 px-4 pt-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Host an <span className="text-primary italic">Event</span></h1>
                        <p className="text-gray-500 mt-1">Share your experience and mentor the next generation.</p>
                    </div>
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="btn btn-primary px-8 py-4 rounded-3xl flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                    >
                        <Plus size={20} /> Create New Event
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left 2 Columns: My Events */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <CalendarIcon className="text-primary" /> My Scheduled Events
                        </h2>
                        
                        {loading ? (
                            <div className="p-10 text-center bg-white rounded-[2.5rem] border border-gray-100 italic text-gray-400">Loading your events...</div>
                        ) : myEvents.length === 0 ? (
                            <div className="p-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 font-medium">You haven't hosted any events yet.</p>
                                <button onClick={() => setShowAddForm(true)} className="text-primary font-bold mt-2 hover:underline">Start your first session today</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myEvents.map(event => (
                                    <div key={event._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex gap-4 items-center w-full md:w-auto">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${event.mode === 'Online' ? 'bg-blue-500 shadow-blue-500/20' : 'bg-orange-500 shadow-orange-500/20'}`}>
                                                {new Date(event.date).getDate()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 line-clamp-1">{event.title}</h3>
                                                <p className="text-xs text-secondary mt-0.5">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} • {event.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Registered</span>
                                                <span className="text-sm font-black text-gray-900">{event.registeredParticipants?.length || 0} participants</span>
                                            </div>
                                            <button className="p-3 bg-gray-50 text-gray-400 hover:text-primary rounded-xl transition-colors">
                                                <Settings size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Invitations */}
                    <div className="lg:col-span-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Bell className="text-primary" /> Admin Invitations
                        </h2>
                        
                        {loading ? (
                             <div className="p-10 text-center bg-white rounded-[2.5rem] border border-gray-100 italic text-gray-400">Checking for invites...</div>
                        ) : invitations.length === 0 ? (
                            <div className="p-10 text-center bg-gray-100 rounded-[2rem] text-gray-400 text-sm italic">
                                No pending invitations from Admin.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {invitations.map(invite => (
                                    <div key={invite._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20">
                                        <div className="mb-4">
                                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-lg">Invitation</span>
                                            <h3 className="font-bold text-gray-900 mt-2">{invite.eventId?.title}</h3>
                                            <p className="text-xs text-secondary mt-1 line-clamp-2">{invite.eventId?.description}</p>
                                        </div>
                                        
                                        {invite.status === 'pending' ? (
                                            <div className="grid grid-cols-2 gap-3 mt-6">
                                                <button 
                                                    onClick={() => handleInviteAction(invite._id, 'accepted')}
                                                    className="py-3 bg-primary text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
                                                >
                                                    <CheckCircle size={14} /> Accept
                                                </button>
                                                <button 
                                                    onClick={() => handleInviteAction(invite._id, 'rejected')}
                                                    className="py-3 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                                                >
                                                    <XCircle size={14} /> Decline
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={`mt-4 py-2 px-4 rounded-xl text-xs font-bold text-center ${invite.status === 'accepted' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                Status: {invite.status.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Event Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Post <span className="text-primary italic">New Event</span></h2>
                                <p className="text-gray-500 text-sm mt-1">Fill in the details to schedule your session.</p>
                            </div>
                            <button onClick={() => setShowAddForm(false)} className="p-3 hover:bg-gray-200 rounded-2xl transition-colors">
                                <XCircle size={32} className="text-gray-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateEvent} className="p-10 overflow-y-auto space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">Event Title</label>
                                    <input 
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                        placeholder="e.g. Masterclass: Scaling Distributed Systems"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">Description</label>
                                    <textarea 
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium h-32 resize-none"
                                        placeholder="Share what students will learn from this session..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">Category</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium appearance-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    >
                                        <option value="Hackathon">Hackathon (View Only)</option>
                                        <option value="Company">Company (Registration Req.)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">Mode</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium appearance-none"
                                        value={formData.mode}
                                        onChange={(e) => setFormData({...formData, mode: e.target.value})}
                                    >
                                        <option value="Online">Webinar (Online)</option>
                                        <option value="Offline">Seminar (Offline)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">Date</label>
                                    <input 
                                        type="date"
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">Time</label>
                                    <input 
                                        type="time" 
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                        value={formData.time}
                                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">Duration</label>
                                    <input 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                        placeholder="e.g. 1.5 hours"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">{formData.mode === 'Online' ? 'Meeting Link' : 'Venue Location'}</label>
                                    <input 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                        placeholder={formData.mode === 'Online' ? 'Zoom / GMeet Link' : 'Hall 4, College Campus'}
                                        value={formData.mode === 'Online' ? formData.meetingLink : formData.venue}
                                        onChange={(e) => formData.mode === 'Online' ? setFormData({...formData, meetingLink: e.target.value}) : setFormData({...formData, venue: e.target.value})}
                                    />
                                </div>
                                {formData.category === 'Company' && (
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-black uppercase text-primary tracking-widest mb-2 block">Registration Link (External)</label>
                                        <input 
                                            required
                                            className="w-full px-6 py-4 bg-primary/5 border border-primary/20 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                            placeholder="e.g. Google Form or Company Portal Link"
                                            value={formData.registration_link}
                                            onChange={(e) => setFormData({...formData, registration_link: e.target.value})}
                                        />
                                    </div>
                                )}
                                <div className="md:col-span-2">
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">Poster Image URL</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                        <input 
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                            placeholder="Paste image URL here"
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button type="submit" className="flex-1 py-5 bg-primary text-white font-black rounded-[2rem] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    Publish Event
                                </button>
                                <button type="button" onClick={() => setShowAddForm(false)} className="px-12 py-5 bg-gray-100 text-gray-500 font-bold rounded-[2rem] hover:bg-gray-200 transition-all">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlumniEvents;
