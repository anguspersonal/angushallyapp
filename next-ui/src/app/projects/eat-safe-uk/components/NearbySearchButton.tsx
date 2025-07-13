'use client';

import { performNearbySearch } from "../utils/nearbySearch";
import { askUserLocation } from "../utils/askUserLocation";

interface SearchResult {
  id: string;
  displayName?: {
    text: string;
  };
  formattedAddress?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  addressComponents?: Array<{
    types: string[];
    shortText: string;
  }>;
}

interface UserLocation {
  lat: number;
  lng: number;
}

interface Marker {
  id: string;
  key: string;
  name: string;
  address: string;
  position: {
    lat: number;
    lng: number;
  };
  addressComponents?: Array<{
    types: string[];
    shortText: string;
  }>;
  rating: string | null;
}

interface NearbySearchButtonProps {
  setSearchResults: (results: SearchResult[]) => void;
  setUserLocation: (location: UserLocation | null) => void;
  setUserLocationPermission?: (permission: boolean) => void;
  setUserSearched?: (searched: boolean) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  selectedMarker: Marker | null;
  setSelectedMarker: (marker: Marker | null) => void;
}

const NearbySearchButton: React.FC<NearbySearchButtonProps> = ({
  setSearchResults,
  setUserLocation,
  setUserLocationPermission,
  setUserSearched,
  isSearching,
  setIsSearching,
  selectedMarker: _selectedMarker,
  setSelectedMarker
}) => {
  // Handle nearby search when user clicks button
  const handleNearbySearch = async () => {
    try {
      askUserLocation((location) => {
        if (location) {
          setUserLocation(location);
          if (setUserLocationPermission) setUserLocationPermission(true);
          if (setUserSearched) setUserSearched(true);
          setIsSearching(true);
          setSelectedMarker(null);

          // Perform nearby search
          performNearbySearch(location, setSearchResults);
        } else {
          if (setUserLocationPermission) setUserLocationPermission(false);
        }
      });
    } catch (error) {
      console.error("Error in nearby search:", error);
    }
  };

  return (
    <button
      onClick={!isSearching ? handleNearbySearch : undefined}
      disabled={isSearching}
      className="search-button"
    >
      Find Nearby Places
    </button>
  );
};

export default NearbySearchButton; 