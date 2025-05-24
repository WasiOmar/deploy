import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const CMS = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      console.log('Fetching stats...');
      try {
        // Fetch users count with auth headers
        console.log('Fetching users...');
        const usersResponse = await axios.get('/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin': 'true'
          }
        });
        console.log('Users response:', usersResponse.data);
        const totalUsers = usersResponse.data.length;

        // Fetch listings count
        console.log('Fetching listings...');
        const listingsResponse = await axios.get('/api/listings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin': 'true'
          }
        });
        console.log('Listings response:', listingsResponse.data);
        const activeListings = listingsResponse.data.length;

        console.log('Setting stats:', { totalUsers, activeListings });
        setStats({
          totalUsers,
          activeListings,
          totalTransactions: '-' // Placeholder for now
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stats:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('Failed to load statistics');
        setLoading(false);
      }
    };

    if (user?.isAdmin) {
      fetchStats();
    }
  }, [user]);

  // If user is not admin, redirect to home page
  if (!user?.isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Central Management System
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Management Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">User Management</h2>
              <p className="text-gray-600 mb-4">Manage user accounts, roles, and permissions</p>
              <Link to="/manage-users" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Manage Users →
              </Link>
            </div>

            {/* Listing Management Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Listing Management</h2>
              <p className="text-gray-600 mb-4">Review, edit, and moderate listings</p>
              <Link
                to="/cms/listings"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Manage Listings →
              </Link>
            </div>

            {/* Reports Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Reports & Analytics</h2>
              <p className="text-gray-600 mb-4">View platform statistics and reports</p>
              <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                View Reports →
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-indigo-600 font-medium">Total Users</p>
                {loading ? (
                  <div className="animate-pulse h-8 bg-indigo-100 rounded w-16"></div>
                ) : error ? (
                  <p className="text-2xl font-bold text-red-600">Error</p>
                ) : (
                  <p className="text-2xl font-bold text-indigo-900">{stats.totalUsers}</p>
                )}
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-indigo-600 font-medium">Active Listings</p>
                {loading ? (
                  <div className="animate-pulse h-8 bg-indigo-100 rounded w-16"></div>
                ) : error ? (
                  <p className="text-2xl font-bold text-red-600">Error</p>
                ) : (
                  <p className="text-2xl font-bold text-indigo-900">{stats.activeListings}</p>
                )}
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-indigo-600 font-medium">Total Transactions</p>
                <p className="text-2xl font-bold text-indigo-900">{stats.totalTransactions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMS; 