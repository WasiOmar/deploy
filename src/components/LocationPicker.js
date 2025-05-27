import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MapContainer from './MapContainer';
import '../styles/map.css';

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
  // Default to a more neutral location (0,0) if geolocation fails
  const defaultLocation = useMemo(() => ({ lat: 0, lng: 0 }), []);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [tempLocation, setTempLocation] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [mapKey, setMapKey] = useState(0);

  // Initialize with geolocation
  useEffect(() => {
    let isMounted = true;

    const initLocation = async () => {
      if (initialLocation) {
        setSelectedLocation(initialLocation);
        return;
      }

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        if (isMounted) {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('Got current location:', currentLocation);
          setSelectedLocation(currentLocation);
          setTempLocation(currentLocation);
          if (onLocationSelect) {
            onLocationSelect(currentLocation);
          }
        }
      } catch (error) {
        console.error('Geolocation error:', error);
        if (isMounted) {
          // Try IP-based geolocation as fallback
          try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data.latitude && data.longitude) {
              const ipLocation = {
                lat: data.latitude,
                lng: data.longitude
              };
              console.log('Got IP location:', ipLocation);
              setSelectedLocation(ipLocation);
              setTempLocation(ipLocation);
              if (onLocationSelect) {
                onLocationSelect(ipLocation);
              }
            } else {
              throw new Error('No location data');
            }
          } catch (ipError) {
            console.error('IP geolocation error:', ipError);
            setSelectedLocation(defaultLocation);
            setTempLocation(defaultLocation);
          }
        }
      }
    };

    initLocation();

    return () => {
      isMounted = false;
    };
  }, [initialLocation, defaultLocation, onLocationSelect]);

  // Handle location search
  const handleSearch = useCallback(async () => {
    if (!searchInput.trim() || isSearching) return;

    try {
      setIsSearching(true);
      setError(null);

      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [searchInput, ...prev.slice(0, 4)];
        return [...new Set(newHistory)];
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&limit=5`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const location = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        setSelectedLocation(location);
        setTempLocation(location);
        if (onLocationSelect) {
          onLocationSelect(location);
        }
        setMapKey(prev => prev + 1);
      } else {
        setError('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [searchInput, isSearching, onLocationSelect]);

  const handleLocationSelect = (location) => {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      setError('Invalid location selected');
      return;
    }
    setError(null);
    setTempLocation(location);
  };

  const handleSearchHistoryClick = useCallback((searchTerm) => {
    setSearchInput(searchTerm);
    handleSearch();
  }, [handleSearch]);

  const handleConfirmLocation = () => {
    if (!tempLocation) {
      setError('Please select a location first');
      return;
    }
    setSelectedLocation(tempLocation);
    onLocationSelect(tempLocation);
    setTempLocation(null);
  };

  const handleResetLocation = () => {
    setSelectedLocation(null);
    setTempLocation(null);
    onLocationSelect(null);
    setError(null);
  };

  const handleMapError = useCallback(() => {
    console.log('Resetting map...');
    setMapKey(prev => prev + 1);
    setError(null);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for a location..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="h-[400px] relative rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          key={mapKey}
          location={selectedLocation || tempLocation || defaultLocation}
          onLocationSelect={(loc) => {
            setTempLocation(loc);
            onLocationSelect(loc);
          }}
          draggable={true}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {searchHistory.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Recent searches:</p>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchInput(term);
                  handleSearch();
                }}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {(selectedLocation || tempLocation) && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Selected location: {(selectedLocation || tempLocation).lat.toFixed(6)}, {(selectedLocation || tempLocation).lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker; 