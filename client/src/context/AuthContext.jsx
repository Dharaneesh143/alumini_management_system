import React, { createContext, useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const getActiveRole = () => {
        const path = window.location.pathname;
        if (path.startsWith('/admin')) return 'admin';
        if (path.startsWith('/auth/student') || path.includes('student')) return 'student';
        if (path.startsWith('/auth/alumni') || path.includes('alumni')) return 'alumni';
        return sessionStorage.getItem('activeRole') || 'student';
    };

    const checkUserLoggedIn = async () => {
        const role = getActiveRole();
        const token = localStorage.getItem(`token_${role}`);

        if (token) {
            try {
                // Temporarily set token in localStorage for the API interceptor if needed
                // though we will update api.js to handle this better
                const res = await api.get(API_ENDPOINTS.GET_ME, {
                    headers: { 'x-auth-token': token }
                });
                setUser({ ...res.data, role: res.data.role });
                sessionStorage.setItem('activeRole', res.data.role);
            } catch (err) {
                console.error(`Auth check failed for ${role}:`, err);
                localStorage.removeItem(`token_${role}`);
            }
        }
        setLoading(false);
    };

    const login = async (email, password, role) => {
        const res = await api.post(API_ENDPOINTS.LOGIN, { email, password, role });
        const userRole = res.data.user.role || role;
        localStorage.setItem(`token_${userRole}`, res.data.token);
        sessionStorage.setItem('activeRole', userRole);
        setUser(res.data.user);
        return res.data;
    };

    const adminLogin = async (email, password) => {
        const res = await api.post(API_ENDPOINTS.ADMIN_LOGIN, { email, password });
        localStorage.setItem('token_admin', res.data.token);
        sessionStorage.setItem('activeRole', 'admin');
        setUser(res.data.user);
        return res.data;
    };

    const register = async (userData) => {
        const res = await api.post(API_ENDPOINTS.REGISTER, userData);
        const userRole = res.data.user.role;
        localStorage.setItem(`token_${userRole}`, res.data.token);
        sessionStorage.setItem('activeRole', userRole);
        setUser(res.data.user);
        return res.data;
    };

    const studentLogin = async (email, password) => {
        const res = await api.post(API_ENDPOINTS.STUDENT_LOGIN, { email, password, role: 'student' });
        localStorage.setItem('token_student', res.data.token);
        sessionStorage.setItem('activeRole', 'student');
        setUser(res.data.user);
        return res.data;
    };

    const alumniLogin = async (email, password) => {
        const res = await api.post(API_ENDPOINTS.ALUMNI_LOGIN, { email, password, role: 'alumni' });
        localStorage.setItem('token_alumni', res.data.token);
        sessionStorage.setItem('activeRole', 'alumni');
        setUser(res.data.user);
        return res.data;
    };

    const studentSignup = async (userData) => {
        const res = await api.post(API_ENDPOINTS.STUDENT_SIGNUP, { ...userData, role: 'student' });
        localStorage.setItem('token_student', res.data.token);
        sessionStorage.setItem('activeRole', 'student');
        setUser(res.data.user);
        return res.data;
    };

    const alumniSignup = async (userData) => {
        const res = await api.post(API_ENDPOINTS.ALUMNI_SIGNUP, { ...userData, role: 'alumni' });
        return res.data;
    };

    const logout = () => {
        const role = getActiveRole();
        localStorage.removeItem(`token_${role}`);
        sessionStorage.removeItem('activeRole');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            adminLogin,
            studentLogin,
            alumniLogin,
            studentSignup,
            alumniSignup,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
