import axios from 'axios';

// API Base URL - centralized configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://alumini-management-system.onrender.com';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Helper to get active role from context
const getActiveRoleKey = () => {
    const activeRole = sessionStorage.getItem('activeRole');
    if (activeRole) return `token_${activeRole}`;

    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'token_admin';
    if (path.startsWith('/auth/student') || path.includes('student')) return 'token_student';
    if (path.startsWith('/auth/alumni') || path.includes('alumni')) return 'token_alumni';

    return 'token_student'; // Default fallback
};

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const tokenKey = getActiveRoleKey();
        const token = localStorage.getItem(tokenKey);
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid for this specific role
            const tokenKey = getActiveRoleKey();
            localStorage.removeItem(tokenKey);
            sessionStorage.removeItem('activeRole');

            // Navigate to appropriate login page
            if (tokenKey === 'token_admin') {
                window.location.href = '/admin/login';
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// API Endpoints - centralized
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/api/auth/login',
    ADMIN_LOGIN: '/api/auth/admin-login',
    REGISTER: '/api/auth/register',
    STUDENT_LOGIN: '/api/auth/login',
    STUDENT_SIGNUP: '/api/auth/register',
    ALUMNI_LOGIN: '/api/auth/login',
    ALUMNI_SIGNUP: '/api/auth/register',

    // Users
    GET_ME: '/api/users/me',
    GET_USERS: '/api/users',
    UPDATE_PROFILE: '/api/users/profile',

    // Jobs
    GET_JOBS: '/api/jobs',
    CREATE_JOB: '/api/jobs',
    APPLY_JOB: (jobId) => `/api/jobs/${jobId}/apply`,
    GET_JOB: (jobId) => `/api/jobs/${jobId}`,

    // Mentorship
    REQUEST_MENTORSHIP: '/api/mentorship/request',
    GET_MENTORSHIP_REQUESTS: '/api/mentorship/requests',
    RESPOND_MENTORSHIP: '/api/mentorship/respond',
};

