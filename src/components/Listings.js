import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || '',
    search: searchParams.get('search') || ''
  });

  // Mock listings data - replace with actual API call
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      // Simulate API call
      const mockListings = [
        {
          id: 1,
          title: 'Calculus Textbook',
          price: 45,
          image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          category: 'Textbooks',
          condition: 'Like New',
          location: 'University Campus',
          description: 'Calculus textbook in excellent condition. Used for one semester only.'
        },
        {
          id: 2,
          title: 'Physics Lab Equipment',
          price: 120,
          image: 'https://images.unsplash.com/photo-1517971071642-34a2d3eccb5e?auto=format&fit=crop&w=500&q=60',
          category: 'Lab Equipment',
          condition: 'Good',
          location: 'Science Building',
          description: 'Complete set of physics lab equipment. Includes all necessary components.'
        },
        {
          id: 3,
          title: 'Organic Chemistry Kit',
          price: 85,
          image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=500&q=60',
          category: 'Lab Equipment',
          condition: 'New',
          location: 'Chemistry Department',
          description: 'Brand new organic chemistry kit. Never used, still in original packaging.'
        }
      ];

      // Apply filters
      let filteredListings = mockListings;
      if (filters.category) {
        filteredListings = filteredListings.filter(
          listing => listing.category.toLowerCase() === filters.category.toLowerCase()
        );
      }
      if (filters.minPrice) {
        filteredListings = filteredListings.filter(
          listing => listing.price >= Number(filters.minPrice)
        );
      }
      if (filters.maxPrice) {
        filteredListings = filteredListings.filter(
          listing => listing.price <= Number(filters.maxPrice)
        );
      }
      if (filters.condition) {
        filteredListings = filteredListings.filter(
          listing => listing.condition.toLowerCase() === filters.condition.toLowerCase()
        );
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredListings = filteredListings.filter(
          listing =>
            listing.title.toLowerCase().includes(searchLower) ||
            listing.description.toLowerCase().includes(searchLower)
        );
      }

      setListings(filteredListings);
      setLoading(false);
    };

    fetchListings();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setSearchParams(prev => {
      if (value) {
        prev.set(name, value);
      } else {
        prev.delete(name);
      }
      return prev;
    });
  };

  const categories = [
    { id: 'textbooks', name: 'Textbooks' },
    { id: 'lab-equipment', name: 'Lab Equipment' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'furniture', name: 'Furniture' },
    { id: 'sports', name: 'Sports' }
  ];

  const conditions = [
    { id: 'new', name: 'New' },
    { id: 'like-new', name: 'Like New' },
    { id: 'good', name: 'Good' },
    { id: 'fair', name: 'Fair' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
              
              {/* Search */}
              <div className="mb-4">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Search listings..."
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Price Range</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="mb-4">
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                  Condition
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={filters.condition}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">All Conditions</option>
                  {conditions.map(condition => (
                    <option key={condition.id} value={condition.id}>
                      {condition.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilters({
                    category: '',
                    minPrice: '',
                    maxPrice: '',
                    condition: '',
                    search: ''
                  });
                  setSearchParams({});
                }}
                className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Listings grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map(listing => (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    className="group"
                  >
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg">
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-full h-full object-center object-cover group-hover:opacity-75"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm text-gray-700">{listing.title}</h3>
                        <p className="mt-1 text-lg font-medium text-gray-900">${listing.price}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm text-gray-500">{listing.condition}</p>
                          <p className="text-sm text-gray-500">{listing.location}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No listings found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Listings; 