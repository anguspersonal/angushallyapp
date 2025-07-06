import React, { useEffect, useCallback } from "react";
import { useMap, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Marker } from '@googlemaps/markerclusterer';

const Markers = ({
  places,
  selectedMarker,
  setSelectedMarker,
  isSearching,
  setIsSearching
}) => {
  const map = useMap();

  // Refit the map bounds whenever `places` changes
  useEffect(() => {
    if (!map) return;
    if (!Array.isArray(places) || places.length === 0) {
      // Optionally do something if no places exist
      return;
    }

    // Close any open InfoWindow
    setSelectedMarker(null);

    // Fit bounds around all marker positions
    const bounds = new window.google.maps.LatLngBounds();
    places.forEach((p) => {
      if (p.position?.lat && p.position?.lng) {
        bounds.extend(p.position);
      }
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);

      // If there's only one marker, zoom in a bit
      if (places.length === 1) {
        map.setZoom(15);
      }
    }

    // Indicate search is done
    setIsSearching(false);
  }, [map, places, setSelectedMarker, setIsSearching]);

  // Handle marker clicks: pan to marker, open InfoWindow
  const handleMarkerClick = useCallback((e, place) => {
    if (!map) return;
    // e.stopPropagation();
    if (place.position) map.panTo(place.position);
    setSelectedMarker(place);
  }, [map, setSelectedMarker]);

  // If the map is not ready, render nothing
  if (!map) return null;

  return (
    <>
      {/* Generate a marker for each place */}
      {places.map((place) => (
        <AdvancedMarker
          key={place.place_id}
          position={place.position}
          onClick={(e) => handleMarkerClick(e, place)}
        >
          <Pin background="#FBBC04" glyphColor="#000" borderColor="#000" />
        </AdvancedMarker>
      ))}

      {/* Conditionally display the InfoWindow for the selected marker */}
      {selectedMarker && (
        <InfoWindow
          position={selectedMarker.position}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="info-window-content">
            <h3>{selectedMarker.name || "No Name"}</h3>
            <p>{selectedMarker.address || "No Address Available"}</p>
            <p>
              <strong>Hygiene Rating:</strong>{" "}
              {selectedMarker.rating ? `${selectedMarker.rating}/5` : "N/A"}
            </p>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default Markers;
