import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import api, { API_BASE_URL } from '../config/api';
import MentorshipConversation from './MentorshipConversation';
import {
    User,
    FileText,
    MessageSquare,
    ChevronLeft,
    Plus,
    Download,
    BookOpen,
    Target,
    Clock,
    UserMinus,
    Mail,
    Hash,
    Award,
    Sparkles,
    AlertTriangle,
    ExternalLink
} from 'lucide-react';

const MenteeDetailView = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [mentorship, setMentorship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [noteText, setNoteText] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // chat, profile, notes
    const [showEndModal, setShowEndModal] = useState(false);
    const [endFeedback, setEndFeedback] = useState('');

    useEffect(() => {
        if (!user) return;
        if (user.role !== 'alumni') {
            navigate(`/mentorship/conversation/${id}`);
            return;
        }
        fetchDetails();
    }, [id, user]);

    const fetchDetails = async () => {
        try {
            const res = await api.get(`/api/mentorship/conversation/${id}`);
            setMentorship(res.data);
        } catch (err) {
            console.error('Error fetching mentee details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        setSavingNote(true);
        try {
            const res = await api.post('/api/mentorship/notes', {
                mentorshipId: id,
                text: noteText
            });
            setMentorship(prev => ({ ...prev, mentorNotes: res.data }));
            setNoteText('');
        } catch (err) {
            console.error('Error adding note:', err);
            alert('Failed to save note');
        } finally {
            setSavingNote(false);
        }
    };

    const handleEndMentorship = () => {
        setShowEndModal(true);
    };

    const confirmEndMentorship = async () => {
        if (!endFeedback.trim()) return alert('Please provide a reason for ending the mentorship');
        try {
            await api.post('/api/mentorship/respond', {
                mentorshipId: id,
                status: 'removed',
                response: endFeedback
            });
            setShowEndModal(false);
            setEndFeedback('');
            alert('Mentorship ended successfully.');
            navigate('/mentorship/chats');
        } catch (err) {
            console.error('Error ending mentorship:', err);
            alert(err.response?.data?.msg || 'Failed to end mentorship');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[500px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!mentorship) return <div className="text-center py-20 text-red-600 font-semibold">Mentorship not found.</div>;

    const { student } = mentorship;

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-100">
                <div className="flex items-center gap-4">
                    <Link to="/mentorship/chats" className="p-2.5 hover:bg-white rounded-xl text-gray-600 hover:text-indigo-600 transition-all">
                        <ChevronLeft size={24} />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {student?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{student?.name || 'Student'}</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <BookOpen size={14} className="text-indigo-600" />
                                <span className="font-semibold">{student?.department || 'N/A'} • Batch {student?.batch || student?.graduationYear || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleEndMentorship}
                    className="px-6 py-3 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white font-bold rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                    <UserMinus size={18} />
                    End Mentorship
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar: Student Profile */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-2 rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                        {/* Profile Header */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-100 p-6 text-center">
                            <div className="relative inline-block mb-3">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl border-2 border-white/30">
                                    {student?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{student?.name}</h3>
                            <p className="text-sm text-white/80 font-medium">{student?.department || 'N/A'} • Batch {student?.batch || student?.graduationYear || 'N/A'}</p>
                        </div>

                        {/* Profile Content */}
                        <div className="p-5 space-y-5">

                            {/* Contact Information */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2.5 p-4">
                                    <Mail size={13} className="text-indigo-600" />
                                    Contact Info
                                </h4>
                                <div className="space-y-2.5">
                                    <div className="flex items-start gap-2.5 text-sm pl-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                            <Mail size={16} className="text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-500 font-medium mb-0.5">Email</p>
                                            <p className="text-sm text-gray-900 font-medium truncate">{student.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                            <Hash size={16} className="text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 font-medium mb-0.5">Roll Number</p>
                                            <p className="text-sm text-gray-900 font-medium">{student.rollNumber || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200"></div>

                            {/* Career Goal */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 px-2 flex items-center gap-1.5">
                                    <Target size={13} className="text-indigo-600" />
                                    Career Goal
                                </h4>
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 px-6 rounded-xl border border-indigo-100">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {student.careerGoals || 'No career goal specified yet.'}
                                    </p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200"></div>

                            {/* Skills */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 p-4 flex items-center gap-1.5">
                                    <Award size={13} className="text-purple-600" />
                                    Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {student.skills?.length > 0 ? (
                                        student.skills.map((skill, i) => (
                                            <span key={i} className="text-xs font-semibold px-3 py-1.5 bg-white text-indigo-700 rounded-lg border border-indigo-200 shadow-sm">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm px-10 text-gray-400 italic">No skills listed</span>
                                    )}
                                </div>
                            </div>

                            {/* Resume Download */}
                            {mentorship.resumeUrl && (
                                <>
                                    <div className="border-t border-gray-200"></div>
                                    <a
                                        href={`${API_BASE_URL}/${mentorship.resumeUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold block">View Resume</span>
                                                <span className="text-xs text-white/80">PDF Document</span>
                                            </div>
                                        </div>
                                        <Download size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Tab Navigation - Refined & Orderly */}
                    <div className="flex justify-around items-center p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-[20px] w-full border border-gray-200 shadow-inner">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex flex-1 justify-center items-center gap-2.5 px-8 py-3 rounded-[15px] text-sm font-bold transition-all duration-300 ${activeTab === 'chat'
                                ? 'bg-white text-indigo-600 shadow-md transform scale-[1.02]'
                                : 'text-gray-500 hover:text-indigo-600 hover:bg-white/50'
                                }`}
                        >
                            <MessageSquare size={18} className={activeTab === 'chat' ? 'text-indigo-600' : 'text-gray-400'} />
                            <span>Chat</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex flex-1 justify-center items-center gap-2.5 px-8 py-3 rounded-[15px] text-sm font-bold transition-all duration-300 ${activeTab === 'profile'
                                ? 'bg-white text-indigo-600 shadow-md transform scale-[1.02]'
                                : 'text-gray-500 hover:text-indigo-600 hover:bg-white/50'
                                }`}
                        >
                            <FileText size={18} className={activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-400'} />
                            <span>Resume</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`flex flex-1 justify-center items-center gap-2.5 px-8 py-3 rounded-[15px] text-sm font-bold transition-all duration-300 ${activeTab === 'notes'
                                ? 'bg-white text-indigo-600 shadow-md transform scale-[1.02]'
                                : 'text-gray-500 hover:text-indigo-600 hover:bg-white/50'
                                }`}
                        >
                            <Sparkles size={18} className={activeTab === 'notes' ? 'text-indigo-600' : 'text-gray-400'} />
                            <span>Workspace</span>
                        </button>
                    </div>

                    {/* Tab Content - Neatly Arranged */}
                    <div className="min-h-[600px] transition-all duration-500">
                        {activeTab === 'chat' && (
                            <div className="h-[700px] bg-white rounded-[24px] overflow-hidden border border-gray-200 shadow-xl animate-in fade-in duration-500">
                                <MentorshipConversation isEmbedded={true} mentorshipId={id} />
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 p-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText size={20} className="text-indigo-600" />
                                        Student Resume Preview
                                    </h3>
                                    {mentorship.resumeUrl ? (
                                        <div className="aspect-[3/4] w-full border-2 border-gray-200 rounded-2xl overflow-hidden shadow-inner bg-gray-50">
                                            <iframe
                                                src={`${API_BASE_URL}/${mentorship.resumeUrl}`}
                                                className="w-full h-full border-none"
                                                title="Resume Viewer"
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                                            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p className="font-medium`">No resume uploaded for this request.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'notes' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="md:col-span-2 space-y-6">
                                    <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 p-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <Sparkles size={22} className="text-indigo-600" />
                                            Private Progress Notes
                                        </h3>
                                        <form onSubmit={handleAddNote} className="mb-10">
                                            <textarea
                                                className="w-full p-2 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none min-h-[140px] text-base text-gray-900 placeholder-gray-400 shadow-inner"
                                                placeholder="Write a private remark or progress milestone..."
                                                value={noteText}
                                                onChange={(e) => setNoteText(e.target.value)}
                                            />
                                            <div className="flex justify-end mt-4">
                                                <button
                                                    type="submit"
                                                    disabled={savingNote || !noteText.trim()}
                                                    className="px-10 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                >
                                                    {savingNote ? 'Saving...' : <><Plus size={20} /> Save Note</>}
                                                </button>
                                            </div>
                                        </form>

                                        <div className="space-y-4">
                                            {mentorship.mentorNotes?.length === 0 ? (
                                                <div className="text-center py-16 text-gray-400 italic text-sm bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                                                    <Sparkles size={32} className="mx-auto mb-3 text-gray-200" />
                                                    No notes saved yet. These are only visible to you.
                                                </div>
                                            ) : (
                                                mentorship.mentorNotes.slice().reverse().map((note, i) => (
                                                    <div key={i} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-gray-400">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                                            {new Date(note.createdAt).toLocaleString()}
                                                        </div>
                                                        <p className="text-sm text-gray-700 leading-relaxed font-medium">{note.text}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-[24px] border border-red-100 p-8 shadow-lg">
                                        <h3 className="text-red-600 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                                            <AlertTriangle size={18} /> Danger Zone
                                        </h3>
                                        <p className="text-sm text-red-700/80 mb-6 font-medium leading-relaxed">
                                            Warning: Ending mentorship will instantly block chat access and remove the student from your dashboard.
                                        </p>
                                        <button
                                            onClick={handleEndMentorship}
                                            className="w-full px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-[15px] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            <UserMinus size={18} /> End Mentorship
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* End Mentorship Modal - Refined Review Style Design */}
                {showEndModal && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4"
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setShowEndModal(false);
                                setEndFeedback('');
                            }
                        }}
                    >
                        <div
                            className="bg-white rounded-[2rem] p-8 w-full max-w-[400px] shadow-2xl relative animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setShowEndModal(false);
                                    setEndFeedback('');
                                }}
                                className="absolute top-8 right-8 w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all group"
                            >
                                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Title Section */}
                            <h3 className="text-[24px] font-bold text-gray-900 mb-6 font-serif leading-tight">End Mentorship</h3>

                            {/* Student Identity Section */}
                            <div className="flex items-center gap-4 mb-8 pb-2">
                                <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-indigo-200">
                                    {mentorship?.student?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-lg text-gray-900 leading-tight">{mentorship?.student?.name}</p>
                                    <p className="text-[15px] text-gray-500 mt-0.5">Student</p>
                                </div>
                            </div>

                            {/* Question Header */}
                            <div className="mb-6">
                                <p className="text-[17px] font-semibold text-gray-800">Reason for ending this mentorship?</p>
                            </div>

                            {/* Feedback Input Block */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-500 mb-3">
                                    Describe the reason
                                </label>
                                <textarea
                                    className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-32 resize-none text-[15px] text-gray-900 placeholder-gray-400"
                                    placeholder=""
                                    value={endFeedback}
                                    onChange={(e) => setEndFeedback(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={confirmEndMentorship}
                                disabled={!endFeedback.trim()}
                                className="w-full py-4 bg-[#1a73e8] hover:bg-[#1557b0] h-[50px] text-white font-bold rounded-full disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-[17px] "
                            >
                                Confirm Removal
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenteeDetailView;
