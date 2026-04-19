import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import api, { getFileUrl } from '../config/api';
import MessageBubble from '../components/MessageBubble';
import VoiceRecorder from '../components/VoiceRecorder';
import PageSettings from '../components/PageSettings';
import { useTheme } from '../context/ThemeContext.jsx';
import { initSocket } from '../config/socket';
import {
    Send,
    Paperclip,
    Mic,
    X,
    FileText,
    ArrowLeft,
    MoreVertical,
    Download
} from 'lucide-react';

const MentorshipConversation = ({ isEmbedded = false, mentorshipId = null }) => {
    const { id: paramId } = useParams();
    const id = mentorshipId || paramId;
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const isFirstLoad = useRef(true);

    const [mentorship, setMentorship] = useState(null);
    const [messages, setMessages] = useState([]);
    const [partner, setPartner] = useState(null);
    const [isPartnerOnline, setIsPartnerOnline] = useState(false);
    const [partnerLastSeen, setPartnerLastSeen] = useState(null);
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const [fullScreenImageCaption, setFullScreenImageCaption] = useState(null);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const { isDarkMode, setIsDarkMode } = useTheme();
    const [chatBackground, setChatBackground] = useState('');
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const handleBackgroundChange = (newBg) => {
        console.log('Background changing to:', newBg ? 'Image/Base64' : 'Default');
        setChatBackground(newBg);
        if (newBg) {
            localStorage.setItem(`chat_bg_${id}`, newBg);
        } else {
            localStorage.removeItem(`chat_bg_${id}`);
        }
    };

    // Load background when ID changes
    useEffect(() => {
        if (id) {
            const savedBg = localStorage.getItem(`chat_bg_${id}`);
            setChatBackground(savedBg || '');
        }
    }, [id]);

    // Socket Connection and Presence Listeners
    useEffect(() => {
        if (!user?._id || !partner?._id) return;

        socketRef.current = initSocket(user._id);

        socketRef.current.on('user_status', (data) => {
            if (partner && data.userId === partner._id) {
                setIsPartnerOnline(data.isOnline);
                if (data.lastSeen) setPartnerLastSeen(data.lastSeen);
            }
        });

        socketRef.current.on('typing_status', (data) => {
            if (partner && data.senderId === partner._id) {
                setIsPartnerOnline(true); // If they are typing, they are online
                setIsPartnerTyping(data.isTyping);
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [user, partner]);

    useEffect(() => {
        if (!user) return;
        if (user.role === 'student' && !isEmbedded) {
            // Student accessing standalone conversation
        } else if (user.role === 'alumni' && !isEmbedded) {
            // Alumni should use MenteeDetailView instead
            navigate(`/mentee/${id}`);
            return;
        }
        fetchConversation();
    }, [id, user]);

    useEffect(() => {
        if (messages.length > 0) {
            if (isFirstLoad.current) {
                isFirstLoad.current = false;
                return;
            }
            scrollToBottom();
        }
    }, [messages]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            const container = messagesEndRef.current.parentElement;
            if (container) {
                const scrollContainer = container.closest('.overflow-y-auto');
                if (scrollContainer) {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                } else {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    };

    const fetchConversation = async () => {
        try {
            const res = await api.get(`/api/mentorship/conversation/${id}`);
            setMentorship(res.data.mentorship);
            setPartner(res.data.partner);
            setIsPartnerOnline(res.data.partner.isOnline);
            setPartnerLastSeen(res.data.partner.lastSeen);
            setMessages(res.data.messages);
            markAsRead();
        } catch (err) {
            console.error('Error fetching conversation:', err);
            // Handle removed mentorship
            if (err.response?.status === 403) {
                alert('This mentorship has been ended. Please find a new mentor.');
                navigate('/mentorship');
            } else {
                alert('Failed to load conversation');
            }
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async () => {
        try {
            await api.post('/api/mentorship/mark-as-read', { mentorshipId: id });
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleDeleteMessage = (messageId) => {
        setMessageToDelete(messageId);
    };

    const formatLastSeen = (date) => {
        if (!date) return '';
        const now = new Date();
        const lastSeen = new Date(date);
        const diffInMinutes = Math.floor((now - lastSeen) / 1000 / 60);

        if (diffInMinutes < 1) return 'last seen just now';
        if (diffInMinutes < 60) return `last seen ${diffInMinutes}m ago`;
        
        const isToday = now.toDateString() === lastSeen.toDateString();
        if (isToday) {
            return `last seen today at ${lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        return `last seen on ${lastSeen.toLocaleDateString()}`;
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setNewMessage(val);

        if (socketRef.current && partner) {
            // Typing start emittance
            socketRef.current.emit('typing', { receiverId: partner._id, isTyping: val.length > 0 });

            // Clear existing timeout
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            // Set timeout to clear typing after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current.emit('typing', { receiverId: partner._id, isTyping: false });
            }, 2000);
        }
    };

    const confirmDeleteMessage = async () => {
        if (!messageToDelete) return;

        try {
            const res = await api.delete(`/api/mentorship/message/${id}/${messageToDelete}`);
            setMessages(res.data);
            setMessageToDelete(null);
        } catch (err) {
            console.error('Error deleting message:', err);
            alert('Failed to delete message');
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const handleSendMessage = async (e, typeArg = null, fileArg = null, transcription = '') => {
        if (e && e.preventDefault) e.preventDefault(); // Check if e is an event object

        const file = fileArg || selectedFile;
        let type = typeArg;

        if (!type && file) {
            if (file.type.startsWith('image/')) type = 'image';
            else if (file.type.startsWith('audio/')) type = 'voice';
            else type = 'file';
        } else if (!type) {
            type = 'text';
        }

        const content = typeof e === 'string' ? e : newMessage;
        if (!content.trim() && !file && type === 'text') return;

        setSending(true);
        try {
            const formData = new FormData();
            formData.append('mentorshipId', id);
            formData.append('text', content);
            formData.append('type', type);
            if (file) formData.append('file', file);
            if (transcription) formData.append('transcription', transcription);

            const res = await api.post('/api/mentorship/message', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessages(res.data);
            setNewMessage('');
            setSelectedFile(null);
            setFilePreview(null);
            setIsVoiceMode(false);
            markAsRead();

            // Emit typing status off after sending message
            if (socketRef.current && partner) {
                socketRef.current.emit('typing', { receiverId: partner._id, isTyping: false });
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            }

        } catch (err) {
            console.error('Error sending message:', err);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!mentorship) return <div className="text-center py-20 text-red-600 font-semibold">Conversation not found.</div>;

    // const partner = user.role === 'student' ? mentorship.alumni : mentorship.student; // This is now handled by state

    return (
        <div className={`flex flex-col ${isEmbedded ? 'h-full' : 'h-screen'} bg-white dark:bg-slate-900 transition-colors duration-300`}>
            {/* Header */}
            {!isEmbedded && (
                <div className="bg-violet-400 dark:bg-slate-800 text-white px-6 py-4 flex items-center gap-4 shadow-lg relative z-50">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-black dark:text-white font-bold text-lg overflow-hidden flex-shrink-0">
                        {partner?.profile_image ? (
                            <img src={getFileUrl(partner.profile_image)} alt={partner.name} className="w-full h-full object-cover" />
                        ) : (
                            partner?.name?.charAt(0).toUpperCase()
                        )}
                    </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-bold m-0 dark:text-white truncate">{partner?.name}</h2>
                            <p className={`text-[10px] font-medium m-0 ${isPartnerOnline ? 'text-green-500' : 'text-gray-400 dark:text-slate-500'}`}>
                                {isPartnerOnline ? (isPartnerTyping ? 'typing...' : 'Online') : formatLastSeen(partnerLastSeen)}
                            </p>
                        </div>
                    <div className="relative">
                        <button 
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2 hover:bg-white/10 rounded-full transition-colors ${showSettings ? 'bg-white/20' : ''}`}
                        >
                            <MoreVertical size={20} />
                        </button>
                        
                        {showSettings && (
                            <div className="absolute right-0 top-full mt-2 z-[100]">
                                <PageSettings 
                                    isDarkMode={isDarkMode}
                                    setIsDarkMode={setIsDarkMode}
                                    showChatSettings={true}
                                    currentBackground={chatBackground}
                                    onBackgroundChange={handleBackgroundChange}
                                    onClose={() => setShowSettings(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Messages Area - Now with a stable background layer */}
            <div className="flex-1 relative overflow-hidden">
                {/* 1. Background Image Layer - Using <img> for better URL compatibility */}
                {chatBackground && (
                    <img 
                        src={chatBackground}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500"
                        alt="Chat Background"
                        onError={(e) => {
                            console.error('Page-level: Failed to load background URL:', chatBackground);
                             // Optional: clear it if broken?
                        }}
                    />
                )}

                {/* 2. Glass Overlay Layer */}
                <div className={`absolute inset-0 pointer-events-none ${chatBackground ? 'bg-white/20 dark:bg-slate-900/40 backdrop-blur-[1px]' : 'bg-gray-50 dark:bg-slate-900'}`}></div>

                {/* 3. Scrollable Content Layer */}
                <div className="absolute inset-0 overflow-y-auto p-6 scroll-smooth">
                    <div className="relative z-10 max-w-5xl mx-auto">
                        {messages.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 dark:text-slate-400">
                                <p className="text-sm">No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <MessageBubble
                                    key={idx}
                                    message={msg}
                                    isOwn={msg.sender === (user._id || user.id)}
                                    partnerName={partner?.name}
                                    onDelete={handleDeleteMessage}
                                    onImageClick={(imageUrl, caption) => {
                                        setFullScreenImage(imageUrl);
                                        setFullScreenImageCaption(caption);
                                    }}
                                />
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* Input Area - Premium Gradient Design */}
            {isVoiceMode ? (
                <VoiceRecorder
                    onSend={(blob, text) => handleSendMessage(null, 'voice', blob, text)}
                    onCancel={() => setIsVoiceMode(false)}
                />
            ) : (
                <div className="relative p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 border-t border-gray-100 dark:border-slate-700">
                    {/* Decorative gradient line */}
                    {!isDarkMode && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>}

                    {selectedFile && (
                        <div className="mb-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-2 border-indigo-200/50 dark:border-slate-700/50 p-4 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-bottom-2 hover:shadow-2xl transition-all">
                            <div className="flex items-center gap-4">
                                {filePreview ? (
                                    <div className="relative">
                                        <img src={filePreview} className="w-16 h-16 object-cover rounded-2xl border-2 border-indigo-200 dark:border-slate-600 shadow-md" alt="Preview" />
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                        <FileText size={32} />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate mb-1">{selectedFile.name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="p-3 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl text-gray-500 hover:text-red-600 transition-all hover:rotate-90 duration-300"
                            >
                                <X size={22} />
                            </button>
                        </div>
                    )}

                    {/* Message Input Form with Gradient Border */}
                    <div className="relative group">
                        {/* Animated gradient border */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-60 group-hover:opacity-100 transition duration-500"></div>

                        <form onSubmit={handleSendMessage} className="relative bg-white dark:bg-slate-800 p-3 flex gap-3 items-end shadow-2xl rounded-3xl transition-all duration-300">
                            {/* Subtle inner glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl pointer-events-none"></div>

                            {/* Attachment Button */}

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="relative z-10 p-6 text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 hover:from-indigo-50 hover:to-purple-50 rounded-2xl transition-all duration-300 flex-shrink-0 shadow-sm hover:shadow-md hover:scale-110 active:scale-95 border border-transparent dark:border-slate-700"
                                title="Attach file"
                            >
                                <Paperclip size={22} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                            />

                            {/* Message Input */}
                            <div className="flex-1 relative z-10 bg-gradient-to-r from-gray-50/50 to-purple-50/50 dark:from-slate-900/50 dark:to-slate-900/50 rounded-2xl px-4 py-2">
                                <input
                                    type="text"
                                    placeholder={sending ? "Sending..." : "Type a message..."}
                                    className="w-full border-none focus:ring-0 text-base py-2 px-0 max-h-32 resize-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 outline-none font-medium"
                                    value={newMessage}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    disabled={sending}
                                />
                            </div>
                            {/* Voice/Send Button */}
                            {!newMessage.trim() && !selectedFile ? (
                                <button
                                    type="button"
                                    onClick={() => setIsVoiceMode(true)}
                                    className="relative z-10 p-6 text-gray-600 hover:text-purple-600 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 rounded-2xl transition-all duration-300 flex-shrink-0 shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                                    title="Voice message"
                                >
                                    <Mic size={22} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="relative z-10 h-14 w-14 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-purple-500/40 disabled:opacity-50 transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
                                    title="Send message"
                                >
                                    <Send size={22} className="drop-shadow-lg" />
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Full-Screen Image Viewer (WhatsApp Style) */}
            {fullScreenImage && (
                <div
                    className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
                    onClick={() => {
                        setFullScreenImage(null);
                        setFullScreenImageCaption(null);
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => {
                            setFullScreenImage(null);
                            setFullScreenImageCaption(null);
                        }}
                        className="absolute top-4 right-4 z-[10000] bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                        style={{ backdropFilter: 'blur(10px)' }}
                    >
                        <X size={24} />
                    </button>

                    {/* Image Container */}
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img
                            src={fullScreenImage}
                            alt="Full screen"
                            className="max-w-full max-h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Caption (if exists) */}
                    {fullScreenImageCaption && (
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <p className="text-center text-lg">{fullScreenImageCaption}</p>
                        </div>
                    )}

                    {/* Download Button */}
                    <a
                        href={fullScreenImage}
                        download
                        className="absolute bottom-4 right-4 z-[10000] bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                        style={{ backdropFilter: 'blur(10px)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Download size={24} />
                    </a>
                </div>
            )}
            {/* Message Deletion Modal - Standardized Premium Style */}
            {messageToDelete && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    onClick={() => setMessageToDelete(null)}
                >
                    <div
                        className="bg-white rounded-[2rem] p-8 w-full max-w-[380px] shadow-2xl relative animate-in zoom-in-95 duration-200 text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* icon */}
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                            <X size={40} strokeWidth={3} />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Delete Message?</h3>
                        <p className="text-gray-500 mb-8 px-4">This action cannot be undone. The message will be removed for both participants.</p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDeleteMessage}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-[17px]"
                            >
                                Confirm Delete
                            </button>
                            <button
                                onClick={() => setMessageToDelete(null)}
                                className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-full transition-all duration-300 text-[17px]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorshipConversation;
