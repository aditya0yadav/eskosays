import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state from local storage
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('accessToken');

            if (storedUser && token) {
                try {
                    setUser(JSON.parse(storedUser));
                    // Optional: Verify token with backend /me endpoint here if needed
                    // const { data } = await api.get('/auth/me');
                    // setUser(data.user);
                } catch (error) {
                    console.error("Failed to parse stored user", error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });

            const { user, accessToken, refreshToken } = data;

            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            return user;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await api.post('/auth/register', userData);
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await api.post('/auth/logout', { refreshToken }).catch(err => console.warn("Logout API failed", err));
            }
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    };

    const refreshUser = async () => {
        try {
            const { data } = await api.get('/user/summary');
            if (data.success) {
                const updatedUser = { ...user, ...data.data };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error("Failed to refresh user data", error);
        }
    };

    const changePassword = async (oldPassword, newPassword) => {
        try {
            const { data } = await api.post('/auth/change-password', { oldPassword, newPassword });
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to change password';
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        refreshUser,
        logout,
        changePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
