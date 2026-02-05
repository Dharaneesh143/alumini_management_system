import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import api, { API_ENDPOINTS } from '../config/api';
import {
    Clock,
    CheckCircle,
    XCircle,
    MessageSquare,
    ChevronRight,
    User,
    Calendar,
    Eye
} from 'lucide-react';

const MentorshipRequests = () => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [respondingTo, setRespondingTo] = useState(null);
    const [viewingRequest, setViewingRequest] = useState(null);
    const [responseMessage, setResponseMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get(API_ENDPOINTS.GET_MENTORSHIP_REQUESTS);
            setRequests(res.data);
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (status, quickRequest = null) => {
        const requestId = quickRequest ? quickRequest._id : respondingTo._id;
        try {
            await api.post(API_ENDPOINTS.RESPOND_MENTORSHIP, {
                requestId,
                status,
                response: quickRequest ? 'Mentorship ended by Alumni' : responseMessage
            });
            setRespondingTo(null);
            setResponseMessage('');
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to update request');
        }
    };

    const filteredRequests = requests.filter(r =>
        statusFilter === 'all' ? true : r.status === statusFilter
    );

    if (loading) return <div className="container py-8">Loading requests...</div>;

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Mentorship Requests</h1>
                    <p className="text-secondary">
                        {user.role === 'alumni'
                            ? 'Manage incoming requests from students'
                            : 'Track the status of your mentorship requests'}
                    </p>
                </div>

                <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
                    {['pending', 'accepted', 'rejected', 'all'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${statusFilter === status ? 'bg-primary text-white shadow-md' : 'text-secondary hover:bg-gray-50'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                    <div className="card py-12 text-center text-secondary">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No requests found in this category.</p>
                    </div>
                ) : (
                    filteredRequests.map(req => (
                        <div key={req._id} className="card">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-secondary">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg">
                                                {user.role === 'alumni' ? req.student?.name : req.alumni?.name}
                                            </h3>
                                            <span className={`badge flex items-center gap-1 ${req.status === 'accepted' ? 'badge-success' :
                                                req.status === 'rejected' ? 'badge-danger' :
                                                    req.status === 'removed' ? 'badge-gray' : 'badge-warning'
                                                }`}>
                                                {req.status === 'accepted' ? <CheckCircle size={12} /> :
                                                    req.status === 'rejected' ? <XCircle size={12} /> :
                                                        req.status === 'removed' ? <Clock size={12} /> : <Clock size={12} />}
                                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-secondary mb-3">
                                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(req.createdAt).toLocaleDateString()}</span>
                                            {user.role === 'alumni' && (
                                                <span>🎓 {req.student?.department} • {req.student?.graduationYear}</span>
                                            )}
                                            {user.role === 'student' && (
                                                <span>💼 {req.alumni?.currentCompany} • {req.alumni?.jobRole}</span>
                                            )}
                                            <span className="badge badge-outline text-[10px]">{req.mentorshipTopic}</span>
                                        </div>

                                        {/* Interaction Section (Post-Acceptance) */}
                                        {req.status === 'accepted' && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    {user.role === 'alumni' && req.student?.resumeUrl && (
                                                        <a
                                                            href={req.student.resumeUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-outline flex items-center gap-2"
                                                        >
                                                            <Eye size={14} /> View Student Resume
                                                        </a>
                                                    )}
                                                    <Link
                                                        to={`/mentorship/conversation/${req._id}`}
                                                        className="btn btn-sm btn-primary flex items-center gap-2"
                                                    >
                                                        <MessageSquare size={14} /> Open Conversation
                                                    </Link>
                                                </div>
                                                <div className="bg-primary-light p-3 rounded text-xs text-primary">
                                                    <strong>Mentorship active:</strong> You can now view the resume and start a conversation.
                                                </div>
                                            </div>
                                        )}

                                        {req.status !== 'accepted' && (
                                            <button
                                                onClick={() => setViewingRequest(req)}
                                                className="btn btn-sm btn-outline flex items-center gap-2 mt-2"
                                            >
                                                <MessageSquare size={14} /> View Messages
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {user.role === 'alumni' && req.status === 'pending' && (
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => setRespondingTo(req)}
                                            className="btn btn-primary btn-sm flex items-center gap-1"
                                        >
                                            <CheckCircle size={14} /> Respond
                                        </button>
                                    </div>
                                )}

                                {user.role === 'alumni' && req.status === 'accepted' && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to end this mentorship?')) {
                                                handleRespond('removed', req);
                                            }
                                        }}
                                        className="text-xs text-danger hover:underline"
                                    >
                                        End Mentorship
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View Message Modal */}
            {viewingRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <MessageSquare className="text-primary" /> Mentorship Conversation
                            </h2>
                            <button onClick={() => setViewingRequest(null)} className="text-2xl text-secondary hover:text-black">×</button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                        Student's Request
                                    </span>
                                    <span className="text-[10px] text-secondary">
                                        {new Date(viewingRequest.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
                                    <div className="absolute -left-2 top-4 w-4 h-4 bg-gray-50 border-l border-t border-gray-100 rotate-[-45deg]"></div>
                                    <p className="text-sm italic leading-relaxed">"{viewingRequest.message}"</p>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-secondary ml-2">
                                    <span className="font-medium text-black">Topic:</span> {viewingRequest.mentorshipTopic}
                                </div>
                            </div>

                            {viewingRequest.response ? (
                                <div className="flex flex-col gap-2 items-end">
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-[10px] text-secondary">
                                            {new Date(viewingRequest.updatedAt).toLocaleString()}
                                        </span>
                                        <span className={`text-xs font-bold uppercase tracking-wider ${viewingRequest.status === 'accepted' ? 'text-success' : 'text-danger'
                                            }`}>
                                            Mentor's Decision: {viewingRequest.status}
                                        </span>
                                    </div>
                                    <div className={`p-4 rounded-xl border relative w-[90%] ${viewingRequest.status === 'accepted' ? 'bg-success-light border-success/20' : 'bg-danger-light border-danger/20'
                                        }`}>
                                        <div className={`absolute -right-2 top-4 w-4 h-4 rotate-[135deg] border-l border-t ${viewingRequest.status === 'accepted' ? 'bg-success-light border-success/20' : 'bg-danger-light border-danger/20'
                                            }`}></div>
                                        <p className="text-sm font-medium">"{viewingRequest.response}"</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-xs text-secondary bg-gray-50 rounded-lg border border-dashed">
                                    Awaiting mentor's response...
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setViewingRequest(null)}
                                className="btn btn-primary px-8"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Response Modal */}
            {respondingTo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md">
                        <h2 className="text-xl font-bold mb-2">Respond to {respondingTo.student?.name}</h2>
                        <p className="text-sm text-secondary mb-4">Write a brief message along with your decision.</p>

                        <textarea
                            className="form-input w-full mb-4"
                            rows="4"
                            placeholder="Add a message... (optional)"
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                        ></textarea>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleRespond('accepted')}
                                className="btn btn-success flex-1 flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} /> Accept
                            </button>
                            <button
                                onClick={() => handleRespond('rejected')}
                                className="btn btn-danger flex-1 flex items-center justify-center gap-2"
                            >
                                <XCircle size={18} /> Reject
                            </button>
                            <button
                                onClick={() => setRespondingTo(null)}
                                className="btn btn-outline flex-1"
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

export default MentorshipRequests;
