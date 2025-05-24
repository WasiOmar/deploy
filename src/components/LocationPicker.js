import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MapContainer from './MapContainer';
import '../styles/map.css';

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
  // Default to Riyadh, Saudi Arabia coordinates
  const defaultLocation = useMemo(() => ({ lat: 24.7136, lng: 46.6753 }), []);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [tempLocation, setTempLocation] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  // Initialize with geolocation
  useEffect(() => {
    let isMounted = true;

    const initLocation = async () => {
      if (!navigator.geolocation || initialLocation) return;

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });

        if (isMounted) {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setSelectedLocation(currentLocation);
          setTempLocation(currentLocation);
        }
      } catch (error) {
        console.error('Geolocation error:', error);
        if (isMounted) {
          setSelectedLocation(defaultLocation);
          setTempLocation(defaultLocation);
        }
      }
    };

    initLocation();

    return () => {
      isMounted = false;
    };
  }, [initialLocation, defaultLocation]);

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

      // Try first with country code
      let response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&countrycodes=sa&limit=5`
      );
      let data = await response.json();

      // If no results, try without country restriction
      if (!data || data.length === 0) {
        response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&limit=5`
        );
        data = await response.json();
      }

      if (data && data.length > 0) {
        const location = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        setSelectedLocation(location);
        setTempLocation(location);
        setMapKey(prev => prev + 1); // Force map refresh
      } else {
        setError('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [searchInput, isSearching]);

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
      <div className="h-[400px] relative rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          key={mapKey}
          location={selectedLocation || tempLocation}
          onLocationSelect={handleLocationSelect}
          draggable={true}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex space-x-4">
        {tempLocation && (
          <button
            type="button"
            onClick={handleConfirmLocation}
            className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Confirm Location
          </button>
        )}
        {selectedLocation && (
          <button
            type="button"
            onClick={handleResetLocation}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset Location
          </button>
        )}
      </div>

      {(selectedLocation || tempLocation) && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            {selectedLocation ? 'Selected' : 'Temporary'} location: {(selectedLocation || tempLocation).lat.toFixed(6)}, {(selectedLocation || tempLocation).lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker; 