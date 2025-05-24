import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const ListingManagement = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const { user } = useAuth();  // Get the auth context

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        console.log('Attempting to fetch listings...');
        const response = await axios.get('/api/listings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin': 'true'
          }
        });
        console.log('Listings response:', response.data);
        setListings(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error details:', {
          message: err.message,
          response: err.response,
          status: err.response?.status,
          data: err.response?.data
        });
        setError(
          err.response?.data?.message || 
          err.response?.data?.error || 
          'Failed to fetch listings. Please try again later.'
        );
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Handle listing deletion
  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        setLoading(true);
        console.log('Attempting to delete listing:', listingId);
        
        // Simplified delete request
        await axios.delete(`/api/listings/${listingId}`);
        
        // Update UI after successful deletion
        setListings(prevListings => prevListings.filter(listing => listing._id !== listingId));
        setLoading(false);
      } catch (err) {
        console.error('Delete failed:', err.message);
        setError('Failed to delete listing. Please try again.');
        setLoading(false);
      }
    }
  };

  // Handle listing edit
  const handleEditListing = (listingId) => {
    const listingToEdit = listings.find(listing => listing._id === listingId);
    setEditingListing({
      ...listingToEdit,
      status: listingToEdit.status || 'Available',
      condition: listingToEdit.condition || 'new'
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    let updateData = null;
    try {
      // Preserve all existing fields and update only what changed
      updateData = {
        ...editingListing,
        title: editingListing.title,
        price: Number(editingListing.price),
        category: editingListing.category,
        condition: editingListing.condition,
        status: editingListing.status,
        description: editingListing.description || '',
        location: editingListing.location || '',
        images: editingListing.images || [],
        user: editingListing.user?._id || editingListing.user,
        approved: editingListing.approved // Preserve approval status
      };

      // Remove fields that shouldn't be sent
      delete updateData._id;
      delete updateData.__v;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      console.log('Sending update data:', updateData);
      
      const response = await axios.put(`/api/listings/${editingListing._id}`, updateData);
      console.log('Server response:', response.data);
      
      // Update UI after successful edit
      setListings(prevListings => 
        prevListings.map(listing => 
          listing._id === editingListing._id ? response.data : listing
        )
      );
      
      setEditingListing(null);
    } catch (err) {
      console.error('Update failed:', {
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
        sentData: updateData
      });
      setError(`Failed to update listing: ${err.response?.data?.message || err.message}`);
    }
  };

  // Define valid options
  const statusOptions = [
    { value: 'Available', label: 'Available' },
    { value: 'Sold', label: 'Sold' },
    { value: 'Suspended', label: 'Suspended' }
  ];

  const conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  // Handle approve/reject listing
  const handleApprovalToggle = async (listingId, currentApproval) => {
    try {
      const response = await axios.patch(`/api/listings/${listingId}/approval`, {
        approved: !currentApproval
      });
      
      // Update the listings state with the updated listing
      setListings(prevListings => 
        prevListings.map(listing => 
          listing._id === listingId ? { ...listing, approved: !currentApproval } : listing
        )
      );
    } catch (err) {
      console.error('Failed to update approval status:', err);
      setError('Failed to update approval status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-xl font-semibold text-gray-900">Manage Listings</h1>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listings.map(listing => (
                    <tr key={listing._id}>
                      {editingListing && editingListing._id === listing._id ? (
                        // Edit mode
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={editingListing.title}
                              onChange={(e) => setEditingListing({...editingListing, title: e.target.value})}
                              className="border rounded px-2 py-1 text-sm w-full"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={editingListing.price}
                              onChange={(e) => setEditingListing({...editingListing, price: e.target.value})}
                              className="border rounded px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={editingListing.category}
                              onChange={(e) => setEditingListing({...editingListing, category: e.target.value})}
                              className="border rounded px-2 py-1 text-sm"
                            >
                              <option value="Books">Books</option>
                              <option value="Electronics">Electronics</option>
                              <option value="Furniture">Furniture</option>
                              <option value="Clothing">Clothing</option>
                              <option value="Other">Other</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={editingListing.condition}
                              onChange={(e) => setEditingListing({...editingListing, condition: e.target.value})}
                              className="border rounded px-2 py-1 text-sm"
                            >
                              {conditionOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{listing.user?.firstName} {listing.user?.lastName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={editingListing.status}
                              onChange={(e) => setEditingListing({...editingListing, status: e.target.value})}
                              className="border rounded px-2 py-1 text-sm"
                            >
                              {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${listing.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                              >
                                {listing.approved ? 'Approved' : 'Pending'}
                              </span>
                              <button
                                onClick={() => handleApprovalToggle(listing._id, listing.approved)}
                                className={`ml-2 px-3 py-1 text-xs rounded-full font-medium
                                  ${listing.approved 
                                    ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                              >
                                {listing.approved ? 'Revoke' : 'Approve'}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingListing(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        // View mode
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${listing.price}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{listing.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{listing.condition}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{listing.user?.firstName} {listing.user?.lastName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${listing.status === 'active' ? 'bg-green-100 text-green-800' : 
                                listing.status === 'sold' ? 'bg-gray-100 text-gray-800' : 
                                'bg-red-100 text-red-800'}`}
                            >
                              {listing.status?.charAt(0).toUpperCase() + listing.status?.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${listing.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                              >
                                {listing.approved ? 'Approved' : 'Pending'}
                              </span>
                              <button
                                onClick={() => handleApprovalToggle(listing._id, listing.approved)}
                                className={`ml-2 px-3 py-1 text-xs rounded-full font-medium
                                  ${listing.approved 
                                    ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                              >
                                {listing.approved ? 'Revoke' : 'Approve'}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditListing(listing._id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteListing(listing._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingManagement; 