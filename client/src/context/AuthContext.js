import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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
            axios.defaults.headers.common['x-auth-token'] = token;
            try {
                const res = await axios.get('http://localhost:5000/api/users/me'); // Endpoint to get current user
                setUser({ ...res.data, role: res.data.role }); // Ensure role is present
            } catch (err) {
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['x-auth-token'];
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        setUser(res.data.user);
    };

    const register = async (userData) => {
        const res = await axios.post('http://localhost:5000/api/auth/register', userData);
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        setUser(res.data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
