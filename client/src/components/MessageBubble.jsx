import React from 'react';
import { FileText, Download, Play, Check, CheckCheck, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const MessageBubble = ({ message, isOwn, partnerName, onDelete, onImageClick }) => {
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderContent = () => {
        switch (message.type) {
            case 'image':
                return (
                    <div className="relative group/img">
                        <img
                            src={`${API_BASE_URL}/${message.fileUrl}`}
                            alt="Sent image"
                            className="rounded-lg max-w-full max-h-[350px] w-auto h-auto object-contain cursor-pointer hover:opacity-95 transition-opacity mx-auto"
                            onClick={() => {
                                if (onImageClick) {
                                    onImageClick(`${API_BASE_URL}/${message.fileUrl}`, message.text);
                                } else {
                                    window.open(`${API_BASE_URL}/${message.fileUrl}`, '_blank');
                                }
                            }}
                        />
                        {message.text && <p className="mt-2 text-sm">{message.text}</p>}
                    </div>
                );
            case 'voice':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 bg-black/5 p-3 rounded-xl border border-black/5">
                            <button className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                                <Play size={20} fill="currentColor" />
                            </button>
                            <div className="flex-1">
                                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 w-1/3" />
                                </div>
                                <span className="text-[10px] text-gray-500 mt-1 block">Voice Message</span>
                            </div>
                            <audio src={`${API_BASE_URL}/${message.fileUrl}`} className="hidden" />
                        </div>
                        {message.transcription && (
                            <div className="p-2 bg-white/50 rounded-lg border border-dashed border-black/10 text-xs italic text-gray-600">
                                "{message.transcription}"
                            </div>
                        )}
                    </div>
                );
            case 'file':
                return (
                    <a
                        href={`${API_BASE_URL}/${message.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-black/10 hover:bg-white/80 transition-colors group"
                    >
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <FileText size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{message.fileName || 'Shared Document'}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Download PDF</p>
                        </div>
                        <Download size={18} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </a>
                );
            default:
                return <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>;
        }
    };

    return (
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-4 group animate-in fade-in slide-in-from-bottom-1 duration-300`}>
            {!isOwn && (
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4 mb-1">
                    {partnerName}
                </span>
            )}
            <div className="max-w-[85%] md:max-w-[70%] relative flex items-start gap-2">
                {isOwn && onDelete && (
                    <button
                        onClick={() => onDelete(message._id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all duration-200"
                        title="Delete message"
                    >
                        <Trash2 size={16} />
                    </button>
                )}

                <div className={`
                    p-4 rounded-3xl shadow-sm relative
                    ${isOwn
                        ? 'bg-indigo-100 text-gray-800 rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}
                `}>
                    {renderContent()}

                    <div className={`flex items-center gap-1 mt-2 justify-end text-gray-400`}>
                        <span className="text-[10px] font-medium">{formatTime(message.createdAt)}</span>
                        {isOwn && (
                            message.readBy?.length > 1 ? (
                                <CheckCheck size={14} className="text-indigo-600" />
                            ) : (
                                <Check size={14} className="text-gray-500" />
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
