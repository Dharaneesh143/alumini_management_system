import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import api, { API_ENDPOINTS } from '../config/api';
import {
    Plus,
    Calendar as CalendarIcon,
    Users,
    Mail,
    Trash2,
    Edit,
    Search,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    UserPlus,
    Tag,
    BarChart2,
    ArrowRight
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

const AdminEvents = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [alumni, setAlumni] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(null);
    const [selectedAlumni, setSelectedAlumni] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'College Event',
        mode: 'Offline',
        date: '',
        time: '',
        duration: '2 hours',
        venue: '',
        meetingLink: '',
        maxParticipants: 500,
        imageUrl: ''
    });

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [eventsRes, alumniRes, statsRes] = await Promise.all([
                api.get(API_ENDPOINTS.EVENTS),
                api.get('/api/users?role=alumni'),
                api.get(API_ENDPOINTS.EVENT_STATS)
            ]);
            setEvents(eventsRes.data);
            setAlumni(alumniRes.data);
            setStats(statsRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching admin data:', err);
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await api.delete(`${API_ENDPOINTS.EVENTS}/${id}`);
            fetchAdminData();
            alert('Event deleted');
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const eventData = {
                ...formData,
                type: 'College Event', // Force correct type
                organized_by: 'Admin',
                organizer: 'University Administration',
                department: 'All Departments',
                speaker: { name: 'Faculty/Chief Guest' }
            };
            await api.post(API_ENDPOINTS.EVENTS, eventData);
            setShowAddForm(false);
            fetchAdminData();
            alert('College event created successfully!');
        } catch (err) {
            alert('Failed to create event');
        }
    };

    const handleSendInvitations = async () => {
        if (selectedAlumni.length === 0) return alert('Select at least one alumni');
        try {
            await api.post(`/api/events/${showInviteModal._id}/invite`, { alumniIds: selectedAlumni });
            setShowInviteModal(null);
            setSelectedAlumni([]);
            alert('Invitations sent successfully!');
        } catch (err) {
            alert('Failed to send invitations');
        }
    };

    const toggleAlumniSelection = (id) => {
        if (selectedAlumni.includes(id)) {
            setSelectedAlumni(selectedAlumni.filter(aid => aid !== id));
        } else {
            setSelectedAlumni([...selectedAlumni, id]);
        }
    };

    const filteredAlumni = alumni.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 px-4 pt-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Event <span className="text-primary italic">Management</span></h1>
                        <p className="text-gray-500 mt-1">Monitor participation and invite alumni to university events.</p>
                    </div>
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="px-8 py-4 bg-gray-900 text-white font-black rounded-[2rem] flex items-center gap-2 shadow-xl shadow-gray-900/20 hover:scale-105 transition-all"
                    >
                        <Plus size={20} /> Create College Event
                    </button>
                </div>

                {/* Dashboard Stats */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: 'Total Events', val: stats.totalEvents, color: 'primary' },
                            { label: 'Upcoming', val: stats.upcomingEvents, color: 'orange-500' },
                            { label: 'Registrations', val: stats.totalRegistrations || 0, color: 'green-500' },
                            { label: 'Completed', val: stats.completedEvents, color: 'gray-400' }
                        ].map(s => (
                            <div key={s.label} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{s.label}</span>
                                <span className={`text-3xl font-black text-${s.color}`}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Tag className="text-primary" /> Active Events
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-8 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Event Title</th>
                                    <th className="px-8 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Type</th>
                                    <th className="px-8 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Participants</th>
                                    <th className="px-8 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Organized By</th>
                                    <th className="px-8 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {events.map(event => (
                                    <tr key={event._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{event.title}</span>
                                                <span className="text-xs text-gray-400">{new Date(event.date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-lg">{event.category}</span>
                                        </td>
                                        <td className="px-8 py-5 font-black text-gray-900">{event.registeredParticipants?.length || 0} <span className="text-gray-300 font-medium">/ 100</span></td>
                                        <td className="px-8 py-5 text-sm text-gray-600 font-medium">{event.organizer || 'University'}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg ${
                                                event.status === 'Upcoming' ? 'bg-orange-50 text-orange-600' :
                                                event.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                                            }`}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button 
                                                    onClick={() => setShowInviteModal(event)}
                                                    className="p-3 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-xl transition-all"
                                                    title="Invite Alumni"
                                                >
                                                    <UserPlus size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteEvent(event._id)}
                                                    className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Invitation Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-12 duration-500">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Invite <span className="text-primary italic">Alumni</span></h2>
                                <p className="text-gray-500 text-sm mt-1">Select alumni to invite for: <strong>{showInviteModal.title}</strong></p>
                            </div>
                            <button onClick={() => setShowInviteModal(null)} className="p-3 hover:bg-gray-200 rounded-2xl transition-colors">
                                <XCircle size={32} className="text-gray-400" />
                            </button>
                        </div>
                        
                        <div className="p-10 flex-1 overflow-y-auto">
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Filter alumni by name or department..."
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                {filteredAlumni.map(alumnus => (
                                    <div 
                                        key={alumnus._id}
                                        onClick={() => toggleAlumniSelection(alumnus._id)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                            selectedAlumni.includes(alumnus._id) ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{alumnus.name}</p>
                                                <p className="text-xs text-gray-400">{alumnus.department || 'All Departments'} • {alumnus.currentCompany || 'Alumni'}</p>
                                            </div>
                                        </div>
                                        {selectedAlumni.includes(alumnus._id) && (
                                            <CheckCircle className="text-primary" size={24} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-10 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                            <span className="font-bold text-gray-500">{selectedAlumni.length} selected</span>
                            <div className="flex gap-4">
                                <button onClick={() => setShowInviteModal(null)} className="px-8 py-4 bg-white text-gray-500 font-bold rounded-2xl border border-gray-100 transition-all">Cancel</button>
                                <button 
                                    onClick={handleSendInvitations}
                                    disabled={selectedAlumni.length === 0}
                                    className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Send Invitations
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Create College Event Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Post <span className="text-primary italic">College Event</span></h2>
                                <p className="text-gray-500 text-sm mt-1">Create official university events and celebrations.</p>
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
                                        placeholder="e.g. Annual Alumni Meet 2026 or Farewell Ceremony"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">Description</label>
                                    <textarea 
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium h-32 resize-none"
                                        placeholder="Details about the celebration or lecture..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">Event Category</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium appearance-none"
                                        value={formData.category} // Using category field, backend maps to 'type'
                                        onChange={(e) => {
                                            const newCategory = e.target.value;
                                            const isOfflineOnly = ['Farewell', 'Celebration'].includes(newCategory);
                                            setFormData({
                                                ...formData, 
                                                category: newCategory,
                                                mode: isOfflineOnly ? 'Offline' : formData.mode
                                            });
                                        }}
                                    >
                                        <option value="Farewell">Farewell</option>
                                        <option value="Celebration">College Celebration</option>
                                        <option value="Guest Lecture">Guest Lecture</option>
                                        <option value="Other">Other Official Event</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">Mode</label>
                                    <select 
                                        className={`w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium appearance-none ${
                                            ['Farewell', 'Celebration'].includes(formData.category) ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        disabled={['Farewell', 'Celebration'].includes(formData.category)}
                                        value={formData.mode}
                                        onChange={(e) => setFormData({...formData, mode: e.target.value})}
                                    >
                                        <option value="Offline">Offline (Campus)</option>
                                        <option value="Online">Online (Webinar)</option>
                                    </select>
                                    {['Farewell', 'Celebration'].includes(formData.category) && (
                                        <p className="text-[10px] text-primary mt-1 font-bold italic">* Required Offline for this category</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">Date</label>
                                    <input 
                                        type="date"
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
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
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">Venue / Link</label>
                                    <input 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                        placeholder={formData.mode === 'Online' ? 'Meeting URL' : 'Auditorium / Ground'}
                                        value={formData.mode === 'Online' ? formData.meetingLink : formData.venue}
                                        onChange={(e) => formData.mode === 'Online' ? setFormData({...formData, meetingLink: e.target.value}) : setFormData({...formData, venue: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">Max Capacity</label>
                                    <input 
                                        type="number"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                        value={formData.maxParticipants}
                                        onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button type="submit" className="flex-1 py-5 bg-gray-900 text-white font-black rounded-[2rem] shadow-xl shadow-gray-900/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    Publish College Event
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

export default AdminEvents;
