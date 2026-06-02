import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Attempt loading student details from local storage cache
    const cachedUser = localStorage.getItem('campus-marketplace-user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error('Failed to parse cached user session:', e);
        localStorage.removeItem('campus-marketplace-user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data);
      localStorage.setItem('campus-marketplace-user', JSON.stringify(data));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password, phone, whatsapp, telegram) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, whatsapp, telegram })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data);
      localStorage.setItem('campus-marketplace-user', JSON.stringify(data));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campus-marketplace-user');
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const token = user?.token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      const updatedSession = { ...user, ...data };
      setUser(updatedSession);
      localStorage.setItem('campus-marketplace-user', JSON.stringify(updatedSession));
      return updatedSession;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      const token = user?.token;
      if (!token) throw new Error('You must login to add to wishlist');

      const res = await fetch(`${API_BASE}/auth/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Wishlist operation failed');
      }

      const updatedUser = { ...user, wishlist: data.wishlist };
      setUser(updatedUser);
      localStorage.setItem('campus-marketplace-user', JSON.stringify(updatedUser));
      return data;
    } catch (err) {
      console.error('Toggle wishlist error:', err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfile, toggleWishlist }}>
      {children}
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
export default AuthContext;
