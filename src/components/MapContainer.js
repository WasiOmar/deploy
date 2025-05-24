import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapContainer = ({ location, onLocationSelect, draggable = false }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const containerIdRef = useRef(`map-${Math.random().toString(36).substr(2, 9)}`);

  // Cleanup function
  const cleanupMap = () => {
    try {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  // Initialize map after component is mounted
  useEffect(() => {
    setIsReady(true);
    return () => {
      cleanupMap();
    };
  }, []);

  // Handle map creation and updates
  useEffect(() => {
    if (!isReady || !mapRef.current || !location) {
      return;
    }

    let isMounted = true;

    const initializeMap = () => {
      try {
        // Clean up existing map instance
        cleanupMap();

        // Set unique ID for the container
        mapRef.current.id = containerIdRef.current;

        // Create map instance with better defaults
        const map = L.map(mapRef.current, {
          center: [location.lat, location.lng],
          zoom: 13,
          zoomControl: true,
          attributionControl: true,
          tap: false,
          maxZoom: 18,
          minZoom: 3,
          scrollWheelZoom: true,
          doubleClickZoom: false,
          zoomAnimation: false,
          fadeAnimation: false,
          markerZoomAnimation: false,
          preferCanvas: true
        });

        // Add tile layer
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18
        }).addTo(map);

        // Create marker
        const marker = L.marker([location.lat, location.lng], {
          draggable: draggable
        }).addTo(map);

        // Store references only if component is still mounted
        if (isMounted) {
          mapInstanceRef.current = map;
          markerRef.current = marker;
        }

        // Set up event handlers for marker drag
        if (draggable && onLocationSelect) {
          marker.on('dragstart', () => {
            if (map && map.off) {
              map.off('click');
            }
          });

          marker.on('dragend', () => {
            if (!isMounted) return;
            
            const position = marker.getLatLng();
            if (onLocationSelect && position) {
              onLocationSelect({
                lat: position.lat,
                lng: position.lng
              });
            }

            // Re-enable map click
            if (map && map.on) {
              setupMapClick(map, marker);
            }
          });

          // Handle double click on map
          map.on('dblclick', (e) => {
            if (!isMounted) return;

            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();
            
            const newLocation = e.latlng;
            if (marker && marker.setLatLng && onLocationSelect) {
              marker.setLatLng(newLocation);
              onLocationSelect({
                lat: newLocation.lat,
                lng: newLocation.lng
              });
            }
          });

          // Initial setup of map click
          setupMapClick(map, marker);
        }

        // Handle window resize
        const handleResize = () => {
          if (isMounted && map && map.invalidateSize) {
            map.invalidateSize({ animate: false });
          }
        };

        window.addEventListener('resize', handleResize);

        // Initial size update
        setTimeout(() => {
          if (isMounted && map && map.invalidateSize) {
            map.invalidateSize({ animate: false });
          }
        }, 250);

        if (isMounted) {
          setMapError(null);
        }

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMounted) {
          setMapError('Failed to initialize map. Please try refreshing the page.');
        }
      }
    };

    // Helper function to setup map click handler
    const setupMapClick = (map, marker) => {
      if (!map || !marker || !map.on) return;

      map.on('click', (e) => {
        if (!isMounted) return;

        const latlng = e.latlng;
        if (marker && marker.setLatLng && onLocationSelect) {
          marker.setLatLng(latlng);
          onLocationSelect({
            lat: latlng.lat,
            lng: latlng.lng
          });
        }
      });
    };

    // Initialize map
    initializeMap();

    return () => {
      isMounted = false;
      cleanupMap();
    };
  }, [isReady, location, onLocationSelect, draggable]);

  // Update marker position when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !location) {
      return;
    }

    try {
      const map = mapInstanceRef.current;
      const marker = markerRef.current;

      if (marker && marker.setLatLng) {
        marker.setLatLng([location.lat, location.lng]);
      }

      if (map && map.setView) {
        map.setView([location.lat, location.lng], map.getZoom(), {
          animate: false
        });
      }
    } catch (error) {
      console.error('Error updating marker position:', error);
      setMapError('Failed to update location. Please try refreshing the page.');
    }
  }, [location]);

  return (
    <div className={`form-map-container ${!isReady ? 'bg-gray-100' : ''}`}>
      <div
        ref={mapRef}
        className="leaflet-container"
        style={{
          width: '100%',
          height: '400px',
          backgroundColor: '#f0f0f0',
          borderRadius: '0.5rem'
        }}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-75 z-10">
          <div className="text-red-600 text-center px-4">
            <p>{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
      {draggable && (
        <div className="absolute bottom-2 left-2 bg-white px-3 py-1 rounded-md shadow-md text-sm text-gray-600 z-[1000]">
          Click or double-click on map to select location, or drag the marker
        </div>
      )}
    </div>
  );
};

export default MapContainer;