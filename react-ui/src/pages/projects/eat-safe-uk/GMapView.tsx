// @ts-nocheck - Complex Google Maps view component with dynamic map rendering and location services that TypeScript cannot properly infer
import React, { useState, useEffect, useRef } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import "../../../index.css";
import "./EatSafeUK.css";
import Markers from "./Markers"; // ✅ Import modular Markers component
import { fetchHygieneScores } from "./utils/fetchHygieneScores";
// import { testPlaces } from "./utils/markerTestPlaces"; // if needed

const GMapView = ({ searchResults, userLocation, selectedMarker, setSelectedMarker, isSearching, setIsSearching }) => {
  const mapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const mapsID = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID;

  // State for markers (array of places)
  const [markers, setMarkers] = useState([]);


  // 1) Transform searchResults and fetch hygiene scores
  useEffect(() => {
    if (!searchResults || searchResults.length === 0) {
      setMarkers([]);
      return;
    }

    (async () => {
      const transformed = searchResults.map((place) => ({
        id: place.id,
        key: place.id, // consistent unique key
        name: place.displayName?.text || "Unknown",
        address: place.formattedAddress || "No Address Available",
        position: {
          lat: place.location.latitude,
          lng: place.location.longitude
        },
        addressComponents: place.addressComponents,
        rating: null
      }));

      try {
        const scores = await fetchHygieneScores(transformed);
        // console.log("scores:", scores);

        // Merge new rating info
        const merged = scores.map((item) => ({
          ...item,
          rating: item ? item.rating_value_str : null
        }));

        // console.log("merged:", merged);
        setMarkers(merged);
      } catch (error) {
        console.error("Error fetching hygiene scores:", error);
        // fallback - show base markers even if scores fail
        setMarkers(transformed);
      }
      // Once search is done, set isSearching to false
      setIsSearching(false);
    })();
  }, [searchResults]);

  // 2) Map fallback centre (London)
  const defaultCenter = { lat: 51.5074, lng: -0.1278 };

  // 3) We store a ref to the map instance
  const mapRef = useRef(null);

  // 4) Imperatively pan the map to userLocation if it changes
  useEffect(() => {
    if (!userLocation?.lat || !userLocation.lng) return;
    if (mapRef.current) {
      // Pan the map to the user location
      mapRef.current.panTo({
        lat: userLocation.lat,
        lng: userLocation.lng
      });
    }
  }, [userLocation]);

  // 5) Close InfoWindow when clicking map background
  const handleMapClick = () => {
    setSelectedMarker(null);
  };

  // 6) Return the Map
  return (
    <div className="map-container">
      <APIProvider apiKey={mapsApiKey}>
        <Map
          // The map is uncontrolled regarding centre/zoom
          defaultZoom={13}
          defaultCenter={defaultCenter}
          className="google-map"
          mapId={mapsID}
          onClick={handleMapClick}
          ref={mapRef} // capture the map instance
        >
          {/* Pass 'markers' array to child, so it can render them */}
          <Markers
            places={markers}
            selectedMarker={selectedMarker}
            setSelectedMarker={setSelectedMarker}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
          />
        </Map>
      </APIProvider>
    </div>
  );
};

export default GMapView;
