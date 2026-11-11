import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Load current user profile on app startup if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session expired or error loading user:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(receivedUser));
        toast.success(`Welcome back, ${receivedUser.name}!`);
        return { success: true, user: receivedUser };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(receivedUser));
        toast.success(`Account created successfully! Welcome, ${receivedUser.name}.`);
        return { success: true, user: receivedUser };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('You have logged out successfully.');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        updateUser(res.data.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isAuthenticated = !!token && !!user;
  const isDonor = user?.roles?.includes('donor') || user?.roles?.includes('admin');
  const isReceiver = user?.roles?.includes('receiver') || user?.roles?.includes('admin');
  const isAdmin = user?.roles?.includes('admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isDonor,
        isReceiver,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
