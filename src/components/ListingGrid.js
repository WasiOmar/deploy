import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ListingCard from './ListingCard';

const ListingGrid = ({ filters }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filteredListings, setFilteredListings] = useState([]);

  // Expanded listings data with at least one for each category (1-8)
  const listings = [
    // 1: Textbooks
    {
      id: 1,
      title: 'Calculus Textbook',
      price: 45,
      image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '1',
      description: 'Like new condition, used for one semester',
      listingType: 'tangible',
      pricing: 'flat',
      visibility: 'university',
      condition: 'Like New',
      location: 'Main Campus',
      postedDate: '2024-03-15',
      urgent: false
    },
    {
      id: 11,
      title: 'Physics Textbook',
      price: 50,
      image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=60',
      category: '1',
      description: 'Physics for Scientists and Engineers, 3rd Edition',
      listingType: 'tangible',
      pricing: 'flat',
      visibility: 'all',
      condition: 'Good',
      location: 'Library',
      postedDate: '2024-03-13',
      urgent: false
    },
    // 2: Electronics
    {
      id: 2,
      title: 'MacBook Pro 2019',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '2',
      description: 'Excellent condition, comes with original box',
      listingType: 'tangible',
      pricing: 'bidding',
      visibility: 'all',
      condition: 'Used',
      location: 'City Center',
      postedDate: '2024-03-10',
      urgent: true
    },
    {
      id: 12,
      title: 'Bluetooth Headphones',
      price: 80,
      image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=500&q=60',
      category: '2',
      description: 'Noise-cancelling, wireless, black',
      listingType: 'tangible',
      pricing: 'flat',
      visibility: 'university',
      condition: 'Like New',
      location: 'Dormitory',
      postedDate: '2024-03-16',
      urgent: false
    },
    // 3: Furniture
    {
      id: 3,
      title: 'Office Chair',
      price: 80,
      image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '3',
      description: 'Ergonomic office chair, barely used',
      listingType: 'tangible',
      pricing: 'flat',
      visibility: 'university',
      condition: 'Good',
      location: 'North Campus',
      postedDate: '2024-03-12',
      urgent: false
    },
    {
      id: 13,
      title: 'Study Desk',
      price: 60,
      image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=500&q=60',
      category: '3',
      description: 'Wooden desk, perfect for students',
      listingType: 'tangible',
      pricing: 'flat',
      visibility: 'all',
      condition: 'Used',
      location: 'South Campus',
      postedDate: '2024-03-11',
      urgent: false
    },
    // 4: Sports
    {
      id: 14,
      title: 'Basketball',
      price: 25,
      image: 'https://images.unsplash.com/photo-1546519638-68e109acd27b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '4',
      description: 'Official size and weight, good condition',
      listingType: 'tangible',
      pricing: 'flat',
      visibility: 'all',
      condition: 'Good',
      location: 'Sports Complex',
      postedDate: '2024-03-09',
      urgent: false
    },
    {
      id: 15,
      title: 'Tennis Racket',
      price: 40,
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=500&q=60',
      category: '4',
      description: 'Wilson Pro Staff, lightly used',
      listingType: 'tangible',
      pricing: 'flat',
      visibility: 'university',
      condition: 'Like New',
      location: 'Sports Complex',
      postedDate: '2024-03-08',
      urgent: false
    },
    // 5: Musical Instruments
    {
      id: 5,
      title: 'Guitar Lessons',
      price: 30,
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '5',
      description: 'Skill exchange: guitar lessons for language practice',
      listingType: 'skill',
      pricing: 'hourly',
      visibility: 'university',
      condition: 'N/A',
      location: 'Music Room',
      postedDate: '2024-03-17',
      urgent: false
    },
    {
      id: 16,
      title: 'Acoustic Guitar',
      price: 350,
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '5',
      description: 'Yamaha acoustic guitar, includes case',
      listingType: 'tangible',
      pricing: 'flat',
      visibility: 'all',
      condition: 'Used',
      location: 'Music Room',
      postedDate: '2024-03-07',
      urgent: false
    },
    // 6: Art Supplies
    {
      id: 6,
      title: 'Art Supplies Set',
      price: 75,
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '6',
      description: 'Complete set of professional art supplies',
      listingType: 'tangible',
      pricing: 'flat',
      visibility: 'all',
      condition: 'New',
      location: 'Art Studio',
      postedDate: '2024-03-14',
      urgent: true
    },
    {
      id: 17,
      title: 'Watercolor Paints',
      price: 20,
      image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=500&q=60',
      category: '6',
      description: '24-color set, barely used',
      listingType: 'tangible',
      pricing: 'flat',
      visibility: 'university',
      condition: 'Like New',
      location: 'Art Studio',
      postedDate: '2024-03-13',
      urgent: false
    },
    // 7: Lab Equipment
    {
      id: 18,
      title: 'Microscope',
      price: 200,
      image: 'https://images.unsplash.com/photo-1517971071642-34a2d3eccb5e?auto=format&fit=crop&w=500&q=60',
      category: '7',
      description: 'Compound microscope, 1000x magnification',
      listingType: 'tangible',
      pricing: 'flat',
      visibility: 'all',
      condition: 'Good',
      location: 'Science Lab',
      postedDate: '2024-03-06',
      urgent: false
    },
    {
      id: 19,
      title: 'Lab Coat',
      price: 15,
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=500&q=60',
      category: '7',
      description: 'White, size M, never used',
      listingType: 'tangible',
      pricing: 'flat',
      visibility: 'university',
      condition: 'New',
      location: 'Science Lab',
      postedDate: '2024-03-05',
      urgent: false
    },
    // 8: Stationery
    {
      id: 20,
      title: 'Stationery Bundle',
      price: 10,
      image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=500&q=60',
      category: '8',
      description: 'Pens, pencils, highlighters, sticky notes',
      listingType: 'tangible',
      pricing: 'flat',
      visibility: 'all',
      condition: 'New',
      location: 'Bookstore',
      postedDate: '2024-03-04',
      urgent: false
    },
    {
      id: 21,
      title: 'Graph Paper Pads',
      price: 5,
      image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=500&q=60',
      category: '8',
      description: 'Pack of 5, A4 size',
      listingType: 'tangible',
      pricing: 'flat',
      visibility: 'university',
      condition: 'New',
      location: 'Bookstore',
      postedDate: '2024-03-03',
      urgent: false
    },
    // Tutoring/Skill Exchange for demo
    {
      id: 22,
      title: 'Math Tutoring',
      price: 20,
      image: 'https://images.unsplash.com/photo-1546519638-68e109acd27b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '1',
      description: 'Tutoring for calculus and algebra',
      listingType: 'tutoring',
      pricing: 'hourly',
      visibility: 'all',
      condition: 'N/A',
      location: 'Online',
      postedDate: '2024-03-18',
      urgent: false
    },
    {
      id: 23,
      title: 'Language Exchange',
      price: 0,
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '5',
      description: 'Skill exchange: English for Spanish',
      listingType: 'skill',
      pricing: 'hourly',
      visibility: 'all',
      condition: 'N/A',
      location: 'Online',
      postedDate: '2024-03-17',
      urgent: false
    }
  ];

  useEffect(() => {
    const filterListings = () => {
      return listings.filter(listing => {
        // Search query
        if (filters.searchQuery && !listing.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) && !listing.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
          return false;
        }
        // Category
        if (filters.category && listing.category !== filters.category) {
          return false;
        }
        // Price range
        if (filters.priceRange) {
          const [min, max] = filters.priceRange.split('-').map(Number);
          if (max) {
            if (listing.price < min || listing.price > max) {
              return false;
            }
          } else {
            if (listing.price < min) {
              return false;
            }
          }
        }
        // Listing Type
        if (filters.listingType && listing.listingType !== filters.listingType) {
          return false;
        }
        // Pricing
        if (filters.pricing && listing.pricing !== filters.pricing) {
          return false;
        }
        // Visibility
        if (filters.visibility && listing.visibility !== filters.visibility) {
          return false;
        }
        // Condition
        if (filters.condition && listing.condition !== filters.condition) {
          return false;
        }
        // Location
        if (filters.location && !listing.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
        // Posted Date (filter by recent days)
        if (filters.postedWithinDays) {
          const daysAgo = parseInt(filters.postedWithinDays, 10);
          const postedDate = new Date(listing.postedDate);
          const now = new Date();
          const diffDays = (now - postedDate) / (1000 * 60 * 60 * 24);
          if (diffDays > daysAgo) {
            return false;
          }
        }
        // Urgent
        if (filters.urgent && !listing.urgent) {
          return false;
        }
        // Min/Max Price
        if (filters.minPrice && listing.price < Number(filters.minPrice)) {
          return false;
        }
        if (filters.maxPrice && listing.price > Number(filters.maxPrice)) {
          return false;
        }
        return true;
      });
    };
    setFilteredListings(filterListings());
  }, [filters]);

  const handleListingClick = (listingId) => {
    sessionStorage.setItem('previousFilters', JSON.stringify(filters));
    navigate(`/listing/${listingId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map(listing => (
          <div key={listing.id} onClick={() => handleListingClick(listing.id)} className="cursor-pointer">
            <ListingCard
              title={listing.title}
              price={listing.price}
              image={listing.image}
              description={listing.description}
            />
          </div>
        ))}
      </div>
      {filteredListings.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No listings found</h3>
          <p className="mt-2 text-sm text-gray-500">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  );
};

export default ListingGrid; 