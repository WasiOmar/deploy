import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  // Load user
  const loadUser = async () => {
    if (token) {
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Token Payload:', payload);
          console.log('Token - User data:', payload.user);
          console.log('Token - isAdmin value:', payload.user?.isAdmin);
          
          // Get the user data from the payload
          const tokenUser = payload.user || payload || {};
          
          // Create user object with the ID from token and other data
          const userData = {
            ...tokenUser, // Spread all user data from token
            id: tokenUser.id || tokenUser._id,
            email: tokenUser.email || user?.email,
            firstName: tokenUser.firstName || tokenUser.name || user?.firstName,
            isAdmin: tokenUser.isAdmin, // Use isAdmin directly from token
            profilePicture: tokenUser.profilePicture // Include profile picture
          };
          
          console.log('Setting user data from token:', userData);
          setUser(userData);

          // Fetch latest user data including profile picture
          try {
            const response = await axios.get(`/api/users/profile/${userData.id}`);
            if (response.data.user) {
              setUser(prevUser => ({
                ...prevUser,
                ...response.data.user
              }));
            }
          } catch (err) {
            console.error('Error fetching latest user data:', err);
          }
        }
        setError(null);
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Error loading user');
        logout();
      }
    }
    setLoading(false);
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      setToken(res.data.token);
      setUser(res.data.user);
      setAuthToken(res.data.token);
      setError(null);
      navigate('/');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      console.log('Login API Response:', res.data);
      
      const { token, user: responseUser } = res.data;
      
      if (!responseUser) {
        console.error('No user data in login response');
        throw new Error('Invalid login response');
      }

      console.log('Login - User from response:', responseUser);
      console.log('Login - isAdmin value:', responseUser.isAdmin);
      
      // Set token first
      setToken(token);
      setAuthToken(token);

      // Set complete user data from response
      const userData = {
        ...responseUser,
        isAdmin: responseUser.isAdmin === true // Ensure boolean value
      };

      console.log('Setting user data:', userData);
      setUser(userData);
      
      setError(null);
      navigate('/');
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    navigate('/');
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/users/profile', profileData);
      setUser(res.data.user);
      setError(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/api/users/password', { currentPassword, newPassword });
      setError(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Password update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      await axios.delete('/api/users');
      logout();
      setError(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Account deletion failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update profile picture
  const updateProfilePicture = async (imageUrl) => {
    try {
      setUser(prevUser => ({
        ...prevUser,
        profilePicture: imageUrl
      }));
      return { success: true };
    } catch (err) {
      console.error('Error updating profile picture:', err);
      return { success: false, error: 'Failed to update profile picture' };
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  const value = {
    user: user ? {
      ...user,
      isAdmin: user.isAdmin || false, // Ensure isAdmin is explicitly included
      profilePicture: user.profilePicture // Ensure profile picture is included
    } : null,
    token,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
    deleteAccount,
    updateProfilePicture // Add the new function to context
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 