import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('my-listings');

  // Mock listings data - replace with actual data from your backend
  const listings = [
    {
      id: 1,
      title: 'MacBook Pro 2020',
      price: 1200,
      category: 'Electronics',
      status: 'active',
      createdAt: '2024-03-15'
    },
    {
      id: 2,
      title: 'Calculus Textbook',
      price: 50,
      category: 'Books',
      status: 'sold',
      createdAt: '2024-03-10'
    }
  ];

  // Mock saved listings data - replace with actual data from your backend
  const savedListings = [
    {
      id: 3,
      title: 'Organic Chemistry Kit',
      price: 85,
      seller: 'Jane Smith',
      createdAt: '2024-03-12'
    },
    {
      id: 4,
      title: 'Engineering Drawing Set',
      price: 35,
      seller: 'Mike Johnson',
      createdAt: '2024-03-14'
    }
  ];

  const renderMyListings = () => (
    <div className="space-y-6">
      {listings.map(listing => (
        <div key={listing.id} className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{listing.title}</h3>
              <p className="mt-1 text-sm text-gray-500">Posted on {listing.createdAt}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {listing.status}
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-lg font-medium text-gray-900">${listing.price}</p>
            <div className="flex space-x-3">
              <Link
                to={`/edit-listing/${listing.id}`}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Edit
              </Link>
              <button
                onClick={() => {
                  // Here you would typically handle listing deletion
                  console.log('Deleting listing:', listing.id);
                }}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
      <Link
        to="/create-listing"
        className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create New Listing
      </Link>
    </div>
  );

  const renderSavedListings = () => (
    <div className="space-y-6">
      {savedListings.map(listing => (
        <div key={listing.id} className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{listing.title}</h3>
              <p className="mt-1 text-sm text-gray-500">Posted by {listing.seller}</p>
            </div>
            <p className="text-lg font-medium text-gray-900">${listing.price}</p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">Saved on {listing.createdAt}</p>
            <div className="flex space-x-3">
              <Link
                to={`/listing/${listing.id}`}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                View Details
              </Link>
              <button className="text-sm text-red-600 hover:text-red-500">
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* Profile sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl font-medium text-gray-500">
                    {/* Initials will be added when user data is available */}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-medium text-gray-900">Welcome!</h2>
                  <p className="text-sm text-gray-500">Please complete your profile</p>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  to="/profile"
                  className="w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Complete Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="mt-8 lg:mt-0 lg:col-span-8">
            <div className="bg-white shadow rounded-lg">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('my-listings')}
                    className={`${
                      activeTab === 'my-listings'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                  >
                    My Listings
                  </button>
                  <button
                    onClick={() => setActiveTab('saved')}
                    className={`${
                      activeTab === 'saved'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                  >
                    Saved Listings
                  </button>
                </nav>
              </div>

              {/* Tab content */}
              <div className="p-6">
                {activeTab === 'my-listings' ? renderMyListings() : renderSavedListings()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 