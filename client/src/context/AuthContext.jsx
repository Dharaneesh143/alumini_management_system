import React, { createContext, useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await api.get(API_ENDPOINTS.GET_ME);
                setUser({ ...res.data, role: res.data.role });
            } catch (err) {
                console.error('Auth check failed:', err);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    const login = async (email, password, role) => {
        const res = await api.post(API_ENDPOINTS.LOGIN, { email, password, role });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const adminLogin = async (email, password) => {
        console.log('Sending Admin Login:', { email, password });
        const res = await api.post(API_ENDPOINTS.ADMIN_LOGIN, { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (userData) => {
        const res = await api.post(API_ENDPOINTS.REGISTER, userData);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const studentLogin = async (email, password) => {
        const res = await api.post(API_ENDPOINTS.STUDENT_LOGIN, { email, password, role: 'student' });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const alumniLogin = async (email, password) => {
        const res = await api.post(API_ENDPOINTS.ALUMNI_LOGIN, { email, password, role: 'alumni' });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const studentSignup = async (userData) => {
        const res = await api.post(API_ENDPOINTS.STUDENT_SIGNUP, { ...userData, role: 'student' });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const alumniSignup = async (userData) => {
        const res = await api.post(API_ENDPOINTS.ALUMNI_SIGNUP, { ...userData, role: 'alumni' });
        // Alumni signup doesn't log them in (pending approval)
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
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
