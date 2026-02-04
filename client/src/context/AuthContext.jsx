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

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, adminLogin, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
