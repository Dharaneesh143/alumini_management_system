import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import api, { API_ENDPOINTS } from '../config/api';
import { Search, GraduationCap, MessageSquare, CheckCircle, Clock } from 'lucide-react';

const MentorshipList = () => {
    const { user } = useContext(AuthContext);
    const [alumni, setAlumni] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [requesting, setRequesting] = useState(null);
    const [message, setMessage] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const [filters, setFilters] = useState({
        department: '',
        area: '',
        skill: ''
    });
    const [mentorshipTopic, setMentorshipTopic] = useState('Career Guidance');

    const fetchAlumni = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.department) params.append('department', filters.department);
            if (filters.area) params.append('area', filters.area);
            if (filters.skill) params.append('skill', filters.skill);

            const [alumniRes, requestsRes] = await Promise.all([
                api.get(`/api/student/alumni-discovery?${params.toString()}`),
                api.get(API_ENDPOINTS.GET_MENTORSHIP_REQUESTS)
            ]);
            setAlumni(alumniRes.data);
            setRequests(requestsRes.data);
        } catch (err) {
            console.error('Error fetching alumni:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlumni();
    }, [filters]);

    const handleRequest = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setStatusMessage({ type: '', text: '' });
        try {
            await api.post(API_ENDPOINTS.REQUEST_MENTORSHIP, {
                alumniId: requesting._id,
                message,
                mentorshipTopic
            });
            setStatusMessage({ type: 'success', text: `Request sent to ${requesting.name}!` });
            setRequesting(null);
            setMessage('');
            fetchAlumni(); // Refresh to show pending status
        } catch (err) {
            setStatusMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to send request' });
        }
    };

    const filteredAlumni = alumni.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.profile?.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="container py-8">Loading mentors...</div>;

    const MENTORSHIP_AREAS = ['Career Guidance', 'Coding', 'Placement', 'Higher Studies'];

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Find a Mentor</h1>
                    <p className="text-secondary">Connect with experienced alumni for career guidance</p>
                </div>
            </div>

            {(() => {
                const active = requests.find(r => r.status === 'accepted');
                if (active) {
                    return (
                        <div className="card text-center py-16 bg-primary-light border-primary/20">
                            <GraduationCap size={64} className="mx-auto mb-4 text-primary opacity-50" />
                            <h2 className="text-2xl font-bold mb-2">You have an Active Mentor!</h2>
                            <p className="text-secondary max-w-md mx-auto mb-8">
                                You are currently being mentored by <strong>{active.alumni.name}</strong>.
                                You can only have one active mentor at a time.
                            </p>
                            <Link
                                to={`/mentorship/conversation/${active._id}`}
                                className="btn btn-primary px-8 py-3"
                            >
                                <MessageSquare size={20} className="mr-2" />
                                Go to Conversation
                            </Link>
                        </div>
                    );
                }
                return null;
            })()}

            {!requests.find(r => r.status === 'accepted') && (
                <>
                    {statusMessage.text && (
                        <div className={`card mb-6 ${statusMessage.type === 'success' ? 'bg-success-light' : 'bg-danger-light'}`}>
                            <div className="flex items-center gap-2">
                                {statusMessage.type === 'success' ? <CheckCircle size={20} className="text-success" /> : <Clock size={20} className="text-danger" />}
                                <p className="m-0">{statusMessage.text}</p>
                            </div>
                        </div>
                    )}

                    {/* Search & Filters */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="col-span-2 card p-2 flex items-center gap-2">
                            <Search size={20} className="text-secondary ml-2" />
                            <input
                                type="text"
                                placeholder="Search by name or company..."
                                className="w-full bg-transparent border-none outline-none p-2"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="form-input"
                            value={filters.area}
                            onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                        >
                            <option value="">All Areas</option>
                            {MENTORSHIP_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                        </select>
                        <select
                            className="form-input"
                            value={filters.department}
                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        >
                            <option value="">All Departments</option>
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="MECH">MECH</option>
                        </select>
                    </div>

                    {/* Mentors Grid */}
                    <div className="grid grid-cols-3 gap-6">
                        {filteredAlumni.length === 0 ? (
                            <div className="col-span-3 text-center py-12 text-secondary">
                                <GraduationCap size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No mentors found matching your filters.</p>
                            </div>
                        ) : (
                            filteredAlumni.map(mentor => (
                                <div key={mentor._id} className="card hover:border-primary transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-primary text-xl font-bold">
                                                {mentor.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{mentor.name}</h3>
                                                <p className="text-sm text-secondary">{mentor.profile?.designation || 'Alumni'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {mentor.mentorSettings?.mentorshipAreas?.map(area => (
                                            <span key={area} className="badge badge-primary text-[10px]">{area}</span>
                                        ))}
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-secondary">Company</span>
                                            <span className="font-medium">{mentor.profile?.company || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-secondary">Capcity</span>
                                            <span className="text-xs text-primary font-medium">Up to {mentor.mentorSettings?.capacity || 3} students</span>
                                        </div>
                                    </div>

                                    {(() => {
                                        const request = requests.find(r => r.alumni._id === mentor._id || r.alumni === mentor._id);
                                        if (request) {
                                            return (
                                                <div className={`w-full py-2 px-4 rounded-md text-center font-medium flex items-center justify-center gap-2 ${request.status === 'accepted' ? 'bg-success-light text-success' :
                                                    request.status === 'rejected' ? 'bg-danger-light text-danger' :
                                                        'bg-warning-light text-warning'
                                                    }`}>
                                                    {request.status === 'accepted' ? <CheckCircle size={18} /> : <Clock size={18} />}
                                                    {request.status === 'accepted' ? 'Active Mentor' :
                                                        request.status === 'rejected' ? 'Request Rejected' : 'Pending Approval'}
                                                </div>
                                            );
                                        }
                                        return (
                                            <button
                                                onClick={() => setRequesting(mentor)}
                                                className="btn btn-primary w-full flex items-center justify-center gap-2"
                                            >
                                                <MessageSquare size={18} />
                                                Request Mentorship
                                            </button>
                                        );
                                    })()}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Modal for Request */}
                    {requesting && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="card w-full max-w-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Request Mentorship from {requesting.name}</h2>
                                    <button onClick={() => setRequesting(null)} className="text-secondary">×</button>
                                </div>
                                <form onSubmit={handleRequest}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Mentorship Topic</label>
                                        <select
                                            className="form-input w-full"
                                            value={mentorshipTopic}
                                            onChange={(e) => setMentorshipTopic(e.target.value)}
                                        >
                                            {MENTORSHIP_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Message</label>
                                        <textarea
                                            className="form-input w-full"
                                            rows="4"
                                            placeholder="Briefly explain your goals..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="submit" className="btn btn-primary flex-1">Send Request</button>
                                        <button
                                            type="button"
                                            onClick={() => setRequesting(null)}
                                            className="btn btn-outline flex-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MentorshipList;
