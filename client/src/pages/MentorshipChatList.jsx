import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import api from '../config/api';
import {
    MessageSquare,
    Users,
    Search,
    ChevronRight,
    CheckCheck,
    GraduationCap,
    Calendar,
    Sparkles
} from 'lucide-react';

const MentorshipChatList = () => {
    const { user } = useContext(AuthContext);
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const res = await api.get('/api/mentorship/requests');
            // Filter only accepted mentorships for the chat list
            const activeChats = res.data.filter(chat => chat.status === 'accepted');
            setChats(activeChats);
        } catch (err) {
            console.error('Error fetching chat list:', err);
        } finally {
            setLoading(false);
        }
    };

    const getPartner = (chat) => {
        return user.role === 'student' ? chat.alumni : chat.student;
    };

    const getLastMessage = (chat) => {
        if (!chat.messages || chat.messages.length === 0) return { text: 'No messages yet', time: chat.updatedAt };
        const last = chat.messages[chat.messages.length - 1];
        return {
            text: last.type === 'text' ? last.text : `[${last.type.toUpperCase()}]`,
            time: last.createdAt,
            sender: last.sender
        };
    };

    const filteredChats = chats.filter(chat => {
        const partner = getPartner(chat);
        return partner.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
                            <Users className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {user.role === 'alumni' ? 'My Students' : 'My Mentor'}
                            </h1>
                            <p className="text-gray-600 text-sm">
                                {user.role === 'alumni' ? 'Manage your active mentorships' : 'Chat with your mentor'}
                            </p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 px-5 py-2.5 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-bold text-indigo-700 text-sm">
                            {chats.length} {chats.length === 1 ? 'Active' : 'Active'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder={user.role === 'alumni' ? "Search students..." : "Search..."}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Student List */}
            <div className="space-y-3">
                {filteredChats.length === 0 ? (
                    <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
                        <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600 font-medium text-lg mb-2">No active conversations found.</p>
                        <p className="text-gray-500 text-sm">
                            {user.role === 'alumni'
                                ? 'Your active mentorships will appear here.'
                                : 'Start a conversation with your mentor.'}
                        </p>
                        {user.role === 'student' && (
                            <Link to="/mentorship" className="inline-block mt-6 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                                Find a Mentor
                            </Link>
                        )}
                    </div>
                ) : (
                    filteredChats.map(chat => {
                        const partner = getPartner(chat);
                        const lastMsg = getLastMessage(chat);
                        const unreadCount = chat.messages.filter(m => m.sender !== user.id && !m.readBy.includes(user.id)).length;

                        return (
                            <Link
                                key={chat._id}
                                to={user.role === 'alumni' ? `/mentee/${chat._id}` : `/mentorship/conversation/${chat._id}`}
                                className="block group"
                            >
                                <div className="flex items-center gap-4 p-5 bg-white hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-2xl border-2 border-gray-100 hover:border-indigo-300 transition-all duration-200 group-hover:shadow-lg">
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                            {partner.name?.charAt(0).toUpperCase()}
                                        </div>
                                        {/* Online indicator */}
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                                        {/* Unread badge */}
                                        {unreadCount > 0 && (
                                            <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                                {unreadCount}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                                                    {partner.name}
                                                </h3>
                                                {user.role === 'alumni' && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <GraduationCap size={14} className="text-indigo-600 flex-shrink-0" />
                                                        <span className="text-xs font-semibold text-gray-600 truncate">
                                                            {partner?.department || 'N/A'} • Batch {partner?.batch || 'N/A'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                                    <Calendar size={12} />
                                                    <span className="font-medium">
                                                        {new Date(lastMsg.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                                                    Active
                                                </span>
                                            </div>
                                        </div>

                                        {/* Last Message */}
                                        <div className="flex items-center justify-between gap-4">
                                            <p className={`text-sm truncate flex-1 ${unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                                {lastMsg.sender === user.id && <CheckCheck size={14} className="inline mr-1 text-indigo-600" />}
                                                {lastMsg.text}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm group-hover:gap-2 transition-all flex-shrink-0">
                                                {user.role === 'alumni' ? 'Manage' : 'Open'}
                                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>

            {/* Footer Info */}
            {user.role === 'alumni' && chats.length > 0 && (
                <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                    <div className="flex items-center gap-2 text-sm text-indigo-700">
                        <Sparkles size={16} />
                        <span className="font-semibold">
                            You're mentoring {chats.length} {chats.length === 1 ? 'student' : 'students'}. Keep up the great work!
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorshipChatList;
