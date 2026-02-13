import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import api from '../config/api';
import MessageBubble from '../components/MessageBubble';
import VoiceRecorder from '../components/VoiceRecorder';
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

    const [mentorship, setMentorship] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const [fullScreenImageCaption, setFullScreenImageCaption] = useState(null);
    const [messageToDelete, setMessageToDelete] = useState(null);

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
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversation = async () => {
        try {
            const res = await api.get(`/api/mentorship/conversation/${id}`);
            setMentorship(res.data);
            setMessages(res.data.messages || []);
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
        if (e) e.preventDefault();

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

    const partner = user.role === 'student' ? mentorship.alumni : mentorship.student;

    return (
        <div className={`flex flex-col ${isEmbedded ? 'h-full' : 'h-screen'} bg-white`}>
            {/* Header */}
            {!isEmbedded && (
                <div className="bg-blue-400 text-white px-6 py-4 flex items-center gap-4 shadow-lg">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {partner?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg">{partner?.name}</h3>
                        <p className="text-xs text-white/80">{user.role === 'student' ? 'Mentor' : 'Student'}</p>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
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

            {/* Input Area - Premium Gradient Design */}
            {isVoiceMode ? (
                <VoiceRecorder
                    onSend={(blob, text) => handleSendMessage(null, 'voice', blob, text)}
                    onCancel={() => setIsVoiceMode(false)}
                />
            ) : (
                <div className="relative p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                    {/* Decorative gradient line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                    {selectedFile && (
                        <div className="mb-4 bg-white/80 backdrop-blur-lg border-2 border-indigo-200/50 p-4 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-bottom-2 hover:shadow-2xl transition-all">
                            <div className="flex items-center gap-4">
                                {filePreview ? (
                                    <div className="relative">
                                        <img src={filePreview} className="w-16 h-16 object-cover rounded-2xl border-2 border-indigo-200 shadow-md" alt="Preview" />
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full border-2 border-white"></div>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                        <FileText size={32} />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate mb-1">{selectedFile.name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="p-3 hover:bg-red-100 rounded-xl text-gray-500 hover:text-red-600 transition-all hover:rotate-90 duration-300"
                            >
                                <X size={22} />
                            </button>
                        </div>
                    )}

                    {/* Message Input Form with Gradient Border */}
                    <div className="relative group">
                        {/* Animated gradient border */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-60 group-hover:opacity-100 transition duration-500"></div>

                        <form onSubmit={handleSendMessage} className="relative bg-white p-3 flex gap-3 items-end shadow-2xl rounded-3xl transition-all duration-300">
                            {/* Subtle inner glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl pointer-events-none"></div>

                            {/* Attachment Button */}

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="relative z-10 p-6 text-gray-600 hover:text-indigo-600 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 rounded-2xl transition-all duration-300 flex-shrink-0 shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
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
                            <div className="flex-1 relative z-10 bg-gradient-to-r from-gray-50/50 to-purple-50/50 rounded-2xl px-4 py-2">
                                <textarea
                                    className="w-full border-none focus:ring-0 text-base py-2 px-0 max-h-32 resize-none bg-transparent text-gray-900 placeholder-gray-500 outline-none font-medium"
                                    rows="1"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                ></textarea>
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
