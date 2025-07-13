'use client';

import React, { useState, useEffect } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import Markers from "./Markers";
import { fetchHygieneScores } from "../utils/fetchHygieneScores";

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

interface GMapViewProps {
  searchResults: SearchResult[];
  userLocation: UserLocation | null;
  selectedMarker: Marker | null;
  setSelectedMarker: (marker: Marker | null) => void;
  setIsSearching: (searching: boolean) => void;
}

const GMapView: React.FC<GMapViewProps> = ({
  searchResults,
  userLocation,
  selectedMarker,
  setSelectedMarker,
  setIsSearching
}) => {
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapsID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  // State for markers (array of places)
  const [markers, setMarkers] = useState<Marker[]>([]);

  // 1) Transform searchResults and fetch hygiene scores
  useEffect(() => {
    if (!searchResults || searchResults.length === 0) {
      setMarkers([]);
      return;
    }

    (async () => {
      const transformed: Marker[] = searchResults.map((place) => ({
        id: place.id,
        key: place.id, // consistent unique key
        name: place.displayName?.text || "Unknown",
        address: place.formattedAddress || "No Address Available",
        position: {
          lat: place.location.latitude,
          lng: place.location.longitude
        },
        addressComponents: place.addressComponents ?? [],
        rating: null
      }));

      try {
        const scores = await fetchHygieneScores(transformed);

        // Merge new rating info
        const merged: Marker[] = scores.map((item: any) => ({
          ...item,
          rating: item ? item.rating_value_str : null
        }));

        setMarkers(merged);
      } catch (error) {
        console.error("Error fetching hygiene scores:", error);
        // fallback - show base markers even if scores fail
        setMarkers(transformed);
      }
      // Once search is done, set isSearching to false
      setIsSearching(false);
    })();
  }, [searchResults, setIsSearching]);

  // 2) Map fallback centre (London)
  const defaultCenter = { lat: 51.5074, lng: -0.1278 };

  // 4) Imperatively pan the map to userLocation if it changes
  useEffect(() => {
    if (!userLocation?.lat || !userLocation.lng) return;
    // Note: We'll handle map panning through the Markers component
  }, [userLocation]);

  // 5) Close InfoWindow when clicking map background
  const handleMapClick = () => {
    setSelectedMarker(null);
  };

  // 6) Return the Map
  return (
    <div className="map-container">
      <APIProvider apiKey={mapsApiKey || ""}>
        <Map
          // The map is uncontrolled regarding centre/zoom
          defaultZoom={13}
          defaultCenter={defaultCenter}
          className="google-map"
          mapId={mapsID || null}
          onClick={handleMapClick}
        >
          {/* Pass 'markers' array to child, so it can render them */}
          <Markers
            places={markers}
            selectedMarker={selectedMarker}
            setSelectedMarker={setSelectedMarker}
            setIsSearching={setIsSearching}
          />
        </Map>
      </APIProvider>
    </div>
  );
};

export default GMapView; 