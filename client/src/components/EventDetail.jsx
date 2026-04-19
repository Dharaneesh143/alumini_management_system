import React from 'react';
import { 
    Calendar as CalendarIcon, 
    MapPin, 
    Video, 
    Users, 
    Clock, 
    ExternalLink, 
    XCircle 
} from 'lucide-react';
import { getFileUrl } from '../config/api';

const EventDetail = ({ event, onClose, user, onRegister }) => {
    if (!event) return null;

    const isRegistered = event.registeredParticipants?.some(p => (p.user?._id || p.user) === user?.id);

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 cursor-pointer"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in slide-in-from-bottom-12 duration-700 cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left Side: Visual/Quick Info */}
                <div className="md:w-[40%] bg-gray-900 relative">
                    <img
                        src={getFileUrl(event.imageUrl) || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=800&auto=format&fit=crop'}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent p-12 flex flex-col justify-end">
                        <div className="mb-6">
                            <span className="px-4 py-2 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-2xl text-xs font-bold text-white tracking-widest uppercase">
                                {event.category || event.type}
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white mb-6 leading-tight">{event.title}</h2>

                        <div className="space-y-6">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                                    <CalendarIcon size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Date & Time</p>
                                    <p className="text-white font-medium">{new Date(event.date).toLocaleDateString()} • {event.time}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                                    {event.mode === 'Online' ? <Video size={20} className="text-white" /> : <MapPin size={20} className="text-white" />}
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Location</p>
                                    <p className="text-white font-medium">{event.mode === 'Online' ? 'Video Webcast' : event.venue}</p>
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
                                <p className="text-sm font-bold text-gray-900">{event.speaker?.name || event.organizer}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
                        >
                            <XCircle size={24} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="mb-10 flex-1">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Event Overview</h3>
                        <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                            {event.description}
                        </p>
                    </div>

                    {/* Meeting Link only if registered/admin/alumni and online */}
                    {event.mode === 'Online' && event.meetingLink && (
                        <div className="mb-10 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                    <Video size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-900">Virtual Access</h4>
                                    <p className="text-xs text-blue-700">Link active for session participation.</p>
                                </div>
                            </div>
                            <a
                                href={event.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                            >
                                Join Now <ExternalLink size={14} />
                            </a>
                        </div>
                    )}

                    <div className="flex gap-4">
                        {onRegister && ((user?.role === 'student' && event.type === 'Company') || 
                          (user?.role === 'alumni' && ['Company', 'Hackathon', 'College Event'].includes(event.type))) ? (
                            <button
                                onClick={() => onRegister(event._id)}
                                disabled={isRegistered}
                                className={`flex-1 py-5 rounded-3xl font-black text-lg transition-all shadow-xl ${isRegistered
                                    ? 'bg-green-50 text-green-600 shadow-none'
                                    : 'bg-primary text-white shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1'
                                    }`}
                            >
                                {isRegistered ? 'You are Registered' : 'Confirm My Spot'}
                            </button>
                        ) : (
                            <div className="flex-1 py-5 rounded-3xl bg-gray-50 text-gray-400 font-bold text-center">
                                {user?.role === 'student' ? 'View Only' : 'Viewing Event Details'}
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="px-10 py-5 bg-gray-50 text-gray-500 rounded-3xl hover:bg-gray-100 transition-all font-black text-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
