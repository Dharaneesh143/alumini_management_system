import React, { useState, useRef } from 'react';
import {
    Moon,
    Sun,
    Image as ImageIcon,
    Link as LinkIcon,
    Upload,
    X,
    Check,
    RefreshCcw,
    Settings
} from 'lucide-react';

const PageSettings = ({
    isDarkMode,
    setIsDarkMode,
    showChatSettings = false,
    currentBackground = '',
    onBackgroundChange = () => { },
    onClose = () => { }
}) => {
    const [bgUrl, setBgUrl] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [urlError, setUrlError] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        const trimmedUrl = bgUrl.trim();
        if (trimmedUrl) {
            console.log('PageSettings: Submitting background URL:', trimmedUrl);
            setUrlError(false);
            setIsApplying(true);
            onBackgroundChange(trimmedUrl);
            setTimeout(() => {
                setIsApplying(false);
                setBgUrl('');
            }, 600);
        }
    };

    const handleFileUpload = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onBackgroundChange(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-slate-700 w-80 overflow-hidden animate-in slide-in-from-top-4 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings size={18} className="text-primary" /> Display Settings
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 space-y-8">
                {/* Theme Section */}
                <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 tracking-[0.2em] mb-4">Appearance</p>
                    <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-2xl">
                        <button
                            onClick={() => setIsDarkMode(false)}
                            className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl transition-all ${!isDarkMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Sun size={16} /> <span className="text-xs font-bold">Light</span>
                        </button>
                        <button
                            onClick={() => setIsDarkMode(true)}
                            className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-500 hover:text-slate-400'}`}
                        >
                            <Moon size={16} /> <span className="text-xs font-bold">Dark</span>
                        </button>
                    </div>
                </div>

                {/* Chat Customization Section */}
                {showChatSettings && (
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 tracking-[0.2em] mb-4">Chat Background</p>

                            {/* URL Input */}
                            <form onSubmit={handleUrlSubmit} className="relative mb-4">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <LinkIcon size={14} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Paste image URL..."
                                    className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-slate-900 dark:text-white border-none rounded-xl text-xs font-bold outline-none ring-0 focus:ring-2 focus:ring-primary/20 text-black"
                                    value={bgUrl}
                                    onChange={(e) => setBgUrl(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!bgUrl.trim() || isApplying}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${isApplying ? 'bg-green-500 scale-110' : 'bg-primary hover:scale-105'
                                        } text-white disabled:opacity-50 disabled:scale-100`}
                                >
                                    {isApplying ? <Check size={14} /> : <Check size={14} />}
                                </button>
                            </form>

                            {/* Drag & Drop Area */}
                            <div
                                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e.target.files[0])}
                                />
                                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400">Drag or click to upload</p>
                            </div>

                            {/* Current Background Preview / Reset */}
                            {currentBackground && (
                                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 dark:border-slate-600 relative group">
                                            <img
                                                src={currentBackground}
                                                className="w-full h-full object-cover"
                                                alt="Current"
                                                onError={() => setUrlError(true)}
                                            />
                                            {urlError && (
                                                <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white" title="Invalid image URL">
                                                    <X size={10} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400">
                                                {urlError ? 'Invalid image link' : 'Theme active'}
                                            </span>
                                            {urlError && <span className="text-[8px] text-red-500 font-bold">Use direct image link</span>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onBackgroundChange('');
                                            setUrlError(false);
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                        title="Reset to default"
                                    >
                                        <RefreshCcw size={14} />
                                    </button>
                                </div>
                            )}

                            <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
                                <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                    <ImageIcon size={10} /> DIRECT LINK TIP
                                </p>
                                <p className="text-[9px] text-blue-500/80 dark:text-blue-400/60 mt-1 leading-relaxed">
                                    Right-click any image on the web and select <strong>"Copy Image Address"</strong> instead of just copying the link.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 text-center">
                <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest italic">Personal preferences stored locally</p>
            </div>
        </div>
    );
};

export default PageSettings;
