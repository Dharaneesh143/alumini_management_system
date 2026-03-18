import React, { useState } from 'react';
import api, { API_ENDPOINTS } from '../config/api';

const ResumeUpload = ({ currentResume, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(selectedFile.type)) {
                setError('Only PDF and Word documents are allowed');
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await api.post(API_ENDPOINTS.RESUME_UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setFile(null);
            if (onUploadSuccess) {
                onUploadSuccess(response.data.resumeUrl);
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.msg || 'Failed to upload resume');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Manage Resume
            </h3>

            {currentResume && (
                <div className="mb-4 p-3 bg-indigo-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        </svg>
                        <span className="text-sm text-indigo-700 truncate font-medium">Current Resume</span>
                    </div>
                    <a 
                        href={currentResume} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition-colors"
                    >
                        View
                    </a>
                </div>
            )}

            <div className="space-y-4">
                <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-6 hover:border-indigo-300 transition-colors text-center">
                    <input 
                        type="file" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.doc,.docx"
                    />
                    <div className="space-y-1">
                        <p className="text-sm text-slate-600">
                            {file ? <span className="text-indigo-600 font-medium">{file.name}</span> : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-slate-400">PDF, DOC, DOCX up to 5MB</p>
                    </div>
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`w-full py-2.5 rounded-lg font-medium transition-all transform active:scale-95 ${
                        !file || uploading 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 shadow-indigo-200'
                    }`}
                >
                    {uploading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                        </span>
                    ) : 'Upload New Resume'}
                </button>
            </div>
        </div>
    );
};

export default ResumeUpload;
